"""
Semantic Similarity Service using FAISS and sentence-transformers
Provides advanced duplicate detection using vector embeddings
"""
import asyncio
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from loguru import logger
import hashlib
import pickle
from pathlib import Path

from app.config import settings


class SemanticSimilarityService:
    """
    Advanced similarity detection using FAISS vector search and cosine similarity
    Replaces basic string matching for experience deduplication
    """
    
    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"  # Lightweight, fast model
        self.model = None
        self.index = None
        self.texts = []
        self.similarity_threshold = 0.85  # Higher threshold for semantic similarity
        
        # Cache directory for models and indices
        self.cache_dir = Path(settings.base_dir) / "cache" / "similarity"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize model lazily
        self._initialize_model()
    
    def _initialize_model(self) -> None:
        """Initialize sentence transformer model"""
        try:
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.success("✅ Sentence transformer model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load sentence transformer model: {e}")
            raise
    
    def _create_faiss_index(self, dimension: int) -> faiss.Index:
        """Create FAISS index for similarity search"""
        # Using IndexFlatIP for cosine similarity (Inner Product)
        index = faiss.IndexFlatIP(dimension)
        return index
    
    def encode_texts(self, texts: List[str]) -> np.ndarray:
        """
        Encode texts to embeddings using sentence transformer
        
        Args:
            texts: List of text strings to encode
            
        Returns:
            numpy array of embeddings
        """
        if not texts:
            return np.array([])
        
        try:
            # Clean and prepare texts
            cleaned_texts = [self._clean_text(text) for text in texts if text and text.strip()]
            
            if not cleaned_texts:
                return np.array([])
            
            # Generate embeddings
            embeddings = self.model.encode(
                cleaned_texts,
                normalize_embeddings=True,  # Normalize for cosine similarity
                show_progress_bar=False
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to encode texts: {e}")
            return np.array([])
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for better embeddings"""
        if not text:
            return ""
        
        # Basic cleaning
        text = text.strip()
        text = " ".join(text.split())  # Normalize whitespace
        return text.lower()
    
    async def find_similar_experiences(
        self, 
        new_experience: Dict[str, Any], 
        existing_experiences: List[Dict[str, Any]], 
        threshold: float = None
    ) -> Optional[Tuple[int, float]]:
        """
        Find similar experiences using semantic similarity
        
        Args:
            new_experience: New experience dict to check
            existing_experiences: List of existing experience dicts
            threshold: Similarity threshold (default: self.similarity_threshold)
            
        Returns:
            Tuple of (index, similarity_score) if match found, None otherwise
        """
        if not existing_experiences:
            return None
        
        threshold = threshold or self.similarity_threshold
        
        try:
            # Create text representation for new experience
            new_text = self._create_experience_text(new_experience)
            if not new_text:
                return None
            
            # Create text representations for existing experiences
            existing_texts = []
            for exp in existing_experiences:
                text = self._create_experience_text(exp)
                existing_texts.append(text)
            
            if not existing_texts:
                return None
            
            # Encode all texts
            all_texts = existing_texts + [new_text]
            embeddings = self.encode_texts(all_texts)
            
            if len(embeddings) == 0:
                return None
            
            # Split embeddings
            existing_embeddings = embeddings[:-1]
            new_embedding = embeddings[-1:] 
            
            # Create FAISS index
            dimension = existing_embeddings.shape[1]
            index = self._create_faiss_index(dimension)
            
            # Add existing embeddings to index
            index.add(existing_embeddings.astype(np.float32))
            
            # Search for similar embeddings
            scores, indices = index.search(new_embedding.astype(np.float32), k=1)
            
            if len(scores[0]) > 0:
                best_score = float(scores[0][0])
                best_index = int(indices[0][0])
                
                logger.debug(f"Best similarity score: {best_score:.3f} (threshold: {threshold})")
                
                if best_score >= threshold:
                    logger.info(f"Found similar experience with score {best_score:.3f}")
                    return (best_index, best_score)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to find similar experiences: {e}")
            return None
    
    def _create_experience_text(self, experience: Dict[str, Any]) -> str:
        """
        Create a text representation of an experience for similarity comparison
        
        Args:
            experience: Experience dictionary
            
        Returns:
            Combined text representation
        """
        text_parts = []
        
        # Job title (most important)
        if experience.get("job_title"):
            text_parts.append(experience["job_title"])
        
        # Company name
        if experience.get("company"):
            text_parts.append(experience["company"])
        
        # Description (limited to avoid noise)
        if experience.get("description"):
            desc = experience["description"][:200]  # Limit length
            text_parts.append(desc)
        
        # Key responsibilities/achievements
        if experience.get("responsibilities"):
            if isinstance(experience["responsibilities"], list):
                resp_text = " ".join(experience["responsibilities"][:3])  # Top 3 only
                text_parts.append(resp_text)
            else:
                text_parts.append(str(experience["responsibilities"])[:200])
        
        return " ".join(text_parts)
    
    async def find_similar_skills(
        self,
        new_skill: str,
        existing_skills: List[str],
        threshold: float = 0.9  # Higher threshold for skills
    ) -> Optional[Tuple[int, float]]:
        """
        Find similar skills using semantic similarity
        
        Args:
            new_skill: New skill to check
            existing_skills: List of existing skills
            threshold: Similarity threshold for skills
            
        Returns:
            Tuple of (index, similarity_score) if match found, None otherwise
        """
        if not existing_skills or not new_skill:
            return None
        
        try:
            # Encode all skills
            all_skills = existing_skills + [new_skill]
            embeddings = self.encode_texts(all_skills)
            
            if len(embeddings) == 0:
                return None
            
            # Split embeddings
            existing_embeddings = embeddings[:-1]
            new_embedding = embeddings[-1:]
            
            # Create FAISS index
            dimension = existing_embeddings.shape[1]
            index = self._create_faiss_index(dimension)
            
            # Add existing embeddings to index
            index.add(existing_embeddings.astype(np.float32))
            
            # Search for similar embeddings
            scores, indices = index.search(new_embedding.astype(np.float32), k=1)
            
            if len(scores[0]) > 0:
                best_score = float(scores[0][0])
                best_index = int(indices[0][0])
                
                if best_score >= threshold:
                    logger.debug(f"Found similar skill '{existing_skills[best_index]}' for '{new_skill}' with score {best_score:.3f}")
                    return (best_index, best_score)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to find similar skills: {e}")
            return None
    
    def calculate_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Cosine similarity score (0-1)
        """
        try:
            embeddings = self.encode_texts([text1, text2])
            if len(embeddings) != 2:
                return 0.0
            
            # Calculate cosine similarity
            embedding1 = embeddings[0]
            embedding2 = embeddings[1]
            
            # Embeddings are already normalized, so dot product = cosine similarity
            similarity = np.dot(embedding1, embedding2)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Failed to calculate cosine similarity: {e}")
            return 0.0


# Singleton instance for reuse
_similarity_service = None

def get_similarity_service() -> SemanticSimilarityService:
    """Get or create similarity service instance"""
    global _similarity_service
    if _similarity_service is None:
        _similarity_service = SemanticSimilarityService()
    return _similarity_service