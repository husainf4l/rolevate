"""Nodes for the CV processing workflow"""

# Core workflow nodes
from app.agent.nodes.input_node import input_node
from app.agent.nodes.data_cleaner_node import data_cleaner_node
from app.agent.nodes.content_writer_node import content_writer_node
from app.agent.nodes.section_ranker_node import section_ranker_node
from app.agent.nodes.template_selector_node import template_selector_node
from app.agent.nodes.pdf_renderer_node import pdf_renderer_node
from app.agent.nodes.optimizer_node import optimizer_node
from app.agent.nodes.storage_node import storage_node

# Legacy/Alternative nodes
from app.agent.nodes.extraction_node import extraction_node
from app.agent.nodes.enhancement_node import enhancement_node
from app.agent.nodes.export_node import export_node
from app.agent.nodes.input_understanding_node import input_understanding_node
from app.agent.nodes.data_structuring_node import data_structuring_node
from app.agent.nodes.draft_generation_node import draft_generation_node
from app.agent.nodes.template_rendering_node import template_rendering_node
from app.agent.nodes.output_optimization_node import output_optimization_node

# Chat functionality
from app.agent.nodes.chat_node import chat_node

__all__ = [
    # Core workflow nodes (primary 8-node pipeline)
    "input_node",
    "data_cleaner_node", 
    "content_writer_node",
    "section_ranker_node",
    "template_selector_node",
    "pdf_renderer_node", 
    "optimizer_node",
    "storage_node",
    
    # Legacy/Alternative nodes
    "extraction_node", 
    "enhancement_node", 
    "export_node",
    "input_understanding_node",
    "data_structuring_node", 
    "draft_generation_node",
    "template_rendering_node",
    "output_optimization_node",
    
    # Chat functionality
    "chat_node"
]
