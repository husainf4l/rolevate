"""
Duplicate Detection Utility for CV Experiences
Uses cosine similarity with sentence-transformers to detect and remove duplicate experiences.
"""

import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

class ExperienceDeduplicator:
    """
    Detects and removes duplicate experiences using semantic similarity.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", similarity_threshold: float = 0.9):
        """
        Initialize the deduplicator.
        
        Args:
            model_name: HuggingFace model for embeddings
            similarity_threshold: Threshold above which experiences are considered duplicates
        """
        self.similarity_threshold = similarity_threshold
        try:
            self.model = SentenceTransformer(model_name)
            logger.info(f"Loaded sentence transformer model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            # Fallback to a simpler approach if model loading fails
            self.model = None
    
    def _extract_text_features(self, experience: Dict[str, Any]) -> str:
        """
        Extract meaningful text from experience entry for comparison.
        
        Args:
            experience: Experience dictionary
            
        Returns:
            Combined text string for embedding
        """
        features = []
        
        # Combine title, company, and description
        if experience.get('title'):
            features.append(experience['title'])
        if experience.get('company'):
            features.append(experience['company'])
        if experience.get('description'):
            features.append(experience['description'])
            
        return " ".join(features).lower().strip()
    
    def _compute_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Compute embeddings for a list of texts.
        
        Args:
            texts: List of text strings
            
        Returns:
            Numpy array of embeddings
        """
        if self.model is None:
            # Simple fallback: use text length and word overlap
            return self._simple_similarity_fallback(texts)
        
        try:
            embeddings = self.model.encode(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error computing embeddings: {e}")
            return self._simple_similarity_fallback(texts)
    
    def _simple_similarity_fallback(self, texts: List[str]) -> np.ndarray:
        """
        Fallback similarity computation when transformer model is unavailable.
        
        Args:
            texts: List of text strings
            
        Returns:
            Mock embeddings array
        """
        logger.warning("Using fallback similarity computation")
        # Create simple features based on text characteristics
        features = []
        for text in texts:
            words = text.split()
            feature_vector = [
                len(text),  # Text length
                len(words),  # Word count
                sum(len(word) for word in words),  # Total character count
                len(set(words))  # Unique words
            ]
            features.append(feature_vector)
        
        return np.array(features)
    
    def find_duplicates(self, experiences: List[Dict[str, Any]]) -> List[int]:
        """
        Find indices of duplicate experiences.
        
        Args:
            experiences: List of experience dictionaries
            
        Returns:
            List of indices to remove (keeps first occurrence)
        """
        if len(experiences) <= 1:
            return []
        
        # Extract text features
        texts = [self._extract_text_features(exp) for exp in experiences]
        
        # Filter out empty texts
        valid_indices = [i for i, text in enumerate(texts) if text.strip()]
        if len(valid_indices) <= 1:
            return []
        
        valid_texts = [texts[i] for i in valid_indices]
        
        # Compute embeddings
        embeddings = self._compute_embeddings(valid_texts)
        
        # Compute similarity matrix
        if embeddings.shape[0] > 1:
            similarity_matrix = cosine_similarity(embeddings)
        else:
            return []
        
        # Find duplicates
        duplicates = set()
        n = len(valid_indices)
        
        for i in range(n):
            for j in range(i + 1, n):
                if similarity_matrix[i][j] > self.similarity_threshold:
                    # Keep the first occurrence, mark the second as duplicate
                    duplicates.add(valid_indices[j])
                    logger.info(
                        f"Found duplicate experience: "
                        f"'{experiences[valid_indices[i]].get('title', 'Unknown')}' "
                        f"(similarity: {similarity_matrix[i][j]:.3f})"
                    )
        
        return list(duplicates)
    
    def merge_similar_experiences(self, experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge similar experiences by combining their descriptions.
        
        Args:
            experiences: List of experience dictionaries
            
        Returns:
            List of deduplicated experiences
        """
        if len(experiences) <= 1:
            return experiences
        
        # Extract text features
        texts = [self._extract_text_features(exp) for exp in experiences]
        valid_indices = [i for i, text in enumerate(texts) if text.strip()]
        
        if len(valid_indices) <= 1:
            return experiences
        
        valid_texts = [texts[i] for i in valid_indices]
        embeddings = self._compute_embeddings(valid_texts)
        
        if embeddings.shape[0] <= 1:
            return experiences
        
        similarity_matrix = cosine_similarity(embeddings)
        
        # Group similar experiences
        processed = set()
        merged_experiences = []
        
        for i in range(len(valid_indices)):
            if i in processed:
                continue
                
            current_idx = valid_indices[i]
            current_exp = experiences[current_idx].copy()
            similar_descriptions = [current_exp.get('description', '')]
            
            # Find similar experiences
            for j in range(i + 1, len(valid_indices)):
                if j in processed:
                    continue
                    
                if similarity_matrix[i][j] > self.similarity_threshold:
                    similar_idx = valid_indices[j]
                    similar_exp = experiences[similar_idx]
                    
                    # Merge descriptions
                    if similar_exp.get('description'):
                        similar_descriptions.append(similar_exp['description'])
                    
                    # Use longer date range if available
                    if similar_exp.get('start_date') and not current_exp.get('start_date'):
                        current_exp['start_date'] = similar_exp['start_date']
                    if similar_exp.get('end_date') and not current_exp.get('end_date'):
                        current_exp['end_date'] = similar_exp['end_date']
                    
                    processed.add(j)
            
            # Combine descriptions
            if len(similar_descriptions) > 1:
                # Remove duplicates and combine
                unique_descriptions = []
                for desc in similar_descriptions:
                    if desc.strip() and desc not in unique_descriptions:
                        unique_descriptions.append(desc.strip())
                
                current_exp['description'] = ". ".join(unique_descriptions)
                logger.info(f"Merged {len(similar_descriptions)} similar experiences")
            
            merged_experiences.append(current_exp)
            processed.add(i)
        
        # Add experiences that weren't in valid_indices
        for i, exp in enumerate(experiences):
            if i not in valid_indices:
                merged_experiences.append(exp)
        
        return merged_experiences
    
    def deduplicate(self, experiences: List[Dict[str, Any]], merge: bool = False) -> List[Dict[str, Any]]:
        """
        Main deduplication method.
        
        Args:
            experiences: List of experience dictionaries
            merge: If True, merge similar experiences; if False, remove duplicates
            
        Returns:
            Deduplicated list of experiences
        """
        if not experiences:
            return experiences
        
        logger.info(f"Deduplicating {len(experiences)} experiences (merge={merge})")
        
        if merge:
            result = self.merge_similar_experiences(experiences)
        else:
            duplicates = self.find_duplicates(experiences)
            result = [exp for i, exp in enumerate(experiences) if i not in duplicates]
        
        logger.info(f"Deduplication complete: {len(experiences)} → {len(result)} experiences")
        return result


def deduplicate_cv_experiences(cv_data: Dict[str, Any], merge: bool = False) -> Dict[str, Any]:
    """
    Convenience function to deduplicate experiences in CV data.
    
    Args:
        cv_data: Complete CV data dictionary
        merge: Whether to merge similar experiences or remove duplicates
        
    Returns:
        CV data with deduplicated experiences
    """
    if not cv_data.get('experience'):
        return cv_data
    
    deduplicator = ExperienceDeduplicator()
    
    # Create a copy to avoid modifying the original
    result = cv_data.copy()
    result['experience'] = deduplicator.deduplicate(cv_data['experience'], merge=merge)
    
    return result