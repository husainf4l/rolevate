"""
Improved Job Post Creation Agent using LangGraph

This module implements a truly conversational HR expert workflow for creating job posts.
It focuses on building the job post through natural conversation, step by step.
"""

from typing import TypedDict, List, Annotated, Dict, Any
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
import operator
from .tools.job_post_webhook import send_job_post_to_api
import json
import re

# Define the state type for the job post creation workflow
class JobPostAgentState(TypedDict):
    """State definition for the job post creation agent workflow."""
    messages: Annotated[List[BaseMessage], operator.add]
    job_data: Dict[str, Any]
    current_step: str
    company_info: Dict[str, Any]
    is_complete: bool
    conversation_history: List[str]

def initialize_conversation_node(state: JobPostAgentState) -> JobPostAgentState:
    """Initialize a friendly conversation to understand what job they want to create."""
    
    company_info = state.get("company_info", {})
    company_name = company_info.get("company_name", "your company")
    
    # Get user's initial input
    messages = state.get("messages", [])
    user_input = ""
    if messages:
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                user_input = msg.content
                break
    
    # Extract basic info from user input
    job_title = user_input.strip() if user_input else ""
    
    # Create initial response based on what user said
    if job_title:
        response = f"""Great! I see you want to create a job post for a **{job_title}** position at {company_name}. 

Let me help you create an outstanding job description that will attract the best candidates! 📝

To start, could you tell me a bit more about this role? For example:
- What's the exact job title you'd like to use? (e.g., "Senior .NET Developer", "Full-Stack .NET Engineer")
- Which department or team will they be joining?
- Is this for a specific project or general development work?

Let's make this job post shine! ✨"""
    else:
        response = f"""Hello! I'm your AI HR Expert, ready to help you create an amazing job post for {company_name}! 👋

I see you want to create a job posting. Could you tell me:
- What position are you looking to hire for?
- What's the main role or department?

For example: "Senior Software Engineer", "Marketing Manager", "Sales Representative", etc.

Let's build something great together! 🚀"""

    # Initialize job data
    job_data = {
        "title": "",
        "description": "",
        "requirements": "",
        "responsibilities": "",
        "benefits": "",
        "skills": [],
        "experienceLevel": "",
        "location": "",
        "workType": "",
        "salaryMin": None,
        "salaryMax": None,
        "currency": "USD",
        "department": "",
        "enableAiInterview": False,
        "isFeatured": False
    }

    return {
        "messages": [AIMessage(content=response)],
        "job_data": job_data,
        "current_step": "getting_basic_info",
        "company_info": company_info,
        "is_complete": False,
        "conversation_history": [f"User mentioned: {job_title}"]
    }

def conversational_node(state: JobPostAgentState) -> JobPostAgentState:
    """Main conversational node that builds the job post through natural dialogue."""
    
    try:
        from openai import OpenAI
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return create_error_response(state, "OpenAI API key not found")
            
        client = OpenAI(api_key=api_key)
        
        # Get current state
        messages = state.get("messages", [])
        job_data = state.get("job_data", {})
        current_step = state.get("current_step", "getting_basic_info")
        company_info = state.get("company_info", {})
        conversation_history = state.get("conversation_history", [])
        
        # Get the user's latest response
        user_message = ""
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                user_message = msg.content
                break
        
        if not user_message:
            return create_error_response(state, "No user message found")

        # Add to conversation history
        conversation_history.append(f"User: {user_message}")
        
        # Create the HR expert system prompt
        system_prompt = f"""You are an expert HR professional with 15+ years of experience creating compelling job posts. You're helping create a job post for {company_info.get('company_name', 'the company')}.

CURRENT JOB DATA COLLECTED:
{json.dumps(job_data, indent=2)}

CONVERSATION HISTORY:
{chr(10).join(conversation_history[-10:])}  # Last 10 exchanges

CURRENT STEP: {current_step}

YOUR ROLE:
- Have a natural, friendly conversation to collect job details
- Ask 1-2 questions at a time, don't overwhelm
- Give specific examples and suggestions
- Extract information from user responses and update job data
- Be encouraging and professional
- Use emojis appropriately
- Progress through these areas naturally:
  1. Job title and department
  2. Experience level and seniority
  3. Key responsibilities 
  4. Required skills and qualifications
  5. Location and work type (remote/hybrid/onsite)
  6. Salary range and benefits
  7. Final review and confirmation

INSTRUCTIONS:
- Parse the user's response for job-related information
- Ask follow-up questions to get more specific details
- When you have enough information in one area, naturally move to the next
- Don't rush - build a comprehensive job post through conversation
- When user seems satisfied with all details, ask if they're ready to publish

RESPONSE FORMAT:
- Be conversational and engaging
- Acknowledge what they said
- Ask specific follow-up questions
- Provide examples when helpful
- Keep responses concise but informative

Based on their response: "{user_message}", continue the conversation to gather more job post details."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=600,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Extract job information from the user's message
        updated_job_data = extract_job_info(user_message, job_data)
        
        # Determine if we're ready to complete
        is_complete = check_completion_readiness(user_message, updated_job_data)
        
        # Update conversation history
        conversation_history.append(f"AI: {ai_response}")
        
        # Determine next step
        next_step = determine_next_step(current_step, updated_job_data, user_message)
        
        return {
            "messages": [AIMessage(content=ai_response)],
            "job_data": updated_job_data,
            "current_step": next_step,
            "company_info": company_info,
            "is_complete": is_complete,
            "conversation_history": conversation_history
        }
        
    except Exception as e:
        return create_error_response(state, f"Error in conversation: {str(e)}")

def finalize_job_post_node(state: JobPostAgentState) -> JobPostAgentState:
    """Finalize and submit the job post."""
    
    job_data = state.get("job_data", {})
    company_info = state.get("company_info", {})
    
    try:
        # Final validation
        if not job_data.get("title") or not job_data.get("description"):
            return {
                "messages": [AIMessage(content="I need a bit more information before we can publish this job post. Could you provide more details about the job title and main responsibilities?")],
                "job_data": job_data,
                "current_step": "getting_basic_info",
                "company_info": company_info,
                "is_complete": False,
                "conversation_history": state.get("conversation_history", [])
            }
        
        # Send to API
        api_response = send_job_post_to_api(
            job_data=job_data,
            company_id=company_info.get("company_id"),
            company_name=company_info.get("company_name")
        )
        
        if api_response.get("success", False):
            success_message = f"""🎉 **Perfect! Your job post has been published successfully!**

