"""Extraction node for CV data extraction"""
from loguru import logger
from app.services.cv_extractor import CVExtractor


async def extraction_node(state: dict) -> dict:
    """
    Node for extracting CV data from raw text
    
    Args:
        state: Current agent state with cv_text
        
    Returns:
        Updated state with cv_data
    """
    logger.info("Extraction node: Processing CV text")
    
    try:
        extractor = CVExtractor()
        cv_text = state.get("cv_text", "")
        
        if not cv_text:
            raise ValueError("No CV text provided")
        
        # Extract CV data
        cv_data = await extractor.extract_from_text(cv_text)
        
        logger.success(f"Extracted CV data for: {cv_data.full_name}")
        
        return {
            **state,
            "cv_data": cv_data,
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": f"Extracted CV data for {cv_data.full_name}"}
            ]
        }
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return {
            **state,
            "error": f"Extraction failed: {str(e)}"
        }
