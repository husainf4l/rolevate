import json
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class MetadataExtractor:
    """Utility class for extracting and validating room metadata."""

    @staticmethod
    def extract_from_room(room_metadata: Optional[str]) -> Dict[str, str]:
        """
        Extract metadata from room object.

        Args:
            room_metadata: JSON string containing room metadata

        Returns:
            Dictionary with extracted metadata or defaults
        """
        defaults = {
            "candidateName": "the candidate",
            "jobName": "this position",
            "companyName": "our company",
            "interviewPrompt": "",
            "cv_summary": "",
        }

        if not room_metadata:
            logger.warning("No room metadata found, using defaults")
            return defaults

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
            }

            logger.info(
                f"Successfully extracted metadata: {extracted['candidateName']} - {extracted['jobName']} at {extracted['companyName']}"
            )
            return extracted

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse room metadata: {e}")
            return defaults
