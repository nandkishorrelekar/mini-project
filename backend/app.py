"""
PM Internship Recommender - Backend Application
Flask REST API with CORS and TF-IDF Recommendation Engine.
"""

import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add current directory to path for engine import
sys.path.insert(0, os.path.dirname(__file__))
from engine import recommend, _default_engine

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def index():
    """Root endpoint with service info."""
    return jsonify({
        "service": "PM Internship Recommender API",
        "status": "online",
        "message": "Backend API is running. Access the Web UI at http://localhost:5173",
        "endpoints": {
            "health": "/api/health",
            "sectors": "/api/sectors",
            "recommend": "POST /api/recommend"
        }
    }), 200


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "PM Internship Recommender API"
    }), 200


@app.route("/api/sectors", methods=["GET"])
def sectors():
    """Returns the list of available sectors."""
    unique_sectors = []
    seen = set()
    for item in _default_engine.internships:
        sec = item.get("sector")
        if sec and sec not in seen:
            seen.add(sec)
            unique_sectors.append(sec)

    return jsonify({
        "sectors": unique_sectors,
        "count": len(unique_sectors)
    }), 200


@app.route("/api/recommend", methods=["POST"])
def get_recommendations():
    """
    Recommends internships based on candidate profile.
    Expected JSON:
        education (required): str
        skills (required): str
        interests (optional): str
        sector (optional): str
        location (optional): str
        top_n (optional): int (default 5)
    """
    payload = request.get_json(silent=True) or {}

    education = payload.get("education")
    skills = payload.get("skills")

    # Validation: Return 400 if education or skills is missing
    if not education or not skills or not str(education).strip() or not str(skills).strip():
        return jsonify({
            "error": "Missing required fields: 'education' and 'skills' are required."
        }), 400

    try:
        top_n = int(payload.get("top_n", 5))
    except (ValueError, TypeError):
        top_n = 5

    profile = {
        "education": str(education).strip(),
        "skills": str(skills).strip(),
        "interests": str(payload.get("interests", "")).strip(),
        "sector": str(payload.get("sector", "")).strip(),
        "location": str(payload.get("location", "")).strip()
    }

    results = recommend(profile, top_n=top_n)

    recommendations = [
        {
            "id": item["id"],
            "title": item["title"],
            "company": item["company"],
            "sector": item["sector"],
            "location": item["location"],
            "skills": item["skills"],
            "score": item["score"],
            "description": item.get("description", "")
        }
        for item in results
    ]

    return jsonify({"recommendations": recommendations}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
