# PM Internship Recommender

> **Latest Update:** Full-stack recommendation prototype deployed with Flask backend, React + Vite UI, synthetic 70-internship dataset (JSON & Excel), and 100% Precision@5 benchmark verification.

An AI-powered internship recommendation engine built for the **PM Internship Scheme**. The system matches candidate credentials (education, skills, interests, sector preference, and location) against internship opportunities using **TF-IDF Vectorization** (unigram + bigram) and **Cosine Similarity**.

---

## 🏗️ Repository Architecture

This repository is organized as a monorepo containing a Python/Flask API service and a modern React + Vite frontend application.

```text
pm-internship-recommender/
├── backend/
│   ├── app.py                # Flask application & REST API routes (/api/recommend, /api/health, /api/sectors)
│   ├── engine.py             # TF-IDF & Cosine Similarity matching engine
│   ├── evaluate.py           # Precision@5 benchmark across 8 candidate profiles
│   ├── test_engine.py        # Unit test script for recommendation generation
│   ├── requirements.txt      # Python dependencies (flask, flask-cors, scikit-learn, pandas, numpy)
│   ├── data/
│   │   ├── internships.json  # 70 synthetic internships (14 sectors x 5 roles, 16 Indian cities)
│   │   └── internships.xlsx  # Excel workbook with 'All Internships' & 'Sector Summary' sheets
│   └── .gitignore            # Backend gitignore rules
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React UI with candidate form, dynamic sector fetching & ranked cards
│   │   ├── App.css           # Responsive styling, score progress bars, and skill chips
│   │   ├── index.css         # Global stylesheet reset
│   │   └── main.jsx          # Vite React mounting point
│   ├── index.html            # Vite HTML template
│   ├── package.json          # Frontend dependencies & scripts
│   ├── vite.config.js        # Vite config with backend API proxy (/api)
│   ├── .env.example          # Environment variable template
│   └── .gitignore            # Frontend gitignore rules
├── .gitignore                # Monorepo root gitignore rules
└── README.md                 # Complete project documentation & benchmarks
```

---

## 🛠️ Tech Stack

- **Backend:** Python 3.12+, Flask 3.1, Flask-CORS 6.0, scikit-learn 1.9, pandas 3.1, numpy 2.5
- **Frontend:** React 18.3, Vite 5.4, Vanilla CSS3 (responsive grid, progress bars, chips)
- **Algorithm:** Text vectorization with `TfidfVectorizer(stop_words="english", ngram_range=(1, 2))` + `cosine_similarity`

---

## 🚀 Step-by-Step Run Instructions

### 1. Prerequisites

- **Python:** 3.10 or higher
- **Node.js:** v18 or higher (with `npm`)

---

### 2. Backend Setup & Run

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. *(Optional but recommended)* Create and activate a virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask API server:
   ```bash
   python app.py
   ```
   *The backend server will run on `http://127.0.0.1:5000`.*

---

### 3. Frontend Setup & Run

1. Open a separate terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React application will be available at `http://localhost:5173`.*

4. *(Optional)* Build for production:
   ```bash
   npm run build
   ```
   The compiled bundle will be output to `frontend/dist/`.

---

## 📡 Sample API Requests & Responses

### 1. Health Check
```bash
curl -i http://127.0.0.1:5000/api/health
```
```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "service": "PM Internship Recommender API",
  "status": "healthy"
}
```

### 2. Available Sectors
```bash
curl -i http://127.0.0.1:5000/api/sectors
```
```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "count": 14,
  "sectors": [
    "IT",
    "Data Science and AI",
    "Cybersecurity",
    "Manufacturing and Mechanical",
    "Electrical and Electronics",
    "Finance and Banking",
    "Marketing and Media",
    "Healthcare and Life Sciences",
    "Agriculture and Rural Development",
    "Education and Training",
    "Civil and Infrastructure",
    "HR and Administration",
    "Logistics and Supply Chain",
    "Retail and E-Commerce"
  ]
}
```

### 3. Internship Recommendations (`POST /api/recommend`)

#### Request:
```bash
curl -i -X POST http://127.0.0.1:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "education": "B.Tech in Artificial Intelligence & Data Science",
    "skills": "Python, Machine Learning, Scikit-learn, Pandas",
    "interests": "Predictive modeling, neural networks",
    "sector": "Data Science and AI",
    "location": "Bengaluru",
    "top_n": 2
  }'
```

