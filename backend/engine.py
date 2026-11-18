"""
Recommendation Engine for PM Internship Recommender
TF-IDF + Cosine Similarity matching engine.
"""

import json
import os
from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "internships.json")


def _expand_sector(sector: str) -> str:
    """
    Expands sector names to prevent loss of short acronyms like 'IT'
    which are otherwise dropped by standard English stop-word filters.
    """
    if not sector:
        return ""
    if sector.strip() == "IT":
        return "IT Information Technology Software CS Computer Science"
    return f"{sector} {sector}"


class RecommendationEngine:
    """TF-IDF and Cosine Similarity Recommendation Engine for Internships."""

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or DATA_FILE
        self.internships: List[Dict[str, Any]] = []
        self.documents: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self._initialize()

    def _initialize(self):
        """Loads data, prepares documents, fits TfidfVectorizer, and stores the matrix."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Internship dataset not found at: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.internships = json.load(f)

        # Build one document per internship (skills + sector + location + description)
        self.documents = [
            self._build_document(item) for item in self.internships
        ]

        # Fit TfidfVectorizer(stop_words="english", ngram_range=(1,2)) and store the matrix
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)

    @staticmethod
    def _build_document(item: Dict[str, Any]) -> str:
        skills = item.get("skills", "")
        sector_raw = item.get("sector", "")
        sector = _expand_sector(sector_raw)
        location = item.get("location", "")
        description = item.get("description", "")
        return f"{skills} {sector} {location} {description}".strip()

    @staticmethod
    def _extract_profile_text(profile: Dict[str, Any]) -> str:
        fields = ["skills", "education", "interests", "sector", "location"]
        tokens = []
        for field in fields:
            val = profile.get(field, "")
            if field == "sector" and val:
                val = _expand_sector(str(val))
            if isinstance(val, (list, tuple)):
                tokens.append(" ".join(str(v) for v in val if v))
            elif val:
                tokens.append(str(val))
        return " ".join(tokens).strip()

    def recommend(self, profile: Dict[str, Any], top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Recommends top_n internships for a given candidate profile.

        Args:
            profile: Dict with keys: skills, education, interests, sector, location.
            top_n: Number of top recommendations to return.

        Returns:
            List of internship dicts augmented with 'score' rounded to 4 decimal places.
        """
        if not self.internships or self.vectorizer is None or self.tfidf_matrix is None:
            raise RuntimeError("RecommendationEngine is not initialized.")

        query_text = self._extract_profile_text(profile)
        if not query_text:
            return []

        # Transform query text with the same vectorizer
        query_vector = self.vectorizer.transform([query_text])

        # Compute cosine similarity
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Sort indices in descending order
        top_indices = np.argsort(similarities)[::-1][:top_n]

        results = []
        for idx in top_indices:
            score = round(float(similarities[idx]), 4)
            item = dict(self.internships[idx])
            item["score"] = score
            results.append(item)

        return results


# Module-level instance initialized at startup
_default_engine = RecommendationEngine()


def recommend(profile: Dict[str, Any], top_n: int = 5) -> List[Dict[str, Any]]:
    """Module-level convenience function for recommendations."""
    return _default_engine.recommend(profile=profile, top_n=top_n)
