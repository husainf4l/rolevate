"""
Simple Duplicate Detection Utility for CV Experiences
Uses basic text similarity without external ML dependencies.
"""

import re
import hashlib
from typing import List, Dict, Any
from difflib import SequenceMatcher
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

class SimpleExperienceDeduplicator:
    """
    Detects and removes duplicate experiences using simple text similarity.
    """
    
    def __init__(self, similarity_threshold: float = 0.8):
        """
        Initialize the deduplicator.
        
        Args:
            similarity_threshold: Threshold above which experiences are considered duplicates
        """
        self.similarity_threshold = similarity_threshold
        self._text_cache = {}  # Cache for normalized text
        self._similarity_cache = {}  # Cache for similarity calculations
        logger.info("Loaded simple text-based deduplicator with caching")
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison with caching"""
        if not text:
            return ""
        
        # Create cache key from text hash
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        # Check cache first
        if text_hash in self._text_cache:
            return self._text_cache[text_hash]
        
        # Convert to lowercase, remove extra spaces and punctuation
        normalized = re.sub(r'[^\w\s]', ' ', text.lower())
        normalized = re.sub(r'\s+', ' ', normalized.strip())
        
        # Cache the result
        self._text_cache[text_hash] = normalized
        return normalized
    
    def _extract_text_features(self, experience: Dict[str, Any]) -> str:
        """
        Extract meaningful text from experience entry for comparison.
        
        Args:
            experience: Experience dictionary
            
        Returns:
            Combined text string for comparison
        """
        features = []
        
        # Combine title, company, and description
        if experience.get('title'):
            features.append(self._normalize_text(experience['title']))
        if experience.get('company'):
            features.append(self._normalize_text(experience['company']))
        if experience.get('description'):
            features.append(self._normalize_text(experience['description']))
        
        return ' '.join(features)
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings with caching"""
        # Create cache key from sorted texts (order independent)
        texts = tuple(sorted([text1, text2]))
        cache_key = hashlib.md5(str(texts).encode()).hexdigest()
        
        # Check cache first
        if cache_key in self._similarity_cache:
            return self._similarity_cache[cache_key]
        
        # Calculate similarity
        similarity = SequenceMatcher(None, text1, text2).ratio()
        
        # Cache the result
        self._similarity_cache[cache_key] = similarity
        return similarity
    
    def deduplicate_experiences(self, experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate experiences from the list.
        
        Args:
            experiences: List of experience dictionaries
            
        Returns:
            List of unique experiences with duplicates removed
        """
        if not experiences:
            return experiences
        
        logger.info(f"Processing {len(experiences)} experiences for deduplication")
        
        unique_experiences = []
        experience_texts = []
        
        for experience in experiences:
            current_text = self._extract_text_features(experience)
            
            # Check against existing experiences
            is_duplicate = False
            for existing_text in experience_texts:
                similarity = self._calculate_similarity(current_text, existing_text)
                if similarity >= self.similarity_threshold:
                    is_duplicate = True
                    logger.debug(f"Found duplicate experience (similarity: {similarity:.3f})")
                    break
            
            if not is_duplicate:
                unique_experiences.append(experience)
                experience_texts.append(current_text)
        
        removed_count = len(experiences) - len(unique_experiences)
        logger.info(f"Removed {removed_count} duplicate experiences, {len(unique_experiences)} unique experiences remain")
        
        # Clean cache if it gets too large (keep last 1000 entries)
        if len(self._text_cache) > 1000:
            # Keep most recent 500 entries
            keys_to_remove = list(self._text_cache.keys())[:-500]
            for key in keys_to_remove:
                del self._text_cache[key]
        
        if len(self._similarity_cache) > 1000:
            # Keep most recent 500 entries  
            keys_to_remove = list(self._similarity_cache.keys())[:-500]
            for key in keys_to_remove:
                del self._similarity_cache[key]
        
        return unique_experiences
    
    def clear_cache(self):
        """Clear all caches"""
        self._text_cache.clear()
        self._similarity_cache.clear()
        logger.info("Cleared deduplication caches")

# For backward compatibility
ExperienceDeduplicator = SimpleExperienceDeduplicator