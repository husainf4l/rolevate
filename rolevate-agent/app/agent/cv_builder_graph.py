"""
CV Builder Graph - Complete LangGraph workflow orchestration
Manages the 8-node pipeline for intelligent CV generation
"""
import asyncio
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel, Field
from loguru import logger
import json
from datetime import datetime

# Import all our specialized nodes
from app.agent.nodes.input_node import input_node, INPUT_NODE_METADATA
from app.agent.nodes.data_cleaner_node import data_cleaner_node, DATA_CLEANER_NODE_METADATA
from app.agent.nodes.content_writer_node import content_writer_node, CONTENT_WRITER_NODE_METADATA
from app.agent.nodes.section_ranker_node import section_ranker_node, SECTION_RANKER_NODE_METADATA
from app.agent.nodes.template_selector_node import template_selector_node, TEMPLATE_SELECTOR_NODE_METADATA
from app.agent.nodes.pdf_renderer_node import pdf_renderer_node, PDF_RENDERER_NODE_METADATA
from app.agent.nodes.optimizer_node import optimizer_node, OPTIMIZER_NODE_METADATA
from app.agent.nodes.storage_node import storage_node, STORAGE_NODE_METADATA

# Import shared memory system
from app.agent.shared_memory import CVMemoryStructure, get_cv_memory_from_state, update_cv_memory_in_state


class CVBuilderState(TypedDict):
    """Shared state structure for the CV Builder workflow"""
    
    # Input data
    raw_input: Dict[str, Any]  # Original user input
    user_message: str  # User's natural language request
    user_id: Optional[str]  # User identifier
    
    # Processing data - using standardized memory structure
    cv_memory: CVMemoryStructure  # Standardized CV data structure
    processing_step: str  # Current processing status
    workflow_id: str  # Unique workflow identifier
    
    # Node outputs
    parsed_data: Dict[str, Any]  # From input_node
    cleaned_data: Dict[str, Any]  # From data_cleaner_node
    enhanced_content: Dict[str, Any]  # From content_writer_node
    section_order: List[str]  # From section_ranker_node
    selected_template: Dict[str, Any]  # From template_selector_node
    rendered_pdf: Dict[str, Any]  # From pdf_renderer_node
    optimization_report: Dict[str, Any]  # From optimizer_node
    storage_info: Dict[str, Any]  # From storage_node
    
    # Workflow metadata
    cv_id: Optional[str]  # Final CV identifier
    error_log: List[str]  # Error tracking
    performance_metrics: Dict[str, Any]  # Processing metrics
    
    # Messages for chat interface
    messages: Annotated[List[Dict[str, str]], add_messages]


