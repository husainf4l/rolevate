from fastapi import APIRouter, UploadFile, Form
from ..services.cv_filler_agent import CustomCVFillerAgent

router = APIRouter()

@router.post("/fill-cv/")
async def fill_cv(file: UploadFile, template: str = Form("classic_cv.html")):
    # Temporarily disabled due to LangChain version conflicts
    return {"status": "error", "message": "Custom CV Filler temporarily disabled"}