**"{job_data.get('title', 'Job Post')}"** is now live and ready to attract amazing candidates!

**Summary:**
📋 **Title:** {job_data.get('title', 'N/A')}
🏢 **Department:** {job_data.get('department', 'N/A')} 
📍 **Location:** {job_data.get('location', 'Not specified')}
💼 **Experience Level:** {job_data.get('experienceLevel', 'Not specified')}

Your job post is optimized to attract the right candidates. Great work! 🚀

Would you like to create another job post or make any adjustments to this one?"""
        else:
            success_message = f"""✅ **Job Post Created Successfully!**

I've helped you create a comprehensive job post for **{job_data.get('title', 'the position')}**. 

📝 **Job Post Details:**
- **Title:** {job_data.get('title', 'N/A')}
- **Department:** {job_data.get('department', 'N/A')}
- **Skills Required:** {', '.join(job_data.get('skills', [])[:3])}{'...' if len(job_data.get('skills', [])) > 3 else ''}
- **Experience Level:** {job_data.get('experienceLevel', 'N/A')}

Note: There was a minor issue with the publishing system (API connection), but your job post data is complete and ready to be posted manually if needed.

Would you like to create another job post?"""
            
        return {
            "messages": [AIMessage(content=success_message)],
            "job_data": job_data,
            "current_step": "complete",
            "company_info": company_info,
            "is_complete": True,
            "conversation_history": state.get("conversation_history", [])
        }
        
    except Exception as e:
        error_message = f"""❌ **Error Publishing Job Post**

I encountered an issue while trying to publish your job post: {str(e)}

However, I've successfully helped you create all the job post content! Here's what we built together:

**Job Title:** {job_data.get('title', 'N/A')}
**Description:** {job_data.get('description', 'N/A')[:100]}...

You can manually publish this job post or try again. Would you like to create another one?"""

        return {
            "messages": [AIMessage(content=error_message)],
            "job_data": job_data,
            "current_step": "error",
            "company_info": company_info,
            "is_complete": False,
            "conversation_history": state.get("conversation_history", [])
        }

def extract_job_info(user_message: str, current_job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract job information from user message and update job data."""
    
    job_data = current_job_data.copy()
    message_lower = user_message.lower()
    
    # Extract job title if not set
    if not job_data.get("title"):
        # Look for common patterns
        title_patterns = [
            r"(?:for a|for an|hiring a|hiring an|need a|want a|looking for a)\s+(.+?)(?:\s+position|\s+role|$)",
            r"^(.+?)\s+(?:position|role|job)$",
            r"^(.+?)(?:\s+at|\s+for|\s+in)?\s*$"
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, user_message.strip(), re.IGNORECASE)
            if match:
                potential_title = match.group(1).strip()
                if len(potential_title) > 2 and len(potential_title) < 50:
                    job_data["title"] = potential_title.title()
                    break
    
    # Extract experience level
    experience_keywords = {
        "junior": ["junior", "entry", "graduate", "new grad", "beginner", "trainee"],
        "mid": ["mid", "intermediate", "regular", "standard", "experienced"],
        "senior": ["senior", "lead", "principal", "expert", "advanced"],
        "executive": ["executive", "director", "head", "chief", "vp", "vice president"]
    }
    
    for level, keywords in experience_keywords.items():
        if any(keyword in message_lower for keyword in keywords):
            job_data["experienceLevel"] = level
            break
    
    # Extract work type
    if any(word in message_lower for word in ["remote", "work from home", "wfh"]):
        job_data["workType"] = "remote"
    elif any(word in message_lower for word in ["hybrid", "mixed", "flexible"]):
        job_data["workType"] = "hybrid"
    elif any(word in message_lower for word in ["onsite", "office", "in-person"]):
        job_data["workType"] = "onsite"
    
    # Extract skills
    common_skills = [
        "python", "javascript", "java", "c#", ".net", "react", "angular", "vue",
        "node.js", "sql", "mongodb", "aws", "azure", "docker", "kubernetes",
        "git", "agile", "scrum", "leadership", "communication", "teamwork"
    ]
    
    found_skills = []
    for skill in common_skills:
        if skill.lower() in message_lower:
            found_skills.append(skill)
    
    if found_skills:
        job_data["skills"] = list(set(job_data.get("skills", []) + found_skills))
    
    # Build description from conversation
    if len(user_message) > 20:
        current_desc = job_data.get("description", "")
        if current_desc:
            job_data["description"] = current_desc + "\n\n" + user_message
        else:
            job_data["description"] = user_message
    
    return job_data

