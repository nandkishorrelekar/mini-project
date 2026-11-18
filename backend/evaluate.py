"""
Evaluation Script for PM Internship Recommendation Engine.
Tests 8 diverse candidate profiles and evaluates:
- Precision@5
- Top-1 Relevance
- Top-1 Score
- Response Time (ms)
"""

import os
import sys
import time

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(__file__))

from engine import recommend


TEST_PROFILES = [
    {
        "id": "A",
        "name": "AI&ML",
        "profile": {
            "education": "B.Tech in Artificial Intelligence & Data Science",
            "skills": "Python, Machine Learning, Deep Learning, Scikit-learn, TensorFlow, PyTorch, Pandas",
            "interests": "Predictive modeling, neural networks, natural language processing, computer vision",
            "sector": "Data Science and AI",
            "location": "Bengaluru"
        },
        "expected_sectors": ["Data Science and AI"]
    },
    {
        "id": "B",
        "name": "CS",
        "profile": {
            "education": "B.Tech in Computer Science and Engineering",
            "skills": "JavaScript, React, Node.js, Python, Django, PostgreSQL, Docker, AWS, Selenium",
            "interests": "Full stack web development, backend engineering, cloud infrastructure, quality assurance",
            "sector": "IT",
            "location": "Pune"
        },
        "expected_sectors": ["IT"]
    },
    {
        "id": "C",
        "name": "Mechanical diploma",
        "profile": {
            "education": "Diploma in Mechanical Engineering",
            "skills": "AutoCAD, SolidWorks, GD&T, CNC Milling, G-Code, Lean Manufacturing, CMM Inspection",
            "interests": "CAD modeling, manufacturing processes, CNC machining, thermal systems, quality control",
            "sector": "Manufacturing and Mechanical",
            "location": "Ahmedabad"
        },
        "expected_sectors": ["Manufacturing and Mechanical"]
    },
    {
        "id": "D",
        "name": "B.Com",
        "profile": {
            "education": "Bachelor of Commerce (B.Com in Accounting and Finance)",
            "skills": "Tally, GST, TDS, Bookkeeping, Financial Statements, Financial Modeling, Advanced Excel",
            "interests": "Accounting, corporate taxation, statutory auditing, banking operations, investment analysis",
            "sector": "Finance and Banking",
            "location": "Mumbai"
        },
        "expected_sectors": ["Finance and Banking"]
    },
    {
        "id": "E",
        "name": "Agriculture",
        "profile": {
            "education": "B.Sc in Agriculture and Rural Development",
            "skills": "Soil Testing, Crop Health Monitoring, Pest Management, Irrigation Systems, Drone Mapping, GIS",
            "interests": "Agronomy, precision farming, rural microfinance, cold chain storage, FPO management",
            "sector": "Agriculture and Rural Development",
            "location": "Indore"
        },
        "expected_sectors": ["Agriculture and Rural Development"]
    },
    {
        "id": "F",
        "name": "ECE",
        "profile": {
            "education": "B.Tech in Electronics and Communication Engineering (ECE)",
            "skills": "Verilog, SystemVerilog, FPGA, Embedded C, ARM Cortex, Microcontrollers, Altium Designer, PCB Design",
            "interests": "VLSI design, embedded firmware, PCB prototyping, power electronics, IoT hardware",
            "sector": "Electrical and Electronics",
            "location": "Chennai"
        },
        "expected_sectors": ["Electrical and Electronics"]
    },
    {
        "id": "G",
        "name": "Biotech",
        "profile": {
            "education": "B.Tech in Biotechnology and Life Sciences",
            "skills": "PCR, Gel Electrophoresis, DNA Extraction, HPLC, Spectrophotometry, Assay Development, Clinical Trials",
            "interests": "Molecular diagnostics, biochemical analysis, clinical research trials, pharmacovigilance",
            "sector": "Healthcare and Life Sciences",
            "location": "Hyderabad"
        },
        "expected_sectors": ["Healthcare and Life Sciences"]
    },
    {
        "id": "H",
        "name": "cross-domain Data Science + Marketing",
        "profile": {
            "education": "B.Sc in Data Science with Minor in Digital Marketing",
            "skills": "Python, SQL, SEO, Google Analytics, Data Visualization, Social Media Analytics, Meta Ads, Machine Learning",
            "interests": "Marketing analytics, campaign data analysis, consumer insights, digital marketing strategies",
            "sector": "Data Science and AI, Marketing and Media",
            "location": "Delhi NCR"
        },
        "expected_sectors": ["Data Science and AI", "Marketing and Media"]
    }
]


def run_evaluation():
    print("=" * 85)
    print("      PM INTERNSHIP RECOMMENDER - RECOMMENDATION ENGINE EVALUATION")
    print("=" * 85)

    all_p_at_5 = []
    all_top1_match = []
    all_times = []

    header = f"{'Profile':<35} | {'P@5':<6} | {'Top-1 Rel':<10} | {'Top-1 Score':<12} | {'Time (ms)':<10}"
    print(header)
    print("-" * 85)

    for item in TEST_PROFILES:
        prof_label = f"Profile {item['id']}: {item['name']}"
        profile = item["profile"]
        expected_sectors = item["expected_sectors"]

        # Measure response time
        start_time = time.perf_counter()
        recommendations = recommend(profile, top_n=5)
        response_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Calculate metrics
        relevant_recs = [r for r in recommendations if r.get("sector") in expected_sectors]
        p_at_5 = round(len(relevant_recs) / 5.0, 2)

        top1_match = False
        top1_score = 0.0
        if recommendations:
            top1_match = recommendations[0].get("sector") in expected_sectors
            top1_score = recommendations[0].get("score", 0.0)

        all_p_at_5.append(p_at_5)
        all_top1_match.append(top1_match)
        all_times.append(response_time_ms)

        top1_rel_str = "Yes" if top1_match else "No"
        print(f"{prof_label:<35} | {p_at_5:<6.2f} | {top1_rel_str:<10} | {top1_score:<12.4f} | {response_time_ms:<10.2f}")

    print("-" * 85)
    mean_p5 = sum(all_p_at_5) / len(all_p_at_5)
    mean_top1 = sum(1 for m in all_top1_match if m) / len(all_top1_match)
    mean_time = sum(all_times) / len(all_times)

    print(f"{'OVERALL AVERAGE':<35} | {mean_p5:<6.2f} | {mean_top1*100:<9.1f}% | {'N/A':<12} | {mean_time:<10.2f}")
    print("=" * 85)

    if mean_p5 < 1.00:
        print("\n⚠️ WARNING: Overall Precision@5 is below 1.00!")
        for idx, p5 in enumerate(all_p_at_5):
            if p5 < 1.00:
                print(f"  - Profile {TEST_PROFILES[idx]['id']} ({TEST_PROFILES[idx]['name']}) P@5 = {p5:.2f}")
    else:
        print("\n✅ SUCCESS: All profiles achieved Precision@5 = 1.00!")

    return all_p_at_5


if __name__ == "__main__":
    run_evaluation()
