from livekit.agents.llm import function_tool


def create_application_info_tool(application_data):
    """Tool to retrieve application, job, and company information"""
    job_data = application_data.get("job", {})
    company_info = job_data.get("company", {})
    
    @function_tool
    async def get_application_info():
        """Get comprehensive information about the job position and hiring company. Use this when the candidate asks about salary, company details, job description, or any job-related information."""
        return {
            "job": {
                "title": job_data.get("title", "N/A"),
                "description": job_data.get("description", "N/A"),
                "salary": job_data.get("salary", "N/A")
            },
            "company": {
                "name": company_info.get("name", "N/A"),
                "description": company_info.get("description", "N/A"),
                "phone": company_info.get("phone", "N/A"),
                "email": company_info.get("email", "N/A")
            }
        }
    
    return get_application_info
