"""
CV Analysis Agent using LangGraph

This module implements a workflow for processing and analyzing CV documents.
It uses a graph-based approach to extract text from PDFs and analyze them with OpenAI.
"""

from typing import TypedDict, List, Annotated, Dict, Any
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
import operator
from .tools.pdf_extractor import extract_text_from_pdf
from .tools.cv_analysis_api import send_cv_analysis_to_api
from .nodes.whatsapp_notification import send_whatsapp_notification_node
import re

# Define the state type for the graph with clear typing
class AgentState(TypedDict):
    """State definition for the LangGraph agent workflow.
    
    Attributes:
        messages: List of chat messages that accumulate through the workflow
        next: String identifier for the next node in the graph
        context: Dictionary to store data that needs to be shared between nodes
    """
    messages: Annotated[List[BaseMessage], operator.add]  # Annotated for proper accumulation
    next: str  # Controls flow to next node
    context: Dict[str, Any]  # Stores shared data between nodes

def process_input_node(state: AgentState) -> AgentState:
    """Process the user input and extract metadata and file paths.
    
    This node extracts:
    1. Candidate ID from the "Candidate ID:" line
    2. Job Post ID from the "Job Post ID:" line
    3. PDF file path from the "CV:" line
    4. Processes the PDF to extract text content
    
    Args:
        state: The current state of the workflow with messages and context
        
    Returns:
        Updated state with extracted metadata and PDF content
    """
    try:
        # Extract the latest message content
        messages = state["messages"]
        last_message = messages[-1] if messages else None
        
        if not last_message or not hasattr(last_message, 'content'):
            return {
                "messages": [AIMessage(content="No valid input message found.")],
                "next": END,
                "context": {}
            }
            
        content = last_message.content # No need to strip here if regex handles it
        context = state.get("context", {})
        
        print(f"DEBUG: process_input_node - Received content: {content[:250]}...") # Log beginning of content

        # Extract candidate_id, job_post_id, and candidate_phone from the input
        candidate_id = None
        job_post_id = None
        candidate_phone = None
        file_path = None

        # Using regex to extract Candidate ID, Job Post ID, Candidate Phone, and CV path
        # Added re.MULTILINE and ^\s* to handle leading whitespace on lines
        candidate_id_match = re.search(r"^\s*- Candidate ID\s*:\s*(.*?)$", content, re.MULTILINE)
        job_post_id_match = re.search(r"^\s*- Job Post ID\s*:\s*(.*?)$", content, re.MULTILINE)
        candidate_phone_match = re.search(r"^\s*- Candidate Phone\s*:\s*(.*?)$", content, re.MULTILINE)
        pdf_path_match = re.search(r"^\s*- CV\s*:\s*(.*?)$", content, re.MULTILINE)

        candidate_id = candidate_id_match.group(1).strip() if candidate_id_match else None
        job_post_id = job_post_id_match.group(1).strip() if job_post_id_match else None
        candidate_phone = candidate_phone_match.group(1).strip() if candidate_phone_match else None # Extract phone
        file_path = pdf_path_match.group(1).strip() if pdf_path_match else None

        print(f"DEBUG: process_input_node - Extracted Candidate ID: {candidate_id}, Job Post ID: {job_post_id}, Candidate Phone: {candidate_phone}") # Added phone to log

        if not file_path:
            print("ERROR: process_input_node - No PDF file path found")
            return {
                "messages": [AIMessage(content="No PDF file path found in the input.")],
                "next": END,
                "context": context
            }
            
        # Using the PDF extractor tool to extract text
        try:
            extracted_text = extract_text_from_pdf(file_path)
            if not extracted_text or extracted_text.startswith("Error extracting PDF text:"):
                return {
                    "messages": [AIMessage(content=f"Failed to extract text from PDF: {extracted_text}")],
                    "next": END,
                    "context": context
                }
                
            # Store extracted text and file path in context
            context["pdf_content"] = extracted_text
            context["pdf_path"] = file_path
            context["candidate_id"] = candidate_id
            context["job_post_id"] = job_post_id
            context["candidate_phone"] = candidate_phone  # Add phone to context
            
            print(f"DEBUG: process_input_node - PDF Path: {file_path}, Extracted Text Length: {len(extracted_text)}")

            # Generate success response
            response = (f"Successfully processed the PDF from: {file_path}\n"
                      f"Extracted {len(extracted_text)} characters of content.")
            
            return {
                "messages": [AIMessage(content=response)],
                "next": "analyze_content",
                "context": context
            }
        except Exception as e:
            return {
                "messages": [AIMessage(content=f"Error processing PDF file: {str(e)}")],
                "next": END,
                "context": context
            }
            
    except Exception as e:
        # Catch any unexpected errors
        return {
            "messages": [AIMessage(content=f"Unexpected error in input processing: {str(e)}")],
            "next": END,
            "context": {}
        }

