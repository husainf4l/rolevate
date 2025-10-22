from typing import TypedDict, Optional, List, Dict

class CVState(TypedDict, total=False):
    cv_link: str
    jobid: str
    application_id: str
    candidateid: str
    system_api_key: Optional[str]
    callback_url: Optional[str]
    local_path: str
    raw_text: str
    extracted: Dict[str, str]
    job_info: Dict[str, object]
    application_info: Dict[str, object]
    analysis: Dict[str, object]
    additional: Dict[str, object]
