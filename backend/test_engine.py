"""
Quick test script for Recommendation Engine.
"""
import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from engine import recommend, _default_engine

sample_profile = {
    "skills": "Python, Machine Learning, Scikit-learn, Pandas",
    "education": "B.Tech in Artificial Intelligence & Data Science",
    "interests": "Predictive modeling, neural networks, exploratory data analysis",
    "sector": "Data Science and AI",
    "location": "Bengaluru"
}

print(f"Total internships indexed: {len(_default_engine.documents)}")
print(f"TF-IDF matrix shape: {_default_engine.tfidf_matrix.shape}")
print(f"Vocabulary feature count: {len(_default_engine.vectorizer.vocabulary_)}")

print("\n--- Candidate Test Profile ---")
for k, v in sample_profile.items():
    print(f"  {k}: {v}")

results = recommend(sample_profile, top_n=5)

print(f"\nTop {len(results)} Recommended Internships:")
for i, item in enumerate(results, 1):
    print(f"{i}. [{item['id']}] {item['title']} at {item['company']}")
    print(f"   Sector: {item['sector']} | Location: {item['location']} | Similarity Score: {item['score']}")
    print(f"   Skills: {item['skills']}")
    print(f"   Description: {item['description']}\n")