def check_completion_readiness(user_message: str, job_data: Dict[str, Any]) -> bool:
    """Check if the user wants to complete the job post."""
    
    completion_keywords = [
        "ready", "publish", "post it", "create it", "done", "finished", 
        "looks good", "that's it", "submit", "final", "complete"
    ]
    
    message_lower = user_message.lower()
    user_wants_completion = any(keyword in message_lower for keyword in completion_keywords)
    
    # Also check if we have minimum required data
    has_minimum_data = (
        job_data.get("title") and 
        (job_data.get("description") or job_data.get("skills"))
    )
    
    return user_wants_completion and has_minimum_data

def determine_next_step(current_step: str, job_data: Dict[str, Any], user_message: str) -> str:
    """Determine the next step in the conversation flow."""
    
    steps = [
        "getting_basic_info",
        "collecting_details", 
        "finalizing",
        "complete"
    ]
    
    # If user wants to complete and we have minimum data
    if check_completion_readiness(user_message, job_data):
        return "finalizing"
    
    # Progress based on what we have
    if job_data.get("title") and current_step == "getting_basic_info":
        return "collecting_details"
    
    return current_step

def create_error_response(state: JobPostAgentState, error_msg: str) -> JobPostAgentState:
    """Create an error response while maintaining conversation state."""
    
    friendly_error = f"""I apologize, but I encountered a small issue: {error_msg}

No worries though! Let's continue building your job post. Could you tell me more about the position you want to create?"""
    
    return {
        "messages": [AIMessage(content=friendly_error)],
        "job_data": state.get("job_data", {}),
        "current_step": state.get("current_step", "getting_basic_info"),
        "company_info": state.get("company_info", {}),
        "is_complete": False,
        "conversation_history": state.get("conversation_history", [])
    }

# Create the job post creation graph
def create_job_post_graph() -> StateGraph:
    """Create a workflow graph for conversational job post creation."""
    
    workflow = StateGraph(JobPostAgentState)
    
    # Add nodes
    workflow.add_node("initialize", initialize_conversation_node)
    workflow.add_node("converse", conversational_node)
    workflow.add_node("finalize", finalize_job_post_node)
    
    # Set up the edges
    workflow.add_edge(START, "initialize")
    workflow.add_edge("initialize", "converse")
    
    # Conditional edge based on completion
    def should_finalize(state: JobPostAgentState) -> str:
        if state.get("is_complete", False):
            return "finalize"
        else:
            return "converse"
    
    workflow.add_conditional_edges(
        "converse",
        should_finalize,
        {
            "converse": "converse",
            "finalize": "finalize"
        }
    )
    
    workflow.add_edge("finalize", END)
    
    return workflow.compile()

# Initialize the job post graph
job_post_graph = create_job_post_graph()

def run_job_post_agent(user_input: str, company_id: str = None, company_name: str = None) -> List[BaseMessage]:
    """Run the conversational job post creation agent.
    
    Args:
        user_input: User's input for this turn of conversation
        company_id: Company ID
        company_name: Company name
        
    Returns:
        A list of messages from the conversation
    """
    
    # Create initial state
    initial_state = {
        "messages": [HumanMessage(content=user_input)],
        "job_data": {},
        "current_step": "getting_basic_info",
        "company_info": {
            "company_id": company_id or "demo-company-123",
            "company_name": company_name or "Your Company"
        },
        "is_complete": False,
        "conversation_history": []
    }
    
    # Run the graph
    result = job_post_graph.invoke(initial_state)
    
    return result["messages"]
