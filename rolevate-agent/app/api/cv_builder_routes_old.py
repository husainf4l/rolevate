"""
CV Builder API Routes - Complete FastAPI endpoints for CV generation
Provides chat, generation, download, and management endpoints
"""
from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, Field
from loguru import logger
import json
import asyncio
from datetime import datetime
import uuid
from pathlib import Path

from app.agent.cv_builder_graph import (
    generate_cv, 
    process_chat, 
    get_workflow_info,
    cv_builder_workflow
)
from app.agent.nodes.storage_node import CVStorageManager
from app.services.auth_service import get_current_user
from app.models.user import User


# Create the router
router = APIRouter(prefix="/cv-builder", tags=["CV Builder"])


# Request/Response Models
class ChatMessage(BaseModel):
    """Chat message request"""
    message: str = Field(..., description="User message for CV building")
    thread_id: Optional[str] = Field(default=None, description="Thread ID for conversation continuity")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")


class ChatResponse(BaseModel):
    """Chat message response"""
    response: str = Field(..., description="AI response message")
    thread_id: str = Field(..., description="Thread ID for conversation")
    cv_id: Optional[str] = Field(default=None, description="Generated CV ID if applicable")
    workflow_status: str = Field(..., description="Current workflow status")
    execution_time: float = Field(default=0.0, description="Processing time in seconds")
    actions_available: List[str] = Field(default=[], description="Available next actions")


class CVGenerationRequest(BaseModel):
    """CV generation request"""
    input_data: Dict[str, Any] = Field(..., description="CV input data")
    template_preference: Optional[str] = Field(default=None, description="Preferred template name")
    optimization_level: Optional[str] = Field(default="comprehensive", description="Optimization level")
    output_format: Optional[str] = Field(default="pdf", description="Output format preference")


class CVGenerationResponse(BaseModel):
    """Generate CV response model."""
    success: bool = Field(..., description="Generation success status")
    download_url: Optional[str] = Field(None, description="PDF download URL")
    message: str = Field(..., description="Status message")


class TemplateInfo(BaseModel):
    """Template information model."""
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    preview_url: Optional[str] = Field(None, description="Template preview URL")


# Router setup
router = APIRouter(prefix="/api/cv-builder", tags=["CV Builder"])

# Global workflow instance and conversation storage
cv_workflow = CVBuilderWorkflow()
conversations: Dict[str, CVBuilderState] = {}


# Utility functions
def get_or_create_conversation(conversation_id: Optional[str]) -> str:
    """Get existing conversation or create new one."""
    if conversation_id and conversation_id in conversations:
        return conversation_id
    
    new_id = str(uuid.uuid4())
    conversations[new_id] = CVBuilderState(
        messages=[],
        intent=None,
        extracted_data={},
        cv_data={},
        draft_content={},
        selected_template="modern",
        generated_pdf_url=None,
        user_input="",
        processing_step="initialized"
    )
    return new_id


def generate_suggestions(state: CVBuilderState) -> List[str]:
    """Generate contextual suggestions for the user."""
    suggestions = []
    cv_data = state.get("cv_data", {})
    
    if not cv_data.get("personal_info"):
        suggestions.append("Add your personal information (name, email, phone)")
    
    if not cv_data.get("experience"):
        suggestions.append("Tell me about your work experience")
    
    if not cv_data.get("education"):
        suggestions.append("Add your education background")
    
    if not cv_data.get("skills"):
        suggestions.append("List your technical and soft skills")
    
    if not cv_data.get("summary"):
        suggestions.append("Add a professional summary")
    
    if cv_data and not state.get("generated_pdf_url"):
        suggestions.append("Generate your CV to download")
    
    if not suggestions:
        suggestions.extend([
            "Update any existing section",
            "Choose a different template",
            "Generate an updated version of your CV"
        ])
    
    return suggestions[:3]  # Limit to 3 suggestions


async def stream_ai_response(response_text: str):
    """Stream AI response word by word for better UX."""
    words = response_text.split()
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\\n\\n"
        # Small delay for streaming effect
        import asyncio
        await asyncio.sleep(0.05)
    
    # Send completion signal
    yield f"data: {json.dumps({'chunk': '', 'done': True})}\\n\\n"


