#!/usr/bin/env python3
"""Command-line interface for CV Filler Agent."""
import asyncio
import json
import sys
from pathlib import Path
from typing import Optional

import click
from loguru import logger

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.services.cv_agent import CVFillerAgent
from src.models.cv_schema import CVData
from src.core.config import settings


@click.group()
@click.option('--debug', is_flag=True, help='Enable debug logging')
def cli(debug: bool):
    """Rolevate CV Filler Agent - CLI Tool"""
    if debug:
        logger.remove()
        logger.add(sys.stderr, level="DEBUG")
    else:
        logger.remove()
        logger.add(sys.stderr, level="INFO")


@cli.command()
@click.option('--input', '-i', 'input_file', required=True, type=click.Path(exists=True), help='Input CV file')
@click.option('--output', '-o', 'output_file', type=click.Path(), help='Output JSON file')
@click.option('--enhance', is_flag=True, help='Enhance CV data with AI')
def extract(input_file: str, output_file: Optional[str], enhance: bool):
    """Extract structured data from CV."""
    async def run():
        agent = CVFillerAgent()
        
        logger.info(f"Extracting data from: {input_file}")
        cv_data = await agent.extract_only(input_file, enhance=enhance)
        
        # Determine output file
        if output_file is None:
            input_path = Path(input_file)
            output_path = input_path.with_suffix('.json')
        else:
            output_path = Path(output_file)
        
        # Save to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(cv_data.model_dump_json(indent=2))
        
        logger.success(f"CV data extracted and saved to: {output_path}")
        click.echo(f"\n✓ Extraction complete: {output_path}")
    
    asyncio.run(run())


@cli.command()
@click.option('--data', '-d', 'data_file', required=True, type=click.Path(exists=True), help='JSON data file')
@click.option('--template', '-t', default='modern', help='Template name')
@click.option('--format', '-f', 'output_format', type=click.Choice(['pdf', 'docx']), default='pdf', help='Output format')
@click.option('--output', '-o', 'output_file', type=click.Path(), help='Output file path')
def fill(data_file: str, template: str, output_format: str, output_file: Optional[str]):
    """Fill template with CV data."""
    async def run():
        agent = CVFillerAgent()
        
        # Load CV data
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        cv_data = CVData(**data)
        
        logger.info(f"Filling template '{template}' with data from: {data_file}")
        output_path = await agent.fill_template(
            cv_data=cv_data,
            template_name=template,
            output_format=output_format,
            output_filename=output_file
        )
        
        logger.success(f"CV generated: {output_path}")
        click.echo(f"\n✓ CV generated: {output_path}")
    
    asyncio.run(run())


@cli.command()
@click.option('--input', '-i', 'input_file', required=True, type=click.Path(exists=True), help='Input CV file')
@click.option('--template', '-t', default='modern', help='Template name')
@click.option('--format', '-f', 'output_format', type=click.Choice(['pdf', 'docx']), default='pdf', help='Output format')
@click.option('--output', '-o', 'output_file', type=click.Path(), help='Output file path')
@click.option('--enhance', is_flag=True, help='Enhance CV data with AI')
def process(input_file: str, template: str, output_format: str, output_file: Optional[str], enhance: bool):
    """Complete pipeline: extract + fill + export."""
    async def run():
        agent = CVFillerAgent()
        
        logger.info(f"Processing CV: {input_file}")
        output_path, cv_data = await agent.process_cv(
            input_file=input_file,
            template_name=template,
            output_format=output_format,
            output_filename=output_file,
            enhance=enhance
        )
        
        logger.success(f"CV processed successfully: {output_path}")
        click.echo(f"\n✓ CV generated: {output_path}")
        click.echo(f"✓ Candidate: {cv_data.full_name}")
        click.echo(f"✓ Template: {template}")
        click.echo(f"✓ Format: {output_format.upper()}")
    
    asyncio.run(run())


@cli.command()
def templates():
    """List available templates."""
    agent = CVFillerAgent()
    available = agent.get_available_templates()
    
    click.echo("\nAvailable CV Templates:")
    click.echo("-" * 40)
    
    if available:
        for i, template in enumerate(available, 1):
            click.echo(f"{i}. {template}")
    else:
        click.echo("No templates found")
    
    click.echo()


@cli.command()
@click.option('--host', default='0.0.0.0', help='Host to bind to')
@click.option('--port', default=8000, type=int, help='Port to bind to')
@click.option('--reload', is_flag=True, help='Enable auto-reload')
def serve(host: str, port: int, reload: bool):
    """Start the API server."""
    import uvicorn
    
    click.echo(f"\n🚀 Starting Rolevate CV Filler Agent API...")
    click.echo(f"   Server: http://{host}:{port}")
    click.echo(f"   Docs: http://{host}:{port}/docs")
    click.echo()
    
    uvicorn.run(
        "src.api.main:app",
        host=host,
        port=port,
        reload=reload
    )


if __name__ == '__main__':
    cli()
