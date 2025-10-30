import pdfplumber
from docx import Document
from PIL import Image
import pytesseract
from typing import Optional


def extract_text_from_pdf(path: str) -> str:
    text = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text() or "")
    return "\n".join(text)


def extract_text_from_docx(path: str) -> str:
    doc = Document(path)
    parts = [p.text for p in doc.paragraphs]
    return "\n".join(parts)


def extract_text_from_image(path: str) -> str:
    img = Image.open(path)
    text = pytesseract.image_to_string(img)
    return text


def extract_text_auto(path: str, content_type: Optional[str] = None) -> str:
    """Try to infer type from extension if content_type not given"""
    lower = path.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(path)
    if lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_from_docx(path)
    # fallback to image/OCR
    return extract_text_from_image(path)
