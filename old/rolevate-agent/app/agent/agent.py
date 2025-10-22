"""
Main Agent Orchestrator using LangGraph
Coordinates the CV processing workflow
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from loguru import logger

from app.models.schemas import CVData
from app.agent.nodes.extraction_node import extraction_node
from app.agent.nodes.enhancement_node import enhancement_node
from app.agent.nodes.export_node import export_node


class AgentState(TypedDict):
    """State for the CV processing agent workflow"""
    messages: Annotated[Sequence[BaseMessage], "The messages in the conversation"]
    cv_text: str
    cv_data: CVData | None
    template_name: str
    output_format: str
    enhance: bool
    output_path: str | None
    error: str | None


class CVProcessingAgent:
    """
    LangGraph-based agent for orchestrating CV processing workflow
    
    Workflow:
    1. Extract CV data from text
    2. Optionally enhance the data
    3. Export to desired format
    """
    
    def __init__(self):
        """Initialize the agent workflow"""
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
        logger.info("CV Processing Agent initialized with LangGraph workflow")
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("extract", extraction_node)
        workflow.add_node("enhance", enhancement_node)
        workflow.add_node("export", export_node)
        
        # Define edges
        workflow.set_entry_point("extract")
        
        # Conditional edge: enhance if requested
        workflow.add_conditional_edges(
            "extract",
            self._should_enhance,
            {
                "enhance": "enhance",
                "export": "export"
            }
        )
        
        workflow.add_edge("enhance", "export")
        workflow.add_edge("export", END)
        
        return workflow
    
    def _should_enhance(self, state: AgentState) -> str:
        """Decide whether to enhance CV data"""
        if state.get("enhance", False) and state.get("cv_data"):
            return "enhance"
        return "export"
    
    async def process_cv(
        self,
        cv_text: str,
        template_name: str = "modern_cv",
        output_format: str = "pdf",
        enhance: bool = False
    ) -> AgentState:
        """
        Process CV through the agent workflow
        
        Args:
            cv_text: Raw CV text content
            template_name: Template to use for export
            output_format: Output format (pdf or docx)
            enhance: Whether to enhance the CV data
            
        Returns:
            Final agent state with output_path
        """
        logger.info(f"Starting CV processing workflow (enhance={enhance})")
        
        initial_state = AgentState(
            messages=[HumanMessage(content=f"Process this CV:\n{cv_text[:200]}...")],
            cv_text=cv_text,
            cv_data=None,
            template_name=template_name,
            output_format=output_format,
            enhance=enhance,
            output_path=None,
            error=None
        )
        
        try:
            # Run the workflow
            final_state = await self.app.ainvoke(initial_state)
            
            if final_state.get("error"):
                logger.error(f"Workflow failed: {final_state['error']}")
            else:
                logger.success(f"Workflow completed: {final_state.get('output_path')}")
            
            return final_state
            
        except Exception as e:
            logger.error(f"Agent workflow error: {e}")
            return {
                **initial_state,
                "error": str(e)
            }
    
    def get_workflow_graph(self) -> str:
        """Get a visual representation of the workflow"""
        try:
            return self.app.get_graph().draw_ascii()
        except:
            return "Workflow: extract -> [enhance?] -> export"
