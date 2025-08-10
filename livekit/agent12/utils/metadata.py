import json
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class MetadataExtractor:
    """Utility class for extracting and validating room metadata."""

    @staticmethod
    def extract_from_room(
        room_metadata: Optional[str], room_name: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Extract metadata from room object.

        Args:
            room_metadata: JSON string containing room metadata
            room_name: Room name which may contain IDs

        Returns:
            Dictionary with extracted metadata or defaults
        """
        defaults = {
            "candidateName": "the candidate",
            "jobName": "this position",
            "companyName": "our company",
            "interviewPrompt": "",
            "cv_summary": "",
            "cv_analysis": {},  # Default to empty dict
            "jobId": "",
            "candidateId": "",
            "companyId": "",
            "interviewLanguage": "english",  # Default to English
        }

        if not room_metadata:
            logger.warning("No room metadata found, using defaults")
            extracted = defaults.copy()
            extracted["cv_analysis"] = {}
        else:
            try:
                metadata = json.loads(room_metadata)

                cv_analysis = metadata.get("cvAnalysis", {})
                cv_summary = cv_analysis.get("summary", defaults["cv_summary"])

                # Extract and validate metadata
                extracted = {
                    "candidateName": metadata.get(
                        "candidateName", defaults["candidateName"]
                    ),
                    "jobName": metadata.get("jobName", defaults["jobName"]),
                    "companyName": metadata.get("companyName", defaults["companyName"]),
                    "interviewPrompt": metadata.get(
                        "interviewPrompt", defaults["interviewPrompt"]
                    ),
                    "cv_summary": cv_summary,
                    "cv_analysis": cv_analysis,
                    "jobId": metadata.get("jobId", defaults["jobId"]),
                    "candidateId": metadata.get("candidateId", defaults["candidateId"]),
                    "companyId": metadata.get("companyId", defaults["companyId"]),
                    "interviewLanguage": metadata.get(
                        "interviewLanguage", defaults["interviewLanguage"]
                    ).lower(),
                }

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse room metadata: {e}")
                extracted = defaults.copy()

        # Try to extract IDs from room name if not in metadata
        if room_name and not extracted["candidateId"]:
            try:
                parts = room_name.split("_")
                if len(parts) >= 3 and parts[0] == "interview":
                    extracted["candidateId"] = parts[1]
                    logger.info(
                        f"Extracted candidateId from room name: {extracted['candidateId']}"
                    )
            except Exception as e:
                logger.warning(
                    f"Could not extract candidateId from room name '{room_name}': {e}"
                )

        logger.info(
            f"Successfully extracted metadata: {extracted['candidateName']} - {extracted['jobName']} at {extracted['companyName']}"
        )
        return extracted
