"""Enhancement node for CV data improvement"""
from loguru import logger
from app.services.cv_extractor import CVExtractor


async def enhancement_node(state: dict) -> dict:
    """
    Node for enhancing CV data with AI improvements
    
    Args:
        state: Current agent state with cv_data
        
    Returns:
        Updated state with enhanced cv_data
    """
    logger.info("Enhancement node: Improving CV data")
    
    try:
        extractor = CVExtractor()
        cv_data = state.get("cv_data")
        
        if not cv_data:
            raise ValueError("No CV data to enhance")
        
        # Enhance CV data
        enhanced_data = await extractor.enhance_cv_data(cv_data)
        
        logger.success("CV data enhanced successfully")
        
        return {
            **state,
            "cv_data": enhanced_data,
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": "Enhanced CV data with AI improvements"}
            ]
        }
        
    except Exception as e:
        logger.warning(f"Enhancement failed, using original data: {e}")
        # Don't fail the workflow, just use original data
        return {
            **state,
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": f"Enhancement skipped: {str(e)}"}
            ]
        }