#### Response:
```json
{
  "recommendations": [
    {
      "id": "INT-006",
      "title": "Machine Learning Intern",
      "company": "NeuralEdge Analytics",
      "sector": "Data Science and AI",
      "location": "Chennai",
      "score": 0.6107,
      "skills": "Python, Scikit-learn, TensorFlow, Pandas, Data Preprocessing",
      "description": "Assist in training predictive machine learning models using structured business datasets. Perform exploratory data analysis and feature engineering."
    },
    {
      "id": "INT-007",
      "title": "Data Analyst Intern",
      "company": "InsightIQ Data Works",
      "sector": "Data Science and AI",
      "location": "Kolkata",
      "score": 0.4339,
      "skills": "Python, SQL, Power BI, Advanced Excel, Data Visualization",
      "description": "Extract insights from multi-source operational data and build interactive dashboards. Deliver data summaries to assist decision-making across teams."
    }
  ]
}
```

---

## 📊 Evaluation & Benchmarks

Run the automated evaluation suite to assess ranking precision and response time across 8 test profiles:

```bash
python backend/evaluate.py
```

### Evaluation Output:

```text
=====================================================================================
      PM INTERNSHIP RECOMMENDER - RECOMMENDATION ENGINE EVALUATION
=====================================================================================
Profile                             | P@5    | Top-1 Rel  | Top-1 Score  | Time (ms) 
-------------------------------------------------------------------------------------
Profile A: AI&ML                    | 1.00   | Yes        | 0.6109       | 1.11      
Profile B: CS                       | 1.00   | Yes        | 0.3798       | 1.57      
Profile C: Mechanical diploma       | 1.00   | Yes        | 0.4361       | 1.06      
Profile D: B.Com                    | 1.00   | Yes        | 0.5556       | 1.06      
Profile E: Agriculture              | 1.00   | Yes        | 0.5798       | 1.00      
Profile F: ECE                      | 1.00   | Yes        | 0.4886       | 0.85      
Profile G: Biotech                  | 1.00   | Yes        | 0.4975       | 0.85      
Profile H: cross-domain Data Science + Marketing | 1.00   | Yes        | 0.3766       | 0.88      
-------------------------------------------------------------------------------------
OVERALL AVERAGE                     | 1.00   | 100.0    % | N/A          | 1.05      
=====================================================================================

✅ SUCCESS: All profiles achieved Precision@5 = 1.00!
```

- **Precision@5 (P@5):** 1.00 (100% of top 5 recommendations belong to the expected sector).
- **Top-1 Relevance:** 100% across all evaluated profiles.
- **Average Inference Latency:** ~1.05 ms per request.

---

## 📦 Synthetic Dataset Specifications

The dataset is available in both JSON format ([`backend/data/internships.json`](backend/data/internships.json)) and Excel workbook format ([`backend/data/internships.xlsx`](backend/data/internships.xlsx) and [`internships.xlsx`](internships.xlsx)):
- **14 Sectors:** IT, Data Science and AI, Cybersecurity, Manufacturing and Mechanical, Electrical and Electronics, Finance and Banking, Marketing and Media, Healthcare and Life Sciences, Agriculture and Rural Development, Education and Training, Civil and Infrastructure, HR and Administration, Logistics and Supply Chain, Retail and E-Commerce.
- **16 Indian Cities:** Ahmedabad, Bengaluru, Bhubaneswar, Chandigarh, Chennai, Coimbatore, Delhi NCR, Hyderabad, Indore, Jaipur, Kochi, Kolkata, Lucknow, Mumbai, Nagpur, Pune.
- **Domain-Specific Skills:** Includes industry keywords such as `Verilog`, `PCR`, `Tally`, `GST`, `AutoCAD`, `SEO`, etc.
- **Excel Sheets:**
  - `All Internships`: Complete dataset with ID, Internship Title, Company Name, Sector, Location, Required Skills, and Description.
  - `Sector Summary`: Aggregated counts across all 14 industry sectors (5 roles each = 70 total).
- **Disclaimer:** All company names and internship records are fictitious prototypes.

---

## 📄 License & Attribution

Prototype developed for evaluation and educational demonstration under the PM Internship Scheme.
