import os
import io
import time
from typing import Optional
import PyPDF2
import pdfplumber
from fastapi import UploadFile, HTTPException


class PDFProcessor:
    """Utility class for processing PDF files"""
    
    def __init__(self):
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {'.pdf'}
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        # Check file extension
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_ext} not supported. Only PDF files are allowed."
            )
        
        return True
    
    async def extract_text_from_pdf(self, file: UploadFile) -> str:
        """Extract text from PDF file"""
        try:
            # Validate file first
            self.validate_file(file)
            
            # Read file content
            content = await file.read()
            
            # Check file size
            if len(content) > self.max_file_size:
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
            
            # Reset file position for reading
            await file.seek(0)
            
            # Try to extract text using pdfplumber first (better for complex layouts)
            try:
                text = self._extract_with_pdfplumber(content)
                if text.strip():
                    return text
            except Exception as e:
                print(f"pdfplumber extraction failed: {e}")
            
            # Fallback to PyPDF2
            try:
                text = self._extract_with_pypdf2(content)
                if text.strip():
                    return text
            except Exception as e:
                print(f"PyPDF2 extraction failed: {e}")
            
            # If both methods fail
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from PDF. Please ensure the PDF contains readable text."
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    def _extract_with_pdfplumber(self, content: bytes) -> str:
        """Extract text using pdfplumber"""
        text_parts = []
        
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        
        return "\n\n".join(text_parts)
    
    def _extract_with_pypdf2(self, content: bytes) -> str:
        """Extract text using PyPDF2"""
        text_parts = []
        
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        
        return "\n\n".join(text_parts)
    
    def save_uploaded_file(self, file_content: bytes, filename: str, upload_dir: str = "uploads") -> str:
        """Save uploaded file to disk"""
        try:
            # Create upload directory if it doesn't exist
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            base_name = os.path.splitext(filename)[0]
            extension = os.path.splitext(filename)[1]
            timestamp = int(time.time())
            unique_filename = f"{base_name}_{timestamp}{extension}"
            
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            return file_path
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF file path"""
        try:
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
            
            # Check file extension
            file_ext = os.path.splitext(file_path)[1].lower()
            if file_ext not in self.allowed_extensions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type {file_ext} not supported. Only PDF files are allowed."
                )
            
            # Read file content
            with open(file_path, 'rb') as file:
                content = file.read()
            
            # Check file size
            if len(content) > self.max_file_size:
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
            
            # Try to extract text using pdfplumber first (better for complex layouts)
            try:
                text = self._extract_with_pdfplumber(content)
                if text.strip():
                    return text
            except Exception as e:
                print(f"pdfplumber extraction failed: {e}")
            
            # Fallback to PyPDF2
            try:
                text = self._extract_with_pypdf2(content)
                if text.strip():
                    return text
            except Exception as e:
                print(f"PyPDF2 extraction failed: {e}")
            
            # If both methods fail
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from PDF. Please ensure the PDF contains readable text."
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


# Global instance
pdf_processor = PDFProcessor()
