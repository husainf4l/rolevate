"""
LangGraph Node Integration for CV Filler Agent
Exposes CV processing as a node in the Rolevate LangGraph workflow system.
"""

from typing import Dict, Any, List, Optional, TypedDict
from pathlib import Path
import tempfile
import logging

# LangGraph imports (assuming these are available in the Rolevate ecosystem)
try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.memory import MemorySaver
    from langgraph.prebuilt import ToolNode
except ImportError:
    # Fallback for development/testing
    print("LangGraph not available, using mock implementations")
    class StateGraph:
        def __init__(self, schema):
            self.schema = schema
        def add_node(self, name, func):
            pass
        def add_edge(self, from_node, to_node):
            pass
        def set_entry_point(self, node):
            pass
        def compile(self):
            return self
    END = "END"
    MemorySaver = dict
    ToolNode = dict

from ..services.cv_filler_agent import CustomCVFillerAgent
from ..utils.deduplicate_experiences import deduplicate_cv_experiences
from ..utils.formatters import format_cv_data
from ..utils.template_selector import select_cv_template

logger = logging.getLogger(__name__)

class CVFillerState(TypedDict):
    """State schema for CV Filler node in LangGraph."""
    cv_text: str
    job_type: Optional[str]
    template_pref: Optional[str]
    extracted_data: Optional[Dict[str, Any]]
    pdf_path: Optional[str]
    cloud_url: Optional[str]
    error: Optional[str]
    processing_status: str
    metadata: Dict[str, Any]

class CVFillerNode:
    """
    CV Filler Agent as a LangGraph node for workflow integration.
    """
    
    def __init__(self):
        """Initialize the CV Filler node."""
        self.agent = CustomCVFillerAgent()
        self.node_name = "cv_filler_node"
        self.version = "1.0.0"
    
    async def extract_cv_data(self, state: CVFillerState) -> CVFillerState:
        """
        Extract structured data from CV text.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with extracted data
        """
        try:
            logger.info(f"CV Filler Node: Extracting data from CV text ({len(state['cv_text'])} chars)")
            
            # Update processing status
            state["processing_status"] = "extracting"
            
            # Extract CV data using AI
            extracted_data = await self.agent.extract(state["cv_text"])
            
            # Apply enhancements
            enhanced_data = deduplicate_cv_experiences(extracted_data, merge=True)
            formatted_data = format_cv_data(enhanced_data)
            
            # Store extracted data
            state["extracted_data"] = formatted_data
            state["processing_status"] = "extracted"
            
            # Update metadata
            if "metadata" not in state:
                state["metadata"] = {}
            
            state["metadata"].update({
                "extraction_timestamp": str(datetime.now()),
                "cv_length": len(state["cv_text"]),
                "experiences_count": len(formatted_data.get("experience", [])),
                "skills_count": len(formatted_data.get("skills", [])),
                "deduplication_applied": True,
                "formatting_applied": True
            })
            
            logger.info("CV data extraction completed successfully")
            
        except Exception as e:
            logger.error(f"CV extraction failed: {e}")
            state["error"] = f"Extraction failed: {str(e)}"
            state["processing_status"] = "error"
        
        return state
    
    async def select_template(self, state: CVFillerState) -> CVFillerState:
        """
        Select appropriate template based on CV data and preferences.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with template selection
        """
        try:
            logger.info("CV Filler Node: Selecting template")
            
            state["processing_status"] = "selecting_template"
            
            extracted_data = state.get("extracted_data")
            if not extracted_data:
                raise ValueError("No extracted data available for template selection")
            
            # Use preference if provided, otherwise auto-select
            if state.get("template_pref"):
                selected_template = state["template_pref"]
                logger.info(f"Using preferred template: {selected_template}")
            else:
                selected_template = select_cv_template(extracted_data)
                logger.info(f"Auto-selected template: {selected_template}")
            
            # Store template choice
            if "metadata" not in state:
                state["metadata"] = {}
            
            state["metadata"]["selected_template"] = selected_template
            state["metadata"]["template_selection_method"] = (
                "user_preference" if state.get("template_pref") else "auto_selection"
            )
            
            state["processing_status"] = "template_selected"
            
        except Exception as e:
            logger.error(f"Template selection failed: {e}")
            state["error"] = f"Template selection failed: {str(e)}"
            state["processing_status"] = "error"
        
        return state
    
    async def generate_cv(self, state: CVFillerState) -> CVFillerState:
        """
        Generate CV document from extracted data and template.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated state with generated CV path
        """
        try:
            logger.info("CV Filler Node: Generating CV document")
            
            state["processing_status"] = "generating"
            
            extracted_data = state.get("extracted_data")
            template = state.get("metadata", {}).get("selected_template", "simple_cv.html")
            
            if not extracted_data:
                raise ValueError("No extracted data available for CV generation")
            
            # Render HTML
            html_content = self.agent.render_html(extracted_data, template)
            
            # Generate PDF
            candidate_name = extracted_data.get("name", "candidate")
            safe_name = "".join(c for c in candidate_name if c.isalnum() or c in (' ', '-', '_')).strip()
            
            # Create temporary output file
            temp_dir = Path(tempfile.gettempdir()) / "rolevate_cv_node"
            temp_dir.mkdir(exist_ok=True)
            
            pdf_filename = f"{safe_name}_CV.pdf"
            pdf_path = temp_dir / pdf_filename
            
            # Generate PDF (in production, this would use WeasyPrint)
            with open(pdf_path, 'w') as f:
                f.write(f"Mock PDF for {candidate_name}\n")
                f.write(f"Template: {template}\n")
                f.write(f"Generated from CV Filler Node v{self.version}\n")
            
            state["pdf_path"] = str(pdf_path)
            state["processing_status"] = "generated"
            
            # Update metadata
            state["metadata"].update({
                "pdf_filename": pdf_filename,
                "pdf_path": str(pdf_path),
                "generation_timestamp": str(datetime.now()),
                "template_used": template
            })
            
            logger.info(f"CV generated successfully: {pdf_path}")
            
        except Exception as e:
            logger.error(f"CV generation failed: {e}")
            state["error"] = f"CV generation failed: {str(e)}"
            state["processing_status"] = "error"
        
        return state
    
    async def process_cv_complete(self, state: CVFillerState) -> CVFillerState:
        """
        Complete CV processing pipeline.
        
        Args:
            state: Input state with CV text
            
        Returns:
            Final state with processed CV
        """
        # Run the complete pipeline
        state = await self.extract_cv_data(state)
        if state.get("error"):
            return state
            
        state = await self.select_template(state)
        if state.get("error"):
            return state
            
        state = await self.generate_cv(state)
        
        # Mark as completed
        if not state.get("error"):
            state["processing_status"] = "completed"
            logger.info("CV Filler Node: Processing completed successfully")
        
        return state
    
    def create_langgraph_workflow(self) -> StateGraph:
        """
        Create a LangGraph workflow with CV processing steps.
        
        Returns:
            Configured StateGraph
        """
        # Define the workflow
        workflow = StateGraph(CVFillerState)
        
        # Add nodes
        workflow.add_node("extract", self.extract_cv_data)
        workflow.add_node("select_template", self.select_template)
        workflow.add_node("generate", self.generate_cv)
        
        # Define edges
        workflow.add_edge("extract", "select_template")
        workflow.add_edge("select_template", "generate")
        workflow.add_edge("generate", END)
        
        # Set entry point
        workflow.set_entry_point("extract")
        
        # Compile workflow
        return workflow.compile()
    
    def register_with_rolevate_graph(self, main_graph: StateGraph) -> StateGraph:
        """
        Register CV Filler node with the main Rolevate workflow graph.
        
        Args:
            main_graph: Main Rolevate workflow graph
            
        Returns:
            Updated graph with CV Filler node
        """
        # Add CV Filler node to main graph
        main_graph.add_node(self.node_name, self.process_cv_complete)
        
        # Add conditional edges (these would be defined based on Rolevate's workflow)
        # Example connections:
        # Interview Agent → CV Filler → HR Approval
        
        logger.info(f"Registered {self.node_name} with main workflow graph")
        return main_graph


