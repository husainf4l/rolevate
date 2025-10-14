"""
Streaming Chat API Endpoints - Real-time CV building chat interface
Provides streaming responses and integrates with the 5-layer AI architecture
"""
from typing import Dict, Any, Optional, AsyncGenerator
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from loguru import logger

from app.agent.chat_memory import chat_memory_manager, get_or_create_session
from app.agent.cv_builder_workflow import CVBuilderWorkflow


class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    session_id: str
    cv_progress: Dict[str, Any]
    suggestions: list = []
    download_url: Optional[str] = None


router = APIRouter(prefix="/api/v1", tags=["Chat"])


class StreamingChatHandler:
    """Handle streaming chat responses"""
    
    def __init__(self):
        self.workflow = CVBuilderWorkflow()
    
    async def stream_response(self, message: str, session_id: str, user_id: str = None) -> AsyncGenerator[str, None]:
        """Stream AI response with typing effect"""
        
        try:
            # Load session memory
            session_data = chat_memory_manager.load_session_memory(session_id)
            cv_memory = session_data.get("cv_memory", {})
            
            # Add user message to conversation
            chat_memory_manager.add_conversation_message(
                session_id, "user", message
            )
            
            # Yield typing indicator
            yield f"data: {json.dumps({'type': 'typing', 'content': True})}\\n\\n"
            await asyncio.sleep(0.5)
            
            # Process message through 5-layer workflow
            result = await self.workflow.process_chat_message(
                message=message,
                cv_memory=cv_memory,
                session_id=session_id
            )
            
            # Stop typing indicator
            yield f"data: {json.dumps({'type': 'typing', 'content': False})}\\n\\n"
            
            # Stream response text with typing effect
            ai_response = result.get("ai_response", "I'm here to help you build your CV!")
            
            # Simulate typing by streaming word by word
            words = ai_response.split()
            current_text = ""
            
            for i, word in enumerate(words):
                current_text += word + " "
                
                yield f"data: {json.dumps({'type': 'response', 'content': current_text.strip()})}\\n\\n"
                
                # Add small delay for natural typing effect
                await asyncio.sleep(0.05)
            
            # Update session memory with results
            if result.get("cv_memory"):
                chat_memory_manager.update_cv_memory(session_id, result["cv_memory"])
            
            # Add AI response to conversation
            chat_memory_manager.add_conversation_message(
                session_id, "assistant", ai_response, 
                metadata={"intent": result.get("intent"), "quality_score": result.get("quality_score")}
            )
            
            # Send final metadata
            progress = chat_memory_manager.get_cv_completion_progress(session_id)
            final_data = {
                "type": "complete",
                "session_id": session_id,
                "cv_progress": progress,
                "download_url": result.get("download_url"),
                "suggestions": self.get_suggestions(result, progress),
                "html_preview": result.get("html_content")
            }
            
            yield f"data: {json.dumps(final_data)}\\n\\n"
            yield f"data: [DONE]\\n\\n"
            
        except Exception as e:
            logger.error(f"Streaming chat error: {e}")
            error_response = {
                "type": "error",
                "content": "I apologize, but I encountered an error. Please try again."
            }
            yield f"data: {json.dumps(error_response)}\\n\\n"
            yield f"data: [DONE]\\n\\n"
    
    def get_suggestions(self, result: Dict, progress: Dict) -> list:
        """Generate contextual suggestions for the user"""
        
        intent = result.get("intent", "")
        completion_status = progress.get("completion_status", {})
        suggestions = []
        
        # Suggest next steps based on completion status
        if not completion_status.get("personal_info"):
            suggestions.extend([
                "Add your contact information",
                "Tell me your name and email"
            ])
        elif not completion_status.get("summary"):
            suggestions.extend([
                "Add a professional summary",
                "Describe your career goals"
            ])
        elif not completion_status.get("experiences"):
            suggestions.extend([
                "Add your work experience",
                "Tell me about your current job"
            ])
        elif not completion_status.get("skills"):
            suggestions.extend([
                "Add your technical skills",
                "List programming languages you know"
            ])
        else:
            suggestions.extend([
                "Generate my CV",
                "Choose a different template",
                "Review and download"
            ])
        
        # Add intent-specific suggestions
        if intent == "add_experience":
            suggestions.append("Add another job position")
        elif intent == "add_education":
            suggestions.append("Add more education details")
        elif intent == "add_skills":
            suggestions.append("Add more skills")
        
        return suggestions[:3]  # Limit to 3 suggestions


# Initialize streaming handler
streaming_handler = StreamingChatHandler()


