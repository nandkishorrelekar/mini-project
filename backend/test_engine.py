"""
Quick test script for Recommendation Engine.
"""
import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from engine import recommend, compute_skills_gap, _default_engine
from app import app

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

skills_to_learn, almost_ready = compute_skills_gap(sample_profile["skills"], results)

print("--- Skills To Learn (Top 8 weighted) ---")
for s in skills_to_learn:
    print(f"  Skill: {s['skill']:<20} | Needed: {s['needed_in']}/{s['out_of']} | Weight: {s['weight']}")

print("\n--- Almost Ready Internships (<= 2 missing skills) ---")
for ar in almost_ready:
    print(f"  [{ar['id']}] {ar['title']} | Missing: {ar['missing']}")

# Assertions
assert len(skills_to_learn) <= 8, "Must return at most 8 skills"
assert all("skill" in s and "needed_in" in s and "out_of" in s and "weight" in s for s in skills_to_learn)
assert all("id" in a and "title" in a and "missing" in a for a in almost_ready)
assert all(len(a["missing"]) <= 2 for a in almost_ready), "All almost_ready must have <= 2 missing skills"
# Weights must be sorted descending
weights = [s["weight"] for s in skills_to_learn]
assert weights == sorted(weights, reverse=True), "Skills must be sorted by weight descending"

# Test POST /api/recommend endpoint via Flask test client
client = app.test_client()
res = client.post("/api/recommend", json=sample_profile)
assert res.status_code == 200
data = res.get_json()
assert "recommendations" in data
assert "skills_to_learn" in data
assert "almost_ready" in data
assert len(data["skills_to_learn"]) <= 8
print("\n[SUCCESS] All backend engine & API tests passed successfully!")

