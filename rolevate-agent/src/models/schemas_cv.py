from pydantic import BaseModel
from typing import List, Optional

class Experience(BaseModel):
    title: str
    company: str
    start_date: str
    end_date: str
    description: str

class Education(BaseModel):
    degree: str
    institution: str
    year: str

class Candidate(BaseModel):
    name: str
    title: Optional[str]
    contact: str
    summary: str
    skills: List[str]
    experience: List[Experience]
    education: List[Education]