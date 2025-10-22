from ..tools.aws_tool import parse_s3_url, download_s3_object
from typing import Dict
import os
import requests
from urllib.parse import urlparse

def download_cv(state: Dict) -> Dict:
    cv_link = state.get("cv_link")
    if not cv_link:
        return state
    
    # Determine if it's an S3 URL or HTTPS URL
    if cv_link.startswith("s3://"):
        # Handle S3 URL
        try:
            bucket, key = parse_s3_url(cv_link)
            local_path = os.path.join("/tmp", os.path.basename(key))
            downloaded = download_s3_object(bucket, key, local_path)
            if downloaded:
                state["local_path"] = downloaded
        except Exception as e:
            print(f"Error downloading from S3: {e}")
            state["local_path"] = None
    elif cv_link.startswith("http://") or cv_link.startswith("https://"):
        # Handle HTTPS URL (e.g., S3 pre-signed URL or public URL)
        try:
            parsed = urlparse(cv_link)
            filename = os.path.basename(parsed.path) or "cv_file.pdf"
            local_path = os.path.join("/tmp", filename)
            
            # Download file
            response = requests.get(cv_link, timeout=30)
            response.raise_for_status()
            
            with open(local_path, "wb") as f:
                f.write(response.content)
            
            state["local_path"] = local_path
            print(f"Downloaded CV from {cv_link} to {local_path}")
        except Exception as e:
            print(f"Error downloading from URL: {e}")
            state["local_path"] = None
    else:
        # Assume it's a local path
        state["local_path"] = cv_link
    
    return state