# API Endpoints
@router.post("/chat", response_model=ChatResponse)
async def chat_with_cv_builder(
    request: ChatRequest,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Main chat endpoint for CV building conversation.
    Processes user input through the 5-layer AI architecture.
    """
    try:
        # Get or create conversation
        conversation_id = get_or_create_conversation(request.conversation_id)
        current_state = conversations[conversation_id]
        
        # Process user input through the workflow
        updated_state = await cv_workflow.process_user_input(
            request.message, 
            current_state
        )
        
        # Update conversation storage
        conversations[conversation_id] = updated_state
        
        # Get AI response from the last message
        ai_messages = [msg for msg in updated_state["messages"] if hasattr(msg, 'content') and msg.content]
        ai_response = ai_messages[-1].content if ai_messages else "I'm processing your request..."
        
        # Get progress summary
        progress = cv_workflow.get_conversation_summary(updated_state)
        
        # Generate contextual suggestions
        suggestions = generate_suggestions(updated_state)
        
        return ChatResponse(
            message=ai_response,
            conversation_id=conversation_id,
            intent=updated_state.get("intent").value if updated_state.get("intent") else None,
            cv_progress=progress,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")


@router.get("/chat/stream/{conversation_id}")
async def stream_chat_response(
    conversation_id: str,
    message: str,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Streaming chat endpoint for real-time AI responses.
    Returns Server-Sent Events (SSE) for progressive response display.
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        current_state = conversations[conversation_id]
        
        # Process user input
        updated_state = await cv_workflow.process_user_input(message, current_state)
        conversations[conversation_id] = updated_state
        
        # Get AI response
        ai_messages = [msg for msg in updated_state["messages"] if hasattr(msg, 'content')]
        ai_response = ai_messages[-1].content if ai_messages else "Processing..."
        
        # Stream the response
        return StreamingResponse(
            stream_ai_response(ai_response),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")


@router.post("/generate", response_model=GenerateCVResponse)
async def generate_cv(
    request: GenerateCVRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Generate CV endpoint.
    Creates a PDF from the conversation data using the selected template.
    """
    try:
        if request.conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        state = conversations[request.conversation_id]
        
        # Check if we have enough data
        cv_data = state.get("cv_data", {})
        if not cv_data or len(cv_data) < 2:
            return GenerateCVResponse(
                success=False,
                message="Please add more information before generating your CV. You need at least personal info and one other section."
            )
        
        # Update template selection
        state["selected_template"] = request.template
        state["user_input"] = "generate cv"
        state["intent"] = IntentType.GENERATE_CV
        
        # Process through the workflow to generate PDF
        updated_state = await cv_workflow.process_user_input("generate my cv", state)
        conversations[request.conversation_id] = updated_state
        
        if updated_state.get("generated_pdf_url"):
            return GenerateCVResponse(
                success=True,
                download_url=updated_state["generated_pdf_url"],
                message="Your CV has been generated successfully!"
            )
        else:
            return GenerateCVResponse(
                success=False,
                message="Failed to generate CV. Please try again."
            )
            
    except Exception as e:
        return GenerateCVResponse(
            success=False,
            message=f"Generation error: {str(e)}"
        )


@router.get("/download/{filename}")
async def download_cv(
    filename: str,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Download generated CV PDF.
    Returns the PDF file for download.
    """
    try:
        # Construct file path (in production, use proper file storage)
        file_path = Path(settings.output_dir) / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")


@router.get("/templates", response_model=List[TemplateInfo])
async def get_available_templates(
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Get list of available CV templates.
    Returns template information for user selection.
    """
    try:
        templates = cv_workflow.get_available_templates()
        
        template_info = []
        for template in templates:
            template_info.append(TemplateInfo(
                name=template["name"],
                description=template["description"],
                preview_url=f"/static/templates/previews/{template['name']}.jpg"
            ))
        
        return template_info
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template fetch error: {str(e)}")


@router.get("/conversation/{conversation_id}/summary")
async def get_conversation_summary(
    conversation_id: str,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Get summary of conversation and CV building progress.
    Returns current state and progress information.
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        state = conversations[conversation_id]
        summary = cv_workflow.get_conversation_summary(state)
        
        return {
            "conversation_id": conversation_id,
            "progress": summary,
            "cv_data": state.get("cv_data", {}),
            "selected_template": state.get("selected_template", "modern"),
            "message_count": len(state.get("messages", []))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Delete a conversation and its data.
    Useful for starting over or clearing old conversations.
    """
    try:
        if conversation_id in conversations:
            del conversations[conversation_id]
            return {"message": "Conversation deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion error: {str(e)}")


@router.post("/conversation/{conversation_id}/edit")
async def edit_cv_section(
    conversation_id: str,
    section: str,
    data: Dict[str, Any],
    current_user: User = Depends(get_current_user_or_redirect)
):
    """
    Edit a specific section of the CV data.
    Allows direct editing without conversational interface.
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        state = conversations[conversation_id]
        cv_data = state.get("cv_data", {})
        
        # Update the specified section
        if section in ["personal_info", "summary", "skills", "languages"]:
            cv_data[section] = data
        elif section in ["experience", "education"]:
            if section not in cv_data:
                cv_data[section] = []
            cv_data[section] = data if isinstance(data, list) else [data]
        else:
            raise HTTPException(status_code=400, detail="Invalid section name")
        
        state["cv_data"] = cv_data
        conversations[conversation_id] = state
        
        return {
            "message": f"Section '{section}' updated successfully",
            "updated_data": cv_data[section]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Edit error: {str(e)}")


# Include router in main app
def setup_cv_builder_routes(app):
    """Setup CV Builder routes in the main FastAPI app."""
    app.include_router(router)