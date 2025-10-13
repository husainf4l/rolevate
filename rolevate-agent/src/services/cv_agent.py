"""Main CV Filler Agent orchestrator."""
from pathlib import Path
from typing import Union, Optional, Literal
from loguru import logger

from ..models.cv_schema import CVData
from ..services.cv_extractor import CVExtractor
from ..services.cv_exporter import CVExporter
from ..services.template_filler import TemplateFiller


class CVFillerAgent:
    """
    Main agent that orchestrates CV processing pipeline:
    1. Extract structured data from CV
    2. Fill template with data
    3. Export to desired format
    """
    
    def __init__(self):
        """Initialize the CV Filler Agent."""
        self.extractor = CVExtractor()
        self.exporter = CVExporter()
        self.template_filler = TemplateFiller()
        logger.info("CV Filler Agent initialized")
    
    async def process_cv(
        self,
        input_file: Union[str, Path],
        template_name: str = "modern",
        output_format: Literal["pdf", "docx"] = "pdf",
        output_filename: Optional[str] = None,
        enhance: bool = False
    ) -> tuple[Path, CVData]:
        """
        Complete CV processing pipeline.
        
        Args:
            input_file: Path to input CV file
            template_name: Template to use for output
            output_format: Output format (pdf or docx)
            output_filename: Custom output filename
            enhance: Whether to enhance CV data with AI improvements
            
        Returns:
            tuple: (output_file_path, extracted_cv_data)
        """
        logger.info(f"Starting CV processing pipeline for: {input_file}")
        
        try:
            # Step 1: Extract CV data
            logger.info("Step 1: Extracting CV data")
            cv_data = await self.extractor.extract_from_file(input_file)
            
            # Optional: Enhance CV data
            if enhance:
                logger.info("Enhancing CV data")
                cv_data = await self.extractor.enhance_cv_data(cv_data)
            
            # Step 2: Export to desired format
            logger.info(f"Step 2: Exporting to {output_format.upper()}")
            output_path = await self.exporter.export(
                cv_data=cv_data,
                template_name=template_name,
                output_format=output_format,
                output_filename=output_filename
            )
            
            logger.success(f"CV processing completed: {output_path}")
            return output_path, cv_data
            
        except Exception as e:
            logger.error(f"CV processing failed: {e}")
            raise
    
    async def extract_only(
        self,
        input_file: Union[str, Path],
        enhance: bool = False
    ) -> CVData:
        """
        Extract structured data from CV without generating output.
        
        Args:
            input_file: Path to input CV file
            enhance: Whether to enhance CV data with AI improvements
            
        Returns:
            CVData: Extracted CV data
        """
        logger.info(f"Extracting data from: {input_file}")
        
        cv_data = await self.extractor.extract_from_file(input_file)
        
        if enhance:
            cv_data = await self.extractor.enhance_cv_data(cv_data)
        
        return cv_data
    
    async def fill_template(
        self,
        cv_data: CVData,
        template_name: str = "modern",
        output_format: Literal["pdf", "docx"] = "pdf",
        output_filename: Optional[str] = None
    ) -> Path:
        """
        Fill template and export with existing CV data.
        
        Args:
            cv_data: Structured CV data
            template_name: Template to use
            output_format: Output format (pdf or docx)
            output_filename: Custom output filename
            
        Returns:
            Path: Path to generated file
        """
        logger.info(f"Filling template: {template_name}")
        
        output_path = await self.exporter.export(
            cv_data=cv_data,
            template_name=template_name,
            output_format=output_format,
            output_filename=output_filename
        )
        
        return output_path
    
    def get_available_templates(self) -> list[str]:
        """Get list of available CV templates."""
        return self.template_filler.get_available_templates()
    
    async def preview_html(
        self,
        cv_data: CVData,
        template_name: str = "modern"
    ) -> str:
        """
        Generate HTML preview of CV.
        
        Args:
            cv_data: Structured CV data
            template_name: Template to use
            
        Returns:
            str: Rendered HTML
        """
        return self.template_filler.render_html(cv_data, template_name)
