"""Export node for CV file generation"""
from loguru import logger
from app.services.cv_exporter import CVExporter


async def export_node(state: dict) -> dict:
    """
    Node for exporting CV data to file
    
    Args:
        state: Current agent state with cv_data, template_name, output_format
        
    Returns:
        Updated state with output_path
    """
    logger.info("Export node: Generating CV file")
    
    try:
        exporter = CVExporter()
        cv_data = state.get("cv_data")
        template_name = state.get("template_name", "modern_cv")
        output_format = state.get("output_format", "pdf")
        
        if not cv_data:
            raise ValueError("No CV data to export")
        
        # Export CV
        output_path = await exporter.export(
            cv_data=cv_data,
            template_name=template_name,
            output_format=output_format
        )
        
        logger.success(f"CV exported to: {output_path}")
        
        return {
            **state,
            "output_path": str(output_path),
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": f"CV exported to {output_path.name}"}
            ]
        }
        
    except Exception as e:
        logger.error(f"Export failed: {e}")
        return {
            **state,
            "error": f"Export failed: {str(e)}"
        }