class CVBuilderWorkflow:
    """Main CV Builder workflow orchestrator"""
    
    def __init__(self):
        self.graph = None
        self.memory = MemorySaver()
        self.node_metadata = {
            "input_node": INPUT_NODE_METADATA,
            "data_cleaner_node": DATA_CLEANER_NODE_METADATA,
            "content_writer_node": CONTENT_WRITER_NODE_METADATA,
            "section_ranker_node": SECTION_RANKER_NODE_METADATA,
            "template_selector_node": TEMPLATE_SELECTOR_NODE_METADATA,
            "pdf_renderer_node": PDF_RENDERER_NODE_METADATA,
            "optimizer_node": OPTIMIZER_NODE_METADATA,
            "storage_node": STORAGE_NODE_METADATA
        }
        
        self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        
        logger.info("🔧 Building CV Builder workflow graph...")
        
        # Create the state graph
        workflow = StateGraph(CVBuilderState)
        
        # Add all nodes to the graph
        workflow.add_node("input_node", self._wrap_node(input_node, "input_node"))
        workflow.add_node("data_cleaner_node", self._wrap_node(data_cleaner_node, "data_cleaner_node"))
        workflow.add_node("content_writer_node", self._wrap_node(content_writer_node, "content_writer_node"))
        workflow.add_node("section_ranker_node", self._wrap_node(section_ranker_node, "section_ranker_node"))
        workflow.add_node("template_selector_node", self._wrap_node(template_selector_node, "template_selector_node"))
        workflow.add_node("pdf_renderer_node", self._wrap_node(pdf_renderer_node, "pdf_renderer_node"))
        workflow.add_node("optimizer_node", self._wrap_node(optimizer_node, "optimizer_node"))
        workflow.add_node("storage_node", self._wrap_node(storage_node, "storage_node"))
        
        # Define the workflow edges (sequential pipeline)
        workflow.add_edge(START, "input_node")
        workflow.add_edge("input_node", "data_cleaner_node")
        workflow.add_edge("data_cleaner_node", "content_writer_node")
        workflow.add_edge("content_writer_node", "section_ranker_node")
        workflow.add_edge("section_ranker_node", "template_selector_node")
        workflow.add_edge("template_selector_node", "pdf_renderer_node")
        workflow.add_edge("pdf_renderer_node", "optimizer_node")
        workflow.add_edge("optimizer_node", "storage_node")
        workflow.add_edge("storage_node", END)
        
        # Compile the graph with memory
        self.graph = workflow.compile(checkpointer=self.memory)
        
        logger.success("✅ CV Builder workflow graph compiled successfully")
    
    def _wrap_node(self, node_func, node_name: str):
        """Wrap node function with error handling and performance tracking"""
        
        async def wrapped_node(state: CVBuilderState) -> CVBuilderState:
            start_time = datetime.now()
            
            try:
                logger.info(f"🔄 Executing {node_name}...")
                
                # Execute the node
                result_state = await node_func(state)
                
                # Calculate performance metrics
                execution_time = (datetime.now() - start_time).total_seconds()
                
                # Update performance metrics
                if "performance_metrics" not in result_state:
                    result_state["performance_metrics"] = {}
                
                result_state["performance_metrics"][node_name] = {
                    "execution_time": execution_time,
                    "status": "success",
                    "timestamp": start_time.isoformat()
                }
                
                logger.success(f"✅ {node_name} completed in {execution_time:.2f}s")
                
                return result_state
                
            except Exception as e:
                # Calculate execution time even for errors
                execution_time = (datetime.now() - start_time).total_seconds()
                
                # Log error
                error_msg = f"{node_name} failed: {str(e)}"
                logger.error(f"❌ {error_msg}")
                
                # Update state with error information
                if "error_log" not in state:
                    state["error_log"] = []
                state["error_log"].append(error_msg)
                
                if "performance_metrics" not in state:
                    state["performance_metrics"] = {}
                
                state["performance_metrics"][node_name] = {
                    "execution_time": execution_time,
                    "status": "error",
                    "error": str(e),
                    "timestamp": start_time.isoformat()
                }
                
                state["processing_step"] = f"{node_name}_error"
                
                return state
        
        return wrapped_node
    
    async def process_cv_request(self, input_data: Dict[str, Any], 
                               user_id: Optional[str] = None,
                               config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process a complete CV generation request"""
        
        import uuid
        workflow_id = str(uuid.uuid4())
        
        logger.info(f"🚀 Starting CV generation workflow: {workflow_id}")
        
        # Create initial state
        initial_state = CVBuilderState(
            raw_input=input_data,
            user_message=input_data.get("message", "Generate my CV"),
            user_id=user_id,
            cv_memory={},
            processing_step="initiated",
            workflow_id=workflow_id,
            parsed_data={},
            cleaned_data={},
            enhanced_content={},
            section_order=[],
            selected_template={},
            rendered_pdf={},
            optimization_report={},
            storage_info={},
            cv_id=None,
            error_log=[],
            performance_metrics={},
            messages=[]
        )
        
        try:
            # Execute the workflow
            config = config or {"configurable": {"thread_id": workflow_id}}
            
            # Stream the workflow execution
            final_state = None
            async for state in self.graph.astream(initial_state, config=config):
                # Log progress for each node
                current_step = state.get("processing_step", "unknown")
                logger.info(f"📊 Workflow progress: {current_step}")
                final_state = state
            
            if final_state is None:
                raise Exception("Workflow execution failed - no final state")
            
            # Calculate total execution time
            total_time = sum(
                metrics.get("execution_time", 0) 
                for metrics in final_state.get("performance_metrics", {}).values()
            )
            
            # Create comprehensive result
            result = {
                "success": True,
                "workflow_id": workflow_id,
                "cv_id": final_state.get("cv_id"),
                "processing_step": final_state.get("processing_step"),
                "total_execution_time": total_time,
                "performance_metrics": final_state.get("performance_metrics", {}),
                "storage_info": final_state.get("storage_info", {}),
                "optimization_report": final_state.get("optimization_report", {}),
                "error_count": len(final_state.get("error_log", [])),
                "errors": final_state.get("error_log", [])
            }
            
            logger.success(f"✅ CV generation completed: {workflow_id} in {total_time:.2f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Workflow execution failed: {e}")
            
            return {
                "success": False,
                "workflow_id": workflow_id,
                "error": str(e),
                "processing_step": "workflow_error",
                "performance_metrics": {},
                "error_count": 1,
                "errors": [str(e)]
            }
    
    async def process_chat_message(self, message: str, thread_id: str, 
                                  user_id: Optional[str] = None) -> Dict[str, Any]:
        """Process a chat message for CV building"""
        
        logger.info(f"💬 Processing chat message: {thread_id}")
        
        # Create input data from message
        input_data = {
            "message": message,
            "interaction_type": "chat",
            "timestamp": datetime.now().isoformat()
        }
        
        # Use thread_id for workflow continuity
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            result = await self.process_cv_request(input_data, user_id, config)
            
            # Add chat-specific response
            response_message = self._generate_chat_response(result)
            result["response_message"] = response_message
            
            return result
            
        except Exception as e:
            logger.error(f"Chat processing failed: {e}")
            return {
                "success": False,
                "response_message": "I encountered an error while processing your request. Please try again.",
                "error": str(e)
            }
    
    def _generate_chat_response(self, workflow_result: Dict[str, Any]) -> str:
        """Generate a chat response based on workflow results"""
        
        if not workflow_result.get("success"):
            return "I encountered an issue while generating your CV. Please try again or provide more details."
        
        cv_id = workflow_result.get("cv_id")
        execution_time = workflow_result.get("total_execution_time", 0)
        errors = workflow_result.get("error_count", 0)
        
        if errors > 0:
            return f"I've generated your CV (ID: {cv_id}) but encountered {errors} minor issues. The CV is ready for download!"
        
        return f"✅ Your CV has been successfully generated! (ID: {cv_id})\n⏱️ Processing time: {execution_time:.1f} seconds\n📄 Your professional CV is ready for download."
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get the status of a specific workflow"""
        
        try:
            # Get state from memory
            config = {"configurable": {"thread_id": workflow_id}}
            state = self.graph.get_state(config)
            
            if state and state.values:
                return {
                    "workflow_id": workflow_id,
                    "processing_step": state.values.get("processing_step", "unknown"),
                    "performance_metrics": state.values.get("performance_metrics", {}),
                    "error_count": len(state.values.get("error_log", [])),
                    "cv_id": state.values.get("cv_id")
                }
            else:
                return {
                    "workflow_id": workflow_id,
                    "status": "not_found"
                }
                
        except Exception as e:
            logger.error(f"Failed to get workflow status: {e}")
            return {
                "workflow_id": workflow_id,
                "status": "error",
                "error": str(e)
            }
    
    def get_node_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Get input/output schemas for all nodes"""
        
        schemas = {}
        for node_name, metadata in self.node_metadata.items():
            schemas[node_name] = {
                "name": metadata["name"],
                "description": metadata["description"],
                "input_schema": metadata["input_schema"].model_json_schema() if hasattr(metadata["input_schema"], "model_json_schema") else {},
                "output_schema": metadata["output_schema"].model_json_schema() if hasattr(metadata["output_schema"], "model_json_schema") else {},
                "dependencies": metadata.get("dependencies", []),
                "timeout": metadata.get("timeout", 30)
            }
        
        return schemas


# Global workflow instance
cv_builder_workflow = CVBuilderWorkflow()


# Convenience functions for FastAPI integration
async def generate_cv(input_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
    """Generate CV using the complete workflow"""
    return await cv_builder_workflow.process_cv_request(input_data, user_id)


async def process_chat(message: str, thread_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Process chat message for CV building"""
    return await cv_builder_workflow.process_chat_message(message, thread_id, user_id)


def get_workflow_info() -> Dict[str, Any]:
    """Get information about the workflow"""
    return {
        "name": "CV Builder AI Workflow",
        "version": "1.0.0",
        "nodes": list(cv_builder_workflow.node_metadata.keys()),
        "node_schemas": cv_builder_workflow.get_node_schemas(),
        "description": "8-node intelligent CV generation pipeline with LangGraph orchestration"
    }