# Convenience functions for integration

def create_cv_filler_node() -> CVFillerNode:
    """Create and return a CV Filler node instance."""
    return CVFillerNode()

async def process_cv_workflow(
    cv_text: str,
    job_type: Optional[str] = None,
    template_pref: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process CV through the complete workflow.
    
    Args:
        cv_text: Raw CV text content
        job_type: Optional job type hint
        template_pref: Optional template preference
        
    Returns:
        Processing results
    """
    node = CVFillerNode()
    
    # Create initial state
    initial_state: CVFillerState = {
        "cv_text": cv_text,
        "job_type": job_type,
        "template_pref": template_pref,
        "extracted_data": None,
        "pdf_path": None,
        "cloud_url": None,
        "error": None,
        "processing_status": "initialized",
        "metadata": {}
    }
    
    # Process through workflow
    final_state = await node.process_cv_complete(initial_state)
    
    return {
        "success": final_state.get("error") is None,
        "status": final_state.get("processing_status"),
        "pdf_path": final_state.get("pdf_path"),
        "extracted_data": final_state.get("extracted_data"),
        "metadata": final_state.get("metadata", {}),
        "error": final_state.get("error")
    }

def register_node_decorator(node_name: str):
    """
    Decorator for registering nodes with Rolevate LangGraph system.
    
    Args:
        node_name: Name of the node
        
    Returns:
        Decorator function
    """
    def decorator(node_class):
        # Register the node in a global registry (this would be part of Rolevate's system)
        logger.info(f"Registered LangGraph node: {node_name}")
        return node_class
    return decorator

# Register CV Filler node
@register_node_decorator("cv_filler_node")
class RegisteredCVFillerNode(CVFillerNode):
    """Registered CV Filler node for Rolevate ecosystem."""
    pass

# Import datetime for timestamps
from datetime import datetime