def analyze_content(state: AgentState) -> AgentState:
    """Analyze the extracted content from the PDF using OpenAI.
    
    This node:
    1. Takes the PDF content extracted in the previous node
    2. Calls the OpenAI API to analyze the CV content
    3. Returns a structured analysis of the candidate's profile
    
    Args:
        state: The current state of the workflow with messages and context
        
    Returns:
        Updated state with the CV analysis
    """
    context = state.get("context", {})
    pdf_content = context.get("pdf_content", "")
    candidate_id = context.get("candidate_id", "")
    job_post_id = context.get("job_post_id", "")
    candidate_phone = context.get("candidate_phone", "") # Retrieve phone from context

    print(f"DEBUG: analyze_content - Received PDF content length: {len(pdf_content)}")
    print(f"DEBUG: analyze_content - Context keys: {list(context.keys())}")
    # Ensure candidate_phone is in the log if present
    print(f"DEBUG: analyze_content - Candidate ID: {candidate_id}, Job Post ID: {job_post_id}, Candidate Phone: {candidate_phone}")

    if not pdf_content:
        response = "No PDF content available for analysis."
        print("ERROR: analyze_content - No PDF content available")
        return {
            "messages": [AIMessage(content=response)],
            "next": END,
            "context": context
        }
    
    # Use OpenAI to analyze the CV
    try:
        from openai import OpenAI
        import os
        from dotenv import load_dotenv
        
        # Load environment variables (OPENAI_API_KEY)
        load_dotenv()
        
        # Initialize the OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        client = OpenAI(api_key=api_key)
        
        # Extract relevant information about candidate from the job application
        job_post_id = context.get("job_post_id", "Unknown")
        candidate_id = context.get("candidate_id", "Unknown")
        
        # Create the prompt for CV analysis
        system_prompt = """
        You are an expert CV analyzer. Your task is to analyze the provided CV and extract key information including:
        
        1. Candidate's name and contact information
        2. Education background (institutions, degrees, years)
        3. Professional experience (companies, roles, responsibilities, years)
        4. Skills and competencies
        5. Relevant achievements
        
        Then provide a brief assessment of the candidate's suitability for the position.
        Format your response in a structured way with clear sections.
        """
        
        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # You can use gpt-4 for better analysis if available
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the CV content for analysis (Candidate ID: {candidate_id}, Job Post ID: {job_post_id}):\n\n{pdf_content}"}
            ],
            max_tokens=1000
        )
        
        # Extract the analysis from the response
        cv_analysis = response.choices[0].message.content
        
        print(f"DEBUG: analyze_content - CV Analysis received, length: {len(cv_analysis)}")

        # Add the analysis to the context
        context["cv_analysis"] = cv_analysis
        
        return {
            "messages": [AIMessage(content=cv_analysis)],
            "next": "send_to_api",
            "context": context
        }
        
    except Exception as e:
        error_msg = f"Error occurred while analyzing CV with OpenAI: {str(e)}"
        preview = pdf_content[:300] + "..." if len(pdf_content) > 300 else pdf_content
        response = f"Failed to analyze CV with AI. Here's the raw content instead:\n\n{preview}\n\nError: {error_msg}"
        
        return {
            "messages": [AIMessage(content=response)],
            "next": END,
            "context": context
        }