@router.post("/chat/stream")
async def stream_chat(chat_message: ChatMessage):
    """
    Streaming chat endpoint for real-time CV building
    
    Provides Server-Sent Events (SSE) for real-time typing effect
    """
    try:
        # Get or create session
        session_id, session_data = get_or_create_session(
            chat_message.session_id, 
            chat_message.user_id
        )
        
        logger.info(f"Processing streaming chat for session: {session_id}")
        
        # Return streaming response
        return StreamingResponse(
            streaming_handler.stream_response(
                chat_message.message, 
                session_id, 
                chat_message.user_id
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except Exception as e:
        logger.error(f"Chat streaming failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat_message(chat_message: ChatMessage):
    """
    Standard chat endpoint for CV building (non-streaming)
    
    Use this for clients that don't support Server-Sent Events
    """
    try:
        # Get or create session
        session_id, session_data = get_or_create_session(
            chat_message.session_id, 
            chat_message.user_id
        )
        
        logger.info(f"Processing chat message for session: {session_id}")
        
        # Load CV memory
        cv_memory = session_data.get("cv_memory", {})
        
        # Add user message to conversation
        chat_memory_manager.add_conversation_message(
            session_id, "user", chat_message.message
        )
        
        # Process through workflow
        workflow = CVBuilderWorkflow()
        result = await workflow.process_chat_message(
            message=chat_message.message,
            cv_memory=cv_memory,
            session_id=session_id
        )
        
        # Update session memory
        if result.get("cv_memory"):
            chat_memory_manager.update_cv_memory(session_id, result["cv_memory"])
        
        # Add AI response to conversation
        ai_response = result.get("ai_response", "I'm here to help you build your CV!")
        chat_memory_manager.add_conversation_message(
            session_id, "assistant", ai_response,
            metadata={"intent": result.get("intent")}
        )
        
        # Get completion progress
        progress = chat_memory_manager.get_cv_completion_progress(session_id)
        
        # Generate suggestions
        suggestions = streaming_handler.get_suggestions(result, progress)
        
        return ChatResponse(
            response=ai_response,
            session_id=session_id,
            cv_progress=progress,
            suggestions=suggestions,
            download_url=result.get("download_url")
        )
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate")
async def generate_cv(request: Request):
    """
    Generate final CV from session data
    
    Triggers the complete 5-layer processing workflow
    """
    try:
        data = await request.json()
        session_id = data.get("session_id")
        template_name = data.get("template", "modern")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")
        
        logger.info(f"Generating CV for session: {session_id}")
        
        # Load session data
        session_data = chat_memory_manager.load_session_memory(session_id)
        cv_memory = session_data.get("cv_memory", {})
        
        if not cv_memory:
            raise HTTPException(status_code=400, detail="No CV data found in session")
        
        # Update template selection
        cv_memory["selected_template"] = template_name
        
        # Process through complete workflow
        workflow = CVBuilderWorkflow()
        result = await workflow.process_chat_message(
            message="generate my cv",
            cv_memory=cv_memory,
            session_id=session_id
        )
        
        # Update session with final results
        if result.get("cv_memory"):
            chat_memory_manager.update_cv_memory(session_id, result["cv_memory"])
        
        return {
            "success": True,
            "download_url": result.get("download_url"),
            "quality_score": result.get("quality_score", 100),
            "message": "CV generated successfully!"
        }
        
    except Exception as e:
        logger.error(f"CV generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}/progress")
async def get_session_progress(session_id: str):
    """Get CV completion progress for a session"""
    try:
        progress = chat_memory_manager.get_cv_completion_progress(session_id)
        session_data = chat_memory_manager.load_session_memory(session_id)
        
        return {
            "session_id": session_id,
            "progress": progress,
            "cv_data": session_data.get("cv_memory", {}),
            "message_count": session_data.get("message_count", 0)
        }
        
    except Exception as e:
        logger.error(f"Failed to get session progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}/preview")
async def get_cv_preview(session_id: str, template: str = "modern"):
    """Get HTML preview of current CV"""
    try:
        session_data = chat_memory_manager.load_session_memory(session_id)
        cv_memory = session_data.get("cv_memory", {})
        
        if not cv_memory:
            raise HTTPException(status_code=404, detail="No CV data found")
        
        # Generate preview through workflow
        workflow = CVBuilderWorkflow()
        result = await workflow.generate_preview(cv_memory, template)
        
        return {
            "html_content": result.get("html_content", ""),
            "template": template,
            "progress": chat_memory_manager.get_cv_completion_progress(session_id)
        }
        
    except Exception as e:
        logger.error(f"Failed to generate preview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session and its data"""
    try:
        session_file = chat_memory_manager.get_session_file_path(session_id)
        
        if session_file.exists():
            session_file.unlink()
            logger.info(f"Deleted session: {session_id}")
            return {"message": "Session deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except Exception as e:
        logger.error(f"Failed to delete session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates")
async def get_available_templates():
    """Get list of available CV templates"""
    from app.agent.nodes.template_rendering_node import TemplateRenderer
    
    try:
        renderer = TemplateRenderer()
        templates = renderer.get_available_templates()
        
        return {
            "templates": templates,
            "default": "modern"
        }
        
    except Exception as e:
        logger.error(f"Failed to get templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))