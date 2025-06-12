from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict
import os


class CVAnalysisState(TypedDict):
    """State for CV Analysis Agent"""
    cv_content: str
    position: str
    candidate_info: Dict[str, Any]
    extracted_skills: List[str]
    experience_years: int
    education: List[str]
    previous_roles: List[str]
    score: int
    summary: str
    recommendations: List[str]
    analysis_complete: bool
    error_message: str


class CVAnalysisAgent:
    """LangGraph Agent for CV Analysis"""
    
    def __init__(self):
        self.llm = None  # Will be initialized when API key is available
        self.graph = self._create_graph()
    
    def _initialize_llm(self):
        """Initialize LLM if API key is available"""
        if not self.llm:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here":
                self.llm = ChatOpenAI(model="gpt-4", api_key=api_key)
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(CVAnalysisState)
        
        # Add nodes
        workflow.add_node("extract_basic_info", self._extract_basic_info)
        workflow.add_node("analyze_skills", self._analyze_skills)
        workflow.add_node("evaluate_experience", self._evaluate_experience)
        workflow.add_node("calculate_score", self._calculate_score)
        workflow.add_node("generate_summary", self._generate_summary)
        
        # Define the flow
        workflow.set_entry_point("extract_basic_info")
        workflow.add_edge("extract_basic_info", "analyze_skills")
        workflow.add_edge("analyze_skills", "evaluate_experience")
        workflow.add_edge("evaluate_experience", "calculate_score")
        workflow.add_edge("calculate_score", "generate_summary")
        workflow.add_edge("generate_summary", END)
        
        return workflow.compile()
    
    def _extract_basic_info(self, state: CVAnalysisState) -> CVAnalysisState:
        """Extract basic information from CV"""
        try:
            self._initialize_llm()
            cv_content = state.get("cv_content", "")
            
            if self.llm and cv_content:
                # Use LLM to extract basic information
                prompt = f"""
                Analyze the following CV content and extract basic information.
                
                CV Content:
                {cv_content}
                
                Please extract and return in JSON format:
                - skills: List of technical and soft skills
                - education: List of educational qualifications
                - previous_roles: List of job titles/positions
                
                Return only valid JSON.
                """
                
                response = self.llm.invoke([HumanMessage(content=prompt)])
                
                # Try to parse the response as JSON
                import json
                try:
                    extracted_data = json.loads(response.content)
                    return {
                        **state,
                        "extracted_skills": extracted_data.get("skills", ["Python", "FastAPI", "Machine Learning"]),
                        "education": extracted_data.get("education", ["Bachelor's in Computer Science"]),
                        "previous_roles": extracted_data.get("previous_roles", ["Software Developer", "Data Analyst"])
                    }
                except json.JSONDecodeError:
                    # Fallback to mock data if JSON parsing fails
                    pass
            
            # Fallback to mock data
            return {
                **state,
                "extracted_skills": ["Python", "FastAPI", "Machine Learning"],
                "education": ["Bachelor's in Computer Science"],
                "previous_roles": ["Software Developer", "Data Analyst"]
            }
            
        except Exception as e:
            print(f"Error in _extract_basic_info: {e}")
            # Return mock data on error
            return {
                **state,
                "extracted_skills": ["Python", "FastAPI", "Machine Learning"],
                "education": ["Bachelor's in Computer Science"],
                "previous_roles": ["Software Developer", "Data Analyst"]
            }
    
    def _analyze_skills(self, state: CVAnalysisState) -> CVAnalysisState:
        """Analyze skills from CV"""
        # TODO: Implement skill analysis with LLM
        # For now, use mock analysis
        extracted_skills = state.get("extracted_skills", [])
        if not extracted_skills:
            extracted_skills = ["Programming", "Problem Solving"]
        
        return {
            **state,
            "extracted_skills": extracted_skills
        }
    
    def _evaluate_experience(self, state: CVAnalysisState) -> CVAnalysisState:
        """Evaluate years of experience"""
        # TODO: Implement experience evaluation
        # For now, use mock data
        return {
            **state,
            "experience_years": 3
        }
    
    def _calculate_score(self, state: CVAnalysisState) -> CVAnalysisState:
        """Calculate CV score"""
        # TODO: Implement scoring algorithm
        # For now, use simple scoring
        base_score = 60
        extracted_skills = state.get("extracted_skills", [])
        experience_years = state.get("experience_years", 0)
        skill_bonus = min(len(extracted_skills) * 5, 20)
        experience_bonus = min(experience_years * 5, 20)
        score = base_score + skill_bonus + experience_bonus
        
        return {
            **state,
            "score": score
        }
    
    def _generate_summary(self, state: CVAnalysisState) -> CVAnalysisState:
        """Generate analysis summary and recommendations"""
        try:
            self._initialize_llm()
            
            extracted_skills = state.get("extracted_skills", [])
            experience_years = state.get("experience_years", 0)
            education = state.get("education", [])
            previous_roles = state.get("previous_roles", [])
            score = state.get("score", 0)
            cv_content = state.get("cv_content", "")
            position = state.get("position", "Software Developer")
            
            if self.llm and cv_content:
                # Use LLM to generate comprehensive summary and recommendations
                prompt = f"""
                Based on the CV analysis below, generate a professional summary and recommendations for a candidate applying for a {position} position.
                
                CV Analysis Results:
                - Skills: {', '.join(extracted_skills)}
                - Experience Years: {experience_years}
                - Education: {', '.join(education)}
                - Previous Roles: {', '.join(previous_roles)}
                - Overall Score: {score}/100
                
                Original CV Content:
                {cv_content[:1000]}...
                
                Please provide:
                1. A concise professional summary (2-3 sentences)
                2. Top 3 specific recommendations for improvement
                
                Format your response as JSON:
                {{
                    "summary": "Professional summary here",
                    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
                }}
                """
                
                response = self.llm.invoke([HumanMessage(content=prompt)])
                
                # Try to parse the response as JSON
                import json
                try:
                    llm_data = json.loads(response.content)
                    summary = llm_data.get("summary", f"Candidate has {experience_years} years of experience with skills in {', '.join(extracted_skills[:3])}.")
                    recommendations = llm_data.get("recommendations", [
                        "Consider highlighting specific project achievements",
                        "Add more technical certifications",
                        "Include quantified results from previous roles"
                    ])
                    
                    return {
                        **state,
                        "summary": summary,
                        "recommendations": recommendations,
                        "analysis_complete": True
                    }
                except json.JSONDecodeError:
                    # Fallback if JSON parsing fails
                    pass
            
            # Fallback summary generation
            summary = f"Candidate has {experience_years} years of experience with skills in {', '.join(extracted_skills[:3])}."
            recommendations = [
                "Consider highlighting specific project achievements",
                "Add more technical certifications",
                "Include quantified results from previous roles"
            ]
            
            return {
                **state,
                "summary": summary,
                "recommendations": recommendations,
                "analysis_complete": True
            }
            
        except Exception as e:
            print(f"Error in _generate_summary: {e}")
            # Fallback on error
            summary = f"Analysis completed with score {state.get('score', 0)}/100"
            recommendations = ["Review CV structure", "Add more details", "Highlight achievements"]
            
            return {
                **state,
                "summary": summary,
                "recommendations": recommendations,
                "analysis_complete": True
            }
    
    async def analyze_cv(self, cv_content: str, position: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Main method to analyze CV"""
        try:
            # Initialize state
            initial_state: CVAnalysisState = {
                "cv_content": cv_content,
                "position": position,
                "candidate_info": candidate_info,
                "extracted_skills": [],
                "experience_years": 0,
                "education": [],
                "previous_roles": [],
                "score": 0,
                "summary": "",
                "recommendations": [],
                "analysis_complete": False,
                "error_message": ""
            }
            
            # Run the graph
            result = self.graph.invoke(initial_state)
            
            # Return analysis results
            return {
                "skills": result.get("extracted_skills", []),
                "experience_years": result.get("experience_years", 0),
                "education": result.get("education", []),
                "previous_roles": result.get("previous_roles", []),
                "score": result.get("score", 0),
                "summary": result.get("summary", ""),
                "recommendations": result.get("recommendations", [])
            }
        
        except Exception as e:
            return {
                "error": f"CV analysis failed: {str(e)}",
                "skills": [],
                "experience_years": 0,
                "education": [],
                "previous_roles": [],
                "score": 0,
                "summary": "Analysis failed",
                "recommendations": []
            }
    
    async def analyze_cv_with_extraction(self, cv_content: str, job_id: str) -> Dict[str, Any]:
        """
        Comprehensive CV analysis that extracts candidate information and provides detailed analysis
        """
        self._initialize_llm()
        
        if not self.llm:
            return {
                "error": "OpenAI API key not configured",
                "candidate_name": None,
                "candidate_email": None,
                "overall_score": 0,
                "skills_score": 0,
                "experience_score": 0,
                "education_score": 0,
                "summary": "Analysis failed - API key not configured",
                "skills": [],
                "strengths": [],
                "weaknesses": [],
                "suggested_improvements": [],
                "experience": {},
                "education": {},
                "languages": {}
            }
        
        try:
            # Create comprehensive analysis prompt
            analysis_prompt = f"""
            Analyze the following CV content and extract all relevant information. Provide a comprehensive analysis.

            CV Content:
            {cv_content}

            Job ID: {job_id}

            Please provide a detailed analysis in the following JSON format:
            {{
                "candidate_name": "extracted full name",
                "candidate_email": "extracted email address",
                "candidate_phone": "extracted phone if available",
                "overall_score": 85,
                "skills_score": 90,
                "experience_score": 80,
                "education_score": 85,
                "language_score": 75,
                "certification_score": 70,
                "summary": "Comprehensive summary of the candidate",
                "strengths": ["list", "of", "key", "strengths"],
                "weaknesses": ["areas", "for", "improvement"],
                "suggested_improvements": ["specific", "recommendations"],
                "skills": ["list", "of", "technical", "skills"],
                "certifications": ["list", "of", "certifications"],
                "experience": {{
                    "total_years": 5,
                    "current_role": "current position",
                    "previous_roles": ["list", "of", "previous", "positions"],
                    "companies": ["company1", "company2"],
                    "key_achievements": ["achievement1", "achievement2"]
                }},
                "education": {{
                    "highest_degree": "degree name",
                    "institution": "university name",
                    "graduation_year": 2020,
                    "field_of_study": "field name",
                    "gpa": "if available"
                }},
                "languages": {{
                    "native": ["language1"],
                    "fluent": ["language2"],
                    "intermediate": ["language3"]
                }},
                "processing_time": 3000
            }}

            Ensure all scores are realistic (0-100) and based on the actual CV content.
            Extract candidate name and email accurately from the CV.
            """

            # Get analysis from LLM
            response = await self.llm.ainvoke([HumanMessage(content=analysis_prompt)])
            
            # Parse response
            import json
            try:
                # Clean the response to extract JSON
                response_text = response.content.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                
                analysis_result = json.loads(response_text)
                
                # Validate and ensure all required fields are present
                return {
                    "candidate_name": analysis_result.get("candidate_name"),
                    "candidate_email": analysis_result.get("candidate_email"),
                    "overall_score": min(100, max(0, analysis_result.get("overall_score", 70))),
                    "skills_score": min(100, max(0, analysis_result.get("skills_score", 70))),
                    "experience_score": min(100, max(0, analysis_result.get("experience_score", 70))),
                    "education_score": min(100, max(0, analysis_result.get("education_score", 70))),
                    "language_score": analysis_result.get("language_score"),
                    "certification_score": analysis_result.get("certification_score"),
                    "summary": analysis_result.get("summary", "CV analysis completed"),
                    "strengths": analysis_result.get("strengths", []),
                    "weaknesses": analysis_result.get("weaknesses", []),
                    "suggested_improvements": analysis_result.get("suggested_improvements", []),
                    "skills": analysis_result.get("skills", []),
                    "certifications": analysis_result.get("certifications", []),
                    "experience": analysis_result.get("experience", {}),
                    "education": analysis_result.get("education", {}),
                    "languages": analysis_result.get("languages", {}),
                    "processing_time": analysis_result.get("processing_time", 3000)
                }
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "candidate_name": "Name not extracted",
                    "candidate_email": "Email not found",
                    "overall_score": 70,
                    "skills_score": 70,
                    "experience_score": 70,
                    "education_score": 70,
                    "summary": "CV analyzed but parsing failed. Manual review recommended.",
                    "strengths": ["Technical background"],
                    "weaknesses": ["Information extraction incomplete"],
                    "suggested_improvements": ["Please review CV format"],
                    "skills": ["General technical skills"],
                    "experience": {"total_years": 0},
                    "education": {},
                    "languages": {},
                    "processing_time": 3000
                }
            
        except Exception as e:
            return {
                "error": f"CV analysis failed: {str(e)}",
                "candidate_name": None,
                "candidate_email": None,
                "overall_score": 0,
                "skills_score": 0,
                "experience_score": 0,
                "education_score": 0,
                "summary": f"Analysis failed: {str(e)}",
                "skills": [],
                "strengths": [],
                "weaknesses": [],
                "suggested_improvements": [],
                "experience": {},
                "education": {},
                "languages": {},
                "processing_time": 0
            }
