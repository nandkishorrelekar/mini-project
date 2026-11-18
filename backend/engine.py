"""
Recommendation Engine for PM Internship Recommender
TF-IDF + Cosine Similarity matching engine.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple
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


# Skill synonym mapping for canonical normalization
SKILL_SYNONYMS: Dict[str, str] = {
    # AI / Machine Learning / Data Science
    "ml": "machine learning",
    "machine learning": "machine learning",
    "machine-learning": "machine learning",
    "dl": "deep learning",
    "deep learning": "deep learning",
    "deep-learning": "deep learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "artificial-intelligence": "artificial intelligence",
    "nlp": "natural language processing",
    "natural language processing": "natural language processing",
    "cv": "computer vision",
    "computer vision": "computer vision",
    "sklearn": "scikit-learn",
    "scikitlearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "scikit-learn": "scikit-learn",
    "tf": "tensorflow",
    "tensorflow": "tensorflow",
    "torch": "pytorch",
    "pytorch": "pytorch",
    "eda": "data preprocessing",
    "data preprocessing": "data preprocessing",
    "data cleaning": "data preprocessing",
    "exploratory data analysis": "data preprocessing",
    "powerbi": "power bi",
    "power bi": "power bi",
    "power-bi": "power bi",
    "tableau": "tableau",
    "tableau software": "tableau",
    "dataviz": "data visualization",
    "data visualization": "data visualization",
    "data viz": "data visualization",

    # Programming Languages & Frameworks
    "py": "python",
    "python": "python",
    "python3": "python",
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "golang": "go",
    "go": "go",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "psql": "postgresql",
    "postgres sql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "django": "django",
    "flutter": "flutter",
    "dart": "dart",
    "selenium": "selenium",

    # Web & API
    "rest": "rest api",
    "rest api": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "rest apis": "rest api",

    # Cloud, DevOps & Linux
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "docker": "docker",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "ci cd": "ci/cd",
    "linux": "linux",
    "bash": "bash scripting",
    "bash scripting": "bash scripting",
    "shell scripting": "bash scripting",
    "terraform": "terraform",

    # Engineering & Hardware
    "cad": "autocad",
    "autocad": "autocad",
    "solidworks": "solidworks",
    "solid works": "solidworks",
    "gd&t": "gd&t",
    "gd & t": "gd&t",
    "gdt": "gd&t",
    "g-code": "g-code",
    "g code": "g-code",
    "gcode": "g-code",
    "matlab simulink": "matlab simulink",
    "simulink": "matlab simulink",
    "verilog": "verilog",
    "systemverilog": "systemverilog",
    "system verilog": "systemverilog",
    "fpga": "fpga",
    "arm cortex": "arm cortex",
    "arm": "arm cortex",
    "embedded c": "embedded c",
    "pcb": "pcb design",
    "pcb design": "pcb design",
    "altium designer": "altium designer",
    "altium": "altium designer",

    # Finance, Accounting & Tools
    "tally": "tally",
    "tally prime": "tally",
    "tally erp": "tally",
    "gst": "gst",
    "tds": "tds",
    "excel": "excel",
    "ms excel": "excel",
    "microsoft excel": "excel",
    "advanced excel": "advanced excel",
    "excel modeling": "excel modeling",

    # Marketing & Business
    "seo": "seo",
    "search engine optimization": "seo",
    "sem": "sem",
    "search engine marketing": "sem",
    "crm": "crm management",
    "crm management": "crm management",
    "hr": "human resources",
    "human resources": "human resources",
    "pr": "public relations",
    "public relations": "public relations",
    "qa": "quality assurance",
    "quality assurance": "quality assurance",
    "qc": "quality control",
    "quality control": "quality control",
}


def normalize_skill(skill: str) -> str:
    """Normalize skill string: strip and lowercase."""
    if not skill:
        return ""
    return re.sub(r"\s+", " ", str(skill).strip().lower())


def canonicalize_skill(skill: str) -> str:
    """Resolve skill synonym to canonical lowercase form."""
    norm = normalize_skill(skill)
    return SKILL_SYNONYMS.get(norm, norm)


def extract_candidate_skills(profile_skills: Any) -> set:
    """
    Extracts and normalizes skills possessed by candidate,
    including canonical forms and implicit skill coverage.
    """
    if isinstance(profile_skills, list):
        raw_items = profile_skills
    else:
        raw_items = re.split(r"[,;\n]+", str(profile_skills or ""))

    skills_set = set()
    for item in raw_items:
        clean = normalize_skill(item)
        if clean:
            canon = canonicalize_skill(clean)
            skills_set.add(clean)
            skills_set.add(canon)
            # If candidate knows advanced excel, they also possess basic excel
            if "advanced excel" in clean or canon == "advanced excel":
                skills_set.add("excel")
    return skills_set


def compute_skills_gap(
    profile_skills: Any,
    recommendations: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Analyzes skills gap between candidate and top recommendations.

    Returns:
        skills_to_learn: Top 8 missing skills weighted by similarity score,
                         format: [{"skill": "sql", "needed_in": 4, "out_of": 5, "weight": 1.32}]
        almost_ready: Internships with <= 2 missing skills,
                      format: [{"id": item["id"], "title": "...", "missing": ["sql"]}]
    """
    cand_skills = extract_candidate_skills(profile_skills)
    out_of = len(recommendations)

    if out_of == 0:
        return [], []

    skill_stats: Dict[str, Dict[str, Any]] = {}
    almost_ready: List[Dict[str, Any]] = []

    for item in recommendations:
        raw_skills = [
            s.strip()
            for s in str(item.get("skills", "")).split(",")
            if s.strip()
        ]

        missing_for_item: List[str] = []
        seen_in_item = set()

        for s in raw_skills:
            s_norm = normalize_skill(s)
            s_canon = canonicalize_skill(s_norm)

            # Count only skills the candidate does NOT have (after the synonym fix)
            if s_norm not in cand_skills and s_canon not in cand_skills:
                target_skill = s_canon
                if target_skill not in seen_in_item:
                    seen_in_item.add(target_skill)
                    missing_for_item.append(target_skill)

        # Almost ready: internships in top N with 2 or fewer missing skills
        if len(missing_for_item) <= 2:
            almost_ready.append({
                "id": item["id"],
                "title": item["title"],
                "missing": missing_for_item
            })

        # Weight each missing skill by similarity score of internship that needs it
        score = float(item.get("score", 0.0))
        for m_skill in missing_for_item:
            if m_skill not in skill_stats:
                skill_stats[m_skill] = {"needed_in": 0, "weight": 0.0}
            skill_stats[m_skill]["needed_in"] += 1
            skill_stats[m_skill]["weight"] += score

    # Format skills_to_learn and sort by weight descending
    skills_to_learn: List[Dict[str, Any]] = []
    for sk, stats in skill_stats.items():
        skills_to_learn.append({
            "skill": sk,
            "needed_in": stats["needed_in"],
            "out_of": out_of,
            "weight": round(stats["weight"], 2)
        })

    skills_to_learn.sort(
        key=lambda x: (-x["weight"], -x["needed_in"], x["skill"])
    )

    # Return top 8
    skills_to_learn = skills_to_learn[:8]

    return skills_to_learn, almost_ready


compute_skill_gap = compute_skills_gap

