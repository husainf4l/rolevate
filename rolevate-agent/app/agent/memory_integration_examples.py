"""
Node Memory Integration Examples
Demonstrates how existing nodes should interact with the standardized CV memory system
"""
from typing import Dict, Any
from loguru import logger

from app.agent.shared_memory import (
    CVMemoryStructure,
    get_cv_memory_from_state,
    update_cv_memory_in_state
)
from app.agent.memory_integration import (
    cv_collector_memory,
    cv_writer_memory,
    template_agent_memory,
    file_agent_memory
)


async def example_collector_node_integration(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Example: How CVCollectorAgent should update personal_info, education, experience, skills, languages
    
    This shows the pattern for nodes that collect and store CV data
    """
    logger.info("🔍 CVCollectorAgent: Processing user input for CV data collection")
    
    # Get standardized CV memory from state
    cv_memory = get_cv_memory_from_state(state)
    
    # Extract user input
    user_message = state.get("user_message", "")
    
    # Simulate parsing personal info from user message
    if "my name is" in user_message.lower() or "i am" in user_message.lower():
        # Extract personal information
        personal_data = {
            "full_name": "John Doe",  # Extracted from message
            "email": "john.doe@email.com",
            "phone": "+1-555-123-4567"
        }
        
        # Update memory using collector agent interface
        cv_memory = cv_collector_memory.update_personal_info(cv_memory, personal_data)
        logger.info("✅ Updated personal_info in CV memory")
    
    # Simulate adding work experience
    if "worked at" in user_message.lower() or "experience" in user_message.lower():
        experience_entry = {
            "company": "Tech Corp",
            "position": "Software Developer",
            "start_date": "2020-01",
            "end_date": "2023-12", 
            "description": "Developed web applications using Python and React",
            "achievements": [
                "Improved system performance by 40%",
                "Led a team of 3 developers"
            ]
        }
        
        # Add experience using collector interface
        cv_memory = cv_collector_memory.add_experience_entry(cv_memory, experience_entry)
        logger.info("✅ Added experience entry to CV memory")
    
    # Simulate adding education
    if "studied" in user_message.lower() or "graduated" in user_message.lower():
        education_entry = {
            "institution": "University of Technology",
            "degree": "Bachelor of Science in Computer Science",
            "start_date": "2016",
            "end_date": "2020",
            "gpa": "3.8"
        }
        
        # Add education using collector interface
        cv_memory = cv_collector_memory.add_education_entry(cv_memory, education_entry)
        logger.info("✅ Added education entry to CV memory")
    
    # Simulate updating skills
    if "skills" in user_message.lower():
        skills = ["Python", "JavaScript", "React", "Node.js", "SQL", "AWS"]
        cv_memory = cv_collector_memory.update_skills(cv_memory, skills)
        logger.info("✅ Updated skills in CV memory")
    
    # Simulate adding languages
    if "language" in user_message.lower():
        languages = [
            {"language": "English", "level": "Native"},
            {"language": "Spanish", "level": "Conversational"}
        ]
        cv_memory = cv_collector_memory.update_languages(cv_memory, languages)
        logger.info("✅ Updated languages in CV memory")
    
    # Update state with modified memory
    update_cv_memory_in_state(state, cv_memory)
    
    # Update processing step
    state["processing_step"] = "data_collection_complete"
    
    return state


async def example_writer_node_integration(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Example: How CVWriterAgent should enrich and rewrite content
    
    This shows the pattern for nodes that enhance existing CV content
    """
    logger.info("✍️ CVWriterAgent: Enriching and rewriting CV content")
    
    # Get standardized CV memory from state
    cv_memory = get_cv_memory_from_state(state)
    
    # Enhance professional summary
    if cv_memory.get("personal_info", {}).get("full_name"):
        enhanced_summary = (
            "Experienced software developer with 5+ years of expertise in full-stack development. "
            "Proven track record of delivering high-quality applications and leading development teams. "
            "Passionate about leveraging modern technologies to solve complex business challenges."
        )
        
        cv_memory = cv_writer_memory.update_professional_summary(cv_memory, enhanced_summary)
        logger.info("✅ Enhanced professional summary")
    
    # Enhance experience descriptions
    for i, experience in enumerate(cv_memory.get("experience", [])):
        if experience.get("achievements"):
            # Enhance achievement descriptions
            enhanced_achievements = []
            for achievement in experience["achievements"]:
                enhanced = f"• {achievement.capitalize()}"
                if not any(char in achievement for char in "0123456789%$"):
                    enhanced += " (quantified impact to be measured)"
                enhanced_achievements.append(enhanced)
            
            # Update the experience entry
            experience["achievements"] = enhanced_achievements
    
    # Update state with enhanced memory
    update_cv_memory_in_state(state, cv_memory)
    
    state["processing_step"] = "content_enhancement_complete"
    
    return state


async def example_template_node_integration(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Example: How TemplateAgent should read selected_template and generate HTML/PDF
    
    This shows the pattern for nodes that handle template selection and rendering
    """
    logger.info("🎨 TemplateAgent: Processing template selection and rendering")
    
    # Get standardized CV memory from state
    cv_memory = get_cv_memory_from_state(state)
    
    # Check if template is selected, use default if not
    if not cv_memory.get("selected_template") or cv_memory["selected_template"] == "":
        cv_memory = template_agent_memory.set_selected_template(cv_memory, "Modern")
        logger.info("✅ Set default template: Modern")
    
    # Get template context for rendering
    template_context = template_agent_memory.get_template_context(cv_memory)
    
    # Simulate HTML generation (this would use actual template rendering)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{template_context['personal_info'].get('full_name', 'CV')} - CV</title>
        <style>/* {cv_memory['selected_template']} template styles */</style>
    </head>
    <body>
        <h1>{template_context['personal_info'].get('full_name', 'Your Name')}</h1>
        <div class="contact">
            <p>Email: {template_context['personal_info'].get('email', '')}</p>
            <p>Phone: {template_context['personal_info'].get('phone', '')}</p>
        </div>
        <!-- More template content would be here -->
    </body>
    </html>
    """
    
    # Store rendered content in state
    state["rendered_html"] = html_content
    state["selected_template"] = {
        "name": cv_memory["selected_template"],
        "context": template_context
    }
    
    # Update state with any template-related memory changes
    update_cv_memory_in_state(state, cv_memory)
    
    state["processing_step"] = "template_rendering_complete"
    
    return state


async def example_file_node_integration(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Example: How FileAgent should update generated_pdf_url after saving
    
    This shows the pattern for nodes that handle file operations
    """
    logger.info("💾 FileAgent: Saving PDF and updating file URL")
    
    # Get standardized CV memory from state
    cv_memory = get_cv_memory_from_state(state)
    
    # Simulate PDF generation and file saving
    rendered_html = state.get("rendered_html", "")
    
    if rendered_html:
        # Simulate PDF generation (would use actual PDF library)
        pdf_filename = f"cv_{cv_memory.get('personal_info', {}).get('full_name', 'unknown').lower().replace(' ', '_')}.pdf"
        pdf_url = f"/api/downloads/{pdf_filename}"
        
        # Update memory with generated PDF URL
        cv_memory = file_agent_memory.set_generated_pdf_url(cv_memory, pdf_url)
        logger.info(f"✅ Generated PDF available at: {pdf_url}")
        
        # Store additional file info in state
        state["pdf_info"] = {
            "filename": pdf_filename,
            "url": pdf_url,
            "generated_at": "2025-10-15T10:30:00Z"
        }
    
    # Update state with file-related memory changes
    update_cv_memory_in_state(state, cv_memory)
    
    state["processing_step"] = "file_generation_complete"
    
    return state


async def example_feedback_node_integration(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Example: How FeedbackAgent should analyze CV and provide suggestions
    
    This shows the pattern for nodes that provide feedback and analysis
    """
    logger.info("🔍 FeedbackAgent: Analyzing CV completeness and providing feedback")
    
    # Get standardized CV memory from state
    cv_memory = get_cv_memory_from_state(state)
    
    # Analyze completeness using feedback agent interface
    from app.agent.memory_integration import feedback_agent_memory
    analysis = feedback_agent_memory.analyze_completeness(cv_memory)
    
    # Generate contextual feedback
    feedback_messages = []
    
    if analysis["completion_percentage"] < 50:
        feedback_messages.append("Your CV needs more information to be complete.")
    elif analysis["completion_percentage"] < 80:
        feedback_messages.append("Good progress! Add a few more details to strengthen your CV.")
    else:
        feedback_messages.append("Excellent! Your CV looks comprehensive and ready.")
    
    # Add specific suggestions
    feedback_messages.extend(analysis["suggestions"])
    
    # Store feedback in state
    state["feedback_analysis"] = analysis
    state["feedback_messages"] = feedback_messages
    
    logger.info(f"✅ CV Analysis: {analysis['completion_percentage']}% complete")
    
    state["processing_step"] = "feedback_analysis_complete"
    
    return state


# Example of how to integrate with FastAPI endpoints
def example_fastapi_integration():
    """
    Example: How FastAPI endpoints should work with the memory system
    """
    
    # In chat endpoint
    async def chat_endpoint_example(session_id: str, message: str):
        from app.agent.memory_integration import memory_integration_manager
        
        # Prepare workflow state from chat session
        workflow_state = memory_integration_manager.prepare_workflow_state_from_session(
            session_id, message
        )
        
        # Process through workflow nodes (example sequence)
        workflow_state = await example_collector_node_integration(workflow_state)
        workflow_state = await example_writer_node_integration(workflow_state)
        workflow_state = await example_template_node_integration(workflow_state)
        workflow_state = await example_file_node_integration(workflow_state)
        workflow_state = await example_feedback_node_integration(workflow_state)
        
        # Update chat session with results
        memory_integration_manager.update_chat_session_from_workflow(
            session_id, workflow_state
        )
        
        return {
            "response": "CV updated successfully!",
            "feedback": workflow_state.get("feedback_messages", []),
            "completion": workflow_state.get("feedback_analysis", {}).get("completion_percentage", 0),
            "pdf_url": workflow_state.get("cv_memory", {}).get("generated_pdf_url", "")
        }


if __name__ == "__main__":
    # Test the integration examples
    import asyncio
    
    async def test_memory_integration():
        """Test the memory integration examples"""
        
        # Create test state
        test_state = {
            "user_message": "My name is John Doe and I worked at Tech Corp as a Software Developer",
            "cv_memory": {},
            "processing_step": "initialized"
        }
        
        print("🧪 Testing CV Builder Memory Integration")
        print("=" * 50)
        
        # Test data collection
        test_state = await example_collector_node_integration(test_state)
        print(f"After Collection: {test_state['processing_step']}")
        
        # Test content enhancement  
        test_state = await example_writer_node_integration(test_state)
        print(f"After Writing: {test_state['processing_step']}")
        
        # Test template rendering
        test_state = await example_template_node_integration(test_state)
        print(f"After Template: {test_state['processing_step']}")
        
        # Test file generation
        test_state = await example_file_node_integration(test_state)
        print(f"After File Gen: {test_state['processing_step']}")
        
        # Test feedback analysis
        test_state = await example_feedback_node_integration(test_state)
        print(f"Final State: {test_state['processing_step']}")
        
        # Show final memory state
        cv_memory = get_cv_memory_from_state(test_state)
        print(f"\n📊 Final CV Memory Structure:")
        print(f"- Personal Info: {bool(cv_memory.get('personal_info', {}).get('full_name'))}")
        print(f"- Experience: {len(cv_memory.get('experience', []))} entries")
        print(f"- Education: {len(cv_memory.get('education', []))} entries")
        print(f"- Skills: {len(cv_memory.get('skills', []))} items")
        print(f"- Template: {cv_memory.get('selected_template', 'Not set')}")
        print(f"- PDF URL: {cv_memory.get('generated_pdf_url', 'Not generated')}")
        
        print("\n✅ Memory integration test completed successfully!")
    
    # Run the test
    # asyncio.run(test_memory_integration())