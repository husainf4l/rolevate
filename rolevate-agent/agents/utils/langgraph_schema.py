"""
LangGraph Studio Visual Node Schema for CV Processing Pipeline
Defines the visual workflow representation of the CV enhancement process
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json

class CVProcessingNode:
    """Base class for CV processing nodes"""
    
    def __init__(self, node_id: str, node_type: str, title: str, description: str = ""):
        self.node_id = node_id
        self.node_type = node_type
        self.title = title
        self.description = description
        self.inputs: List[str] = []
        self.outputs: List[str] = []
        self.status = "ready"
        self.metadata: Dict[str, Any] = {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.node_id,
            "type": self.node_type,
            "title": self.title,
            "description": self.description,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "status": self.status,
            "metadata": self.metadata
        }

class CVPipelineSchema:
    """LangGraph Studio compatible schema for CV processing pipeline"""
    
    def __init__(self):
        self.nodes: List[CVProcessingNode] = []
        self.edges: List[Dict[str, str]] = []
        self.schema_version = "1.0.0"
        self.created_at = datetime.utcnow().isoformat()
        
        self._initialize_pipeline()
    
    def _initialize_pipeline(self):
        """Initialize the CV processing pipeline nodes"""
        
        # Input Node
        input_node = CVProcessingNode(
            node_id="input",
            node_type="input",
            title="📄 CV Input",
            description="Upload and parse CV documents (PDF, DOCX, TXT)"
        )
        input_node.outputs = ["raw_cv_data"]
        input_node.metadata = {
            "supported_formats": ["pdf", "docx", "txt"],
            "max_file_size": "10MB",
            "icon": "📄"
        }
        
        # Text Extraction Node
        extraction_node = CVProcessingNode(
            node_id="extraction",
            node_type="processor", 
            title="🔍 Text Extraction",
            description="Extract and structure text from uploaded documents"
        )
        extraction_node.inputs = ["raw_cv_data"]
        extraction_node.outputs = ["extracted_text"]
        extraction_node.metadata = {
            "tools": ["PyPDF2", "python-docx"],
            "processing_time": "1-3s",
            "icon": "🔍"
        }
        
        # Duplicate Detection Node
        deduplication_node = CVProcessingNode(
            node_id="deduplication",
            node_type="enhancer",
            title="🔄 Duplicate Detection",
            description="Identify and remove duplicate experiences using cached similarity analysis"
        )
        deduplication_node.inputs = ["extracted_text"]
        deduplication_node.outputs = ["unique_experiences"]
        deduplication_node.metadata = {
            "algorithm": "text_similarity",
            "caching": True,
            "threshold": 0.8,
            "icon": "🔄"
        }
        
        # Text Formatting Node
        formatting_node = CVProcessingNode(
            node_id="formatting",
            node_type="enhancer",
            title="✨ Smart Formatting",
            description="Apply intelligent text formatting and structure enhancement"
        )
        formatting_node.inputs = ["unique_experiences"]
        formatting_node.outputs = ["formatted_data"]
        formatting_node.metadata = {
            "features": ["bullet_points", "consistent_dates", "action_verbs"],
            "icon": "✨"
        }
        
        # Template Selection Node
        template_selection_node = CVProcessingNode(
            node_id="template_selection",
            node_type="ai_processor",
            title="🎯 AI Template Selection",
            description="Select optimal template based on CV content and target industry"
        )
        template_selection_node.inputs = ["formatted_data"]
        template_selection_node.outputs = ["selected_template"]
        template_selection_node.metadata = {
            "ai_enabled": True,
            "templates": ["classic_cv", "modern", "creative"],
            "scoring_criteria": ["industry_match", "experience_level", "role_type"],
            "icon": "🎯"
        }
        
        # Template Rendering Node
        rendering_node = CVProcessingNode(
            node_id="rendering",
            node_type="generator",
            title="🎨 Template Rendering",
            description="Render CV using selected template with Jinja2 engine"
        )
        rendering_node.inputs = ["formatted_data", "selected_template"]
        rendering_node.outputs = ["rendered_html"]
        rendering_node.metadata = {
            "engine": "jinja2",
            "output_formats": ["html", "pdf"],
            "preview_available": True,
            "icon": "🎨"
        }
        
        # Cloud Storage Node  
        storage_node = CVProcessingNode(
            node_id="storage",
            node_type="output",
            title="☁️ Cloud Storage",
            description="Upload generated CV to cloud storage with retry logic"
        )
        storage_node.inputs = ["rendered_html"]
        storage_node.outputs = ["cloud_url"]
        storage_node.metadata = {
            "providers": ["AWS S3", "Azure Blob"],
            "retry_attempts": 3,
            "expiry": "7 days",
            "icon": "☁️"
        }
        
        # WebSocket Streaming Node
        streaming_node = CVProcessingNode(
            node_id="streaming",
            node_type="realtime",
            title="📡 Real-time Updates",
            description="Stream progress updates to client via WebSocket"
        )
        streaming_node.inputs = ["*"]  # Receives from all nodes
        streaming_node.outputs = ["progress_updates"]
        streaming_node.metadata = {
            "protocol": "websocket",
            "update_frequency": "real-time",
            "icon": "📡"
        }
        
        # Add all nodes
        self.nodes = [
            input_node,
            extraction_node,
            deduplication_node,
            formatting_node,
            template_selection_node,
            rendering_node,
            storage_node,
            streaming_node
        ]
        
        # Define edges (connections)
        self.edges = [
            {"from": "input", "to": "extraction"},
            {"from": "extraction", "to": "deduplication"},
            {"from": "deduplication", "to": "formatting"},
            {"from": "formatting", "to": "template_selection"},
            {"from": "template_selection", "to": "rendering"},
            {"from": "formatting", "to": "rendering"},  # Parallel input
            {"from": "rendering", "to": "storage"},
            # Streaming connections (monitoring all nodes)
            {"from": "input", "to": "streaming"},
            {"from": "extraction", "to": "streaming"},
            {"from": "deduplication", "to": "streaming"},
            {"from": "formatting", "to": "streaming"},
            {"from": "template_selection", "to": "streaming"},
            {"from": "rendering", "to": "streaming"},
            {"from": "storage", "to": "streaming"}
        ]
    
    def get_node_by_id(self, node_id: str) -> Optional[CVProcessingNode]:
        """Get node by ID"""
        return next((node for node in self.nodes if node.node_id == node_id), None)
    
    def update_node_status(self, node_id: str, status: str, metadata: Dict[str, Any] = None):
        """Update node status and metadata"""
        node = self.get_node_by_id(node_id)
        if node:
            node.status = status
            if metadata:
                node.metadata.update(metadata)
    
    def to_langgraph_schema(self) -> Dict[str, Any]:
        """Export as LangGraph Studio compatible schema"""
        return {
            "version": self.schema_version,
            "created_at": self.created_at,
            "pipeline": "cv_processing",
            "description": "AI-Enhanced CV Processing Pipeline with Real-time Updates",
            "nodes": [node.to_dict() for node in self.nodes],
            "edges": self.edges,
            "metadata": {
                "total_nodes": len(self.nodes),
                "total_edges": len(self.edges),
                "enhancement_count": 7,
                "supports_realtime": True,
                "supports_preview": True,
                "cloud_enabled": True
            }
        }
    
    def to_json(self, indent: int = 2) -> str:
        """Export schema as JSON string"""
        return json.dumps(self.to_langgraph_schema(), indent=indent)
    
    def save_schema(self, filepath: str):
        """Save schema to file"""
        with open(filepath, 'w') as f:
            f.write(self.to_json())


# Global pipeline schema instance
cv_pipeline_schema = CVPipelineSchema()