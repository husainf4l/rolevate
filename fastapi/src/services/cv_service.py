from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from src.models import CVAnalysis
from src.agents.cv_analysis_agent import CVAnalysisAgent
from src.agents.whatsapp_agent import WhatsAppAgent
from src.utils.pdf_processor import PDFProcessor
import json
import uuid
import os
from datetime import datetime


class CVAnalysisService:
    """Service for CV analysis operations"""
    
    def __init__(self):
        self.cv_agent = CVAnalysisAgent()
        self.whatsapp_agent = WhatsAppAgent()
        self.pdf_processor = PDFProcessor()
    
    def create_cv_analysis(self, db: Session, cvUrl: str, candidateId: str, applicationId: str, extracted_text: str) -> CVAnalysis:
        """Create a new CV analysis record in the database"""
        try:
            analysis = CVAnalysis(
                id=str(uuid.uuid4()),
                cvUrl=cvUrl,
                candidateId=candidateId,
                applicationId=applicationId,
                extractedText=extracted_text,
                candidatePhone="",  # Will be updated after further processing
                jobId="",  # Will be updated after further processing
                overallScore=0.0,
                skillsScore=0.0,
                experienceScore=0.0,
                educationScore=0.0,
                summary="Pending analysis",
                status="pending",
                analyzedAt=datetime.utcnow()
            )
            
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            return analysis
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to create CV analysis: {e}")
            raise e
    
    async def process_cv_analysis(self, db: Session, analysis_id: str) -> CVAnalysis:
        """Process a CV analysis with the LangGraph CV Analysis Agent"""
        analysis = self.get_analysis(db, analysis_id)
        if not analysis:
            raise ValueError(f"Analysis with ID {analysis_id} not found")
            
        try:
            # Update status to analyzing
            analysis.status = "analyzing"
            db.commit()
            
            # Analyze CV with LLM
            print(f"🤖 Analyzing CV content with LLM...")
            analysis_result = await self.cv_agent.analyze_cv_with_extraction(
                cv_content=analysis.extractedText,
                job_id=analysis.jobId
            )
            print(f"✅ CV analysis completed")
            
            # Update analysis with results
            analysis.candidateName = analysis_result.get("candidate_name")
            analysis.candidateEmail = analysis_result.get("candidate_email")
            analysis.overallScore = analysis_result.get("overall_score", 0)
            analysis.skillsScore = analysis_result.get("skills_score", 0)
            analysis.experienceScore = analysis_result.get("experience_score", 0)
            analysis.educationScore = analysis_result.get("education_score", 0)
            analysis.languageScore = analysis_result.get("language_score")
            analysis.certificationScore = analysis_result.get("certification_score")
            analysis.summary = analysis_result.get("summary", "Analysis completed")
            analysis.strengths = analysis_result.get("strengths", [])
            analysis.weaknesses = analysis_result.get("weaknesses", [])
            analysis.suggestedImprovements = analysis_result.get("suggested_improvements", [])
            analysis.skills = analysis_result.get("skills", [])
            analysis.experience = analysis_result.get("experience", {})
            analysis.education = analysis_result.get("education", {})
            analysis.certifications = analysis_result.get("certifications", [])
            analysis.languages = analysis_result.get("languages", {})
            analysis.aiModel = "gpt-4"
            analysis.processingTime = analysis_result.get("processing_time", 3000)
            analysis.status = "completed"
            analysis.analyzedAt = datetime.utcnow()
            
            db.commit()
            db.refresh(analysis)
            return analysis
            
        except Exception as e:
            analysis.status = "failed"
            db.commit()
            print(f"❌ CV analysis processing failed: {e}")
            raise e
    
    async def send_whatsapp(self, analysis_id: str, phone_number: str, template_name: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """Send a WhatsApp message using the LangGraph WhatsApp Agent"""
        try:
            # Generate WhatsApp link
            whatsapp_link = f"https://rolevate.com/room?phonenumber={phone_number}"
            
            # Send WhatsApp message
            print(f"📱 Sending WhatsApp message to {phone_number}")
            message = f"Hello! Please join your interview room: {whatsapp_link}"
            
            if template_name != "default":
                message = f"Template {template_name}: {message}"
            
            # Apply variables to message if provided
            for key, value in variables.items():
                message = message.replace(f"{{{key}}}", str(value))
                
            whatsapp_result = await self.whatsapp_agent.send_message(
                phone_number=phone_number,
                message=message
            )
            
            return {
                "success": whatsapp_result.get("success", False),
                "message": whatsapp_result.get("message", "Message sent"),
                "whatsapp_link": whatsapp_link
            }
            
        except Exception as e:
            print(f"❌ WhatsApp message sending failed: {e}")
            return {
                "success": False,
                "message": f"Failed to send WhatsApp message: {str(e)}",
                "whatsapp_link": None
            }
    
    async def process_complete_workflow(
        self, 
        db: Session, 
        cv_file_path: str,
        candidate_phone: str,
        job_id: str
    ) -> CVAnalysis:
        """Complete workflow: CV upload -> text extraction -> analysis -> database update -> WhatsApp message"""
        
        try:
            # Step 1: Extract text from CV using PDF processor
            print(f"📄 Extracting text from CV: {cv_file_path}")
            extracted_text = self.pdf_processor.extract_text(cv_file_path)
            print(f"✅ Extracted {len(extracted_text)} characters from CV")
            
            # Step 2: Analyze CV with LLM to extract candidate information
            print(f"🤖 Analyzing CV content with LLM...")
            analysis_result = await self.cv_agent.analyze_cv_with_extraction(
                cv_content=extracted_text,
                job_id=job_id
            )
            print(f"✅ CV analysis completed")
            
            # Step 3: Generate WhatsApp link
            whatsapp_link = f"https://rolevate.com/room?phonenumber={candidate_phone}&jobid={job_id}"
            print(f"🔗 Generated WhatsApp link: {whatsapp_link}")
            
            # Step 4: Get or create candidate and application records
            existing_candidate_id = self.get_or_create_candidate(db, candidate_phone)
            existing_application_id = self.create_application(db, existing_candidate_id, job_id, cv_file_path)
            
            # Step 5: Create CV analysis record with LLM analysis results
            cv_analysis = CVAnalysis(
                id=str(uuid.uuid4()),
                cvUrl=cv_file_path or "",
                extractedText=extracted_text,
                candidateName=analysis_result.get("candidate_name"),
                candidateEmail=analysis_result.get("candidate_email"),
                candidatePhone=candidate_phone,
                jobId=job_id,
                overallScore=analysis_result.get("overall_score", 0),
                skillsScore=analysis_result.get("skills_score", 0),
                experienceScore=analysis_result.get("experience_score", 0),
                educationScore=analysis_result.get("education_score", 0),
                languageScore=analysis_result.get("language_score"),
                certificationScore=analysis_result.get("certification_score"),
                summary=analysis_result.get("summary", "Analysis completed"),
                strengths=analysis_result.get("strengths", []),
                weaknesses=analysis_result.get("weaknesses", []),
                suggestedImprovements=analysis_result.get("suggested_improvements", []),
                skills=analysis_result.get("skills", []),
                experience=analysis_result.get("experience", {}),
                education=analysis_result.get("education", {}),
                certifications=analysis_result.get("certifications", []),
                languages=analysis_result.get("languages", {}),
                aiModel="gpt-4",
                processingTime=analysis_result.get("processing_time", 3000),
                status="completed",
                whatsappLink=whatsapp_link,
                applicationId=existing_application_id,
                candidateId=existing_candidate_id
            )
            
            db.add(cv_analysis)
            db.commit()
            db.refresh(cv_analysis)
            print(f"✅ CV analysis record created with ID: {cv_analysis.id}")
            
            # Step 6: Send WhatsApp message
            print(f"📱 Sending WhatsApp message to {candidate_phone}")
            whatsapp_result = await self.whatsapp_agent.send_message(
                phone_number=candidate_phone,
                message=f"Hello! Please join your interview room: {whatsapp_link}"
            )
            print(f"✅ WhatsApp message sent: {whatsapp_result.get('success', False)}")
            
            return cv_analysis
            
        except Exception as e:
            print(f"❌ Complete workflow failed: {e}")
            raise e
    
    def job_exists(self, db: Session, job_id: str) -> bool:
        """Check if job ID exists in the system"""
        from sqlalchemy import text
        
        with db.connection() as conn:
            result = conn.execute(text('SELECT id FROM job_posts WHERE id = :job_id'), {"job_id": job_id})
            job = result.fetchone()
            return job is not None
    
    def get_or_create_candidate(self, db: Session, candidate_phone: str) -> str:
        """Get existing candidate by phone or create new one"""
        from sqlalchemy import text
        
        # Look for existing candidate by phone number
        with db.connection() as conn:
            result = conn.execute(text('SELECT id FROM candidates WHERE "phoneNumber" = :phone'), {"phone": candidate_phone})
            candidate = result.fetchone()
            
            if candidate:
                print(f"✅ Found existing candidate: {candidate[0]}")
                return candidate[0]
            else:
                # Create new candidate record
                candidate_id = str(uuid.uuid4())
                conn.execute(text('''
                    INSERT INTO candidates (id, name, "phoneNumber", email, "createdAt", "updatedAt", "isActive")
                    VALUES (:id, :name, :phone, :email, :created_at, :updated_at, :is_active)
                '''), {
                    "id": candidate_id,
                    "name": "Candidate",  # Will be updated after CV analysis
                    "phone": candidate_phone,
                    "email": None,  # Will be updated after CV analysis
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "is_active": True
                })
                conn.commit()
                print(f"✅ Created new candidate: {candidate_id}")
                return candidate_id
    
    def create_application(self, db: Session, candidate_id: str, job_id: str, cv_file_path: str) -> str:
        """Create application record linking candidate to job"""
        from sqlalchemy import text
        
        application_id = str(uuid.uuid4())
        
        # Create application record
        with db.connection() as conn:
            conn.execute(text('''
                INSERT INTO applications (
                    id, "candidateId", "jobPostId", "cvUrl", status, "appliedAt", "updatedAt"
                ) VALUES (:id, :candidate_id, :job_id, :cv_url, :status, :applied_at, :updated_at)
            '''), {
                "id": application_id,
                "candidate_id": candidate_id,
                "job_id": job_id,
                "cv_url": cv_file_path or "",
                "status": "pending",
                "applied_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            conn.commit()
            print(f"✅ Created application: {application_id}")
            return application_id
    
    def get_analysis(self, db: Session, analysis_id: str) -> Optional[CVAnalysis]:
        """Get CV analysis by ID"""
        return db.query(CVAnalysis).filter(CVAnalysis.id == analysis_id).first()
    
    def list_analyses(self, db: Session, skip: int = 0, limit: int = 100) -> List[CVAnalysis]:
        """List all CV analyses"""
        return db.query(CVAnalysis).offset(skip).limit(limit).all()