def send_analysis_to_api_node(state: AgentState) -> AgentState:
    """Send the CV analysis to the NestJS API.
    
    This node:
    1. Takes the CV analysis generated by OpenAI
    2. Uses the API tool to send it to the NestJS endpoint
    3. Reports the result of the API call
    
    Args:
        state: The current state of the workflow with messages and context
        
    Returns:
        Updated state with the API response
    """
    context = state.get("context", {})
    pdf_content = context.get("pdf_content", "")
    pdf_path = context.get("pdf_path", "")
    cv_analysis = context.get("cv_analysis", "")
    candidate_id = context.get("candidate_id", "")
    
    # Get application ID from job_post_id - both must be valid UUIDs
    job_post_id = context.get("job_post_id", "")
    
    # Validate candidate ID and application ID
    import uuid
    
    # Validate that both candidate_id and job_post_id are provided
    if not candidate_id:
        return {
            "messages": [AIMessage(content="Candidate ID must be provided in the input.")],
            "next": END,
            "context": context
        }
    
    if not job_post_id:
        return {
            "messages": [AIMessage(content="Job Post ID (Application ID) must be provided in the input.")],
            "next": END,
            "context": context
        }
    
    # Validate both IDs are valid UUIDs
    try:
        uuid.UUID(candidate_id)
        uuid.UUID(job_post_id)
    except ValueError:
        return {
            "messages": [AIMessage(content="Invalid UUID format for candidate_id or application_id (job_post_id).")],
            "next": END,
            "context": context
        }
    
    # Use job_post_id as application_id
    application_id = job_post_id
    
    if not pdf_content or not cv_analysis:
        return {
            "messages": [AIMessage(content="Missing CV content or analysis. Cannot send to API.")],
            "next": END,
            "context": context
        }
    
    try:
        # Send the analysis to the API
        api_response = send_cv_analysis_to_api(
            cv_path=pdf_path,
            extracted_text=pdf_content,
            cv_analysis={"analysis": cv_analysis},  # Wrap in dict for the tool
            candidate_id=candidate_id,
            application_id=application_id,
            job_post_id=job_post_id  # Pass the job post ID
        )
        
        if api_response.get("success", False):
            response_message = (
                f"✓ Successfully sent CV analysis to API\n"
                f"- Application ID: {application_id}\n"
                f"- Candidate ID: {candidate_id}\n"
                f"- API Response: {api_response.get('status_code')}"
            )
            # Continue to the WhatsApp notification node if successful
            next_node = "send_whatsapp_notification"
        else:
            error_detail = api_response.get('error', 'Unknown error')
            
            # Provide more descriptive error messages based on error type or API response
            if "Application ID must be provided" in error_detail:
                response_message = (
                    f"⚠ Failed to send CV analysis to API\n"
                    f"- Error: Application ID (Job Post ID) was not provided or is invalid.\n"
                    f"- Details: {error_detail}\n"
                    f"- Proceeding with WhatsApp notification anyway..."
                )
            elif "Invalid UUID format" in error_detail:
                response_message = (
                    f"⚠ Failed to send CV analysis to API\n"
                    f"- Error: One or more IDs are in an invalid format.\n"
                    f"- Details: {error_detail}\n"
                    f"- Candidate ID: {candidate_id}\n"
                    f"- Application ID: {application_id}\n"
                    f"- Proceeding with WhatsApp notification anyway..."
                )
            elif api_response.get('status_code') == 404:
                known_working_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"  # Known working application ID
                response_message = (
                    f"⚠ Failed to send CV analysis to API\n"
                    f"- Error: The API could not find the specified application or candidate record.\n"
                    f"- Status Code: 404 Not Found\n"
                    f"- Details: {error_detail}\n"
                    f"- Candidate ID: {candidate_id}\n"
                    f"- Application ID: {application_id}\n"
                    f"- Note: This is expected in testing if the IDs don't exist in the database.\n"
                    f"- For testing, try using this known working application ID: {known_working_id}\n"
                    f"- Proceeding with WhatsApp notification anyway..."
                )
            else:
                response_message = (
                    f"⚠ Failed to send CV analysis to API\n"
                    f"- Error: {error_detail}\n"
                    f"- Status Code: {api_response.get('status_code', 'Unknown')}\n"
                    f"- Proceeding with WhatsApp notification anyway..."
                )
            # Continue to WhatsApp notification even if API call fails
            next_node = "send_whatsapp_notification"
        # Add API response to context
        context["api_response"] = api_response
        context["application_id"] = application_id
        
        return {
            "messages": [AIMessage(content=response_message)],
            "next": next_node,
            "context": context
        }
        
    except Exception as e:
        response_message = f"Error sending analysis to API: {str(e)}"
        return {
            "messages": [AIMessage(content=response_message)],
            "next": END,
            "context": context
        }



# Create the CV analysis graphcd
def create_graph() -> StateGraph:
    """Create a workflow graph for CV analysis.
    
    Returns:
        A compiled StateGraph that can be invoked to process CV documents
    """
    # Initialize the workflow graph
    workflow = StateGraph(AgentState)
    
    # Add the nodes
    workflow.add_node("process_input", process_input_node)
    workflow.add_node("analyze_content", analyze_content)
    workflow.add_node("send_to_api", send_analysis_to_api_node)
    workflow.add_node("send_whatsapp_notification", send_whatsapp_notification_node)
    
    # Set up the edges
    workflow.add_edge(START, "process_input")
    workflow.add_edge("process_input", "analyze_content")
    workflow.add_edge("analyze_content", "send_to_api")
    workflow.add_edge("send_to_api", "send_whatsapp_notification")
    workflow.add_edge("send_whatsapp_notification", END)
    
    # Compile the graph
    return workflow.compile()

# Initialize the graph
graph = create_graph()

# Function to run the agent with user input
def run_agent(user_input: str) -> List[BaseMessage]:
    """Run the CV analysis agent with a user input.
    
    Args:
        user_input: String containing the request with Candidate ID, Job Post ID, and CV path
        
    Returns:
        A list of messages from the conversation, including the final analysis
    """
    # Create initial state
    initial_state = {
        "messages": [
            SystemMessage(content="You are a CV analysis assistant that helps extract and analyze information from CV documents."), 
            HumanMessage(content=user_input)
        ],
        "next": "",
        "context": {}
    }
    
    # Run the graph
    result = graph.invoke(initial_state)
    
    # Return the messages
    return result["messages"]