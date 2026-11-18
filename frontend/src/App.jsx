import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const SAMPLE_PROFILES = [
  {
    label: 'AI & Data Science',
    education: 'B.Tech in Artificial Intelligence & Data Science',
    skills: 'Python, Machine Learning, Scikit-learn, Pandas, TensorFlow',
    interests: 'Predictive modeling, neural networks, computer vision',
    sector: 'Data Science and AI',
    location: 'Bengaluru',
  },
  {
    label: 'Mechanical Diploma',
    education: 'Diploma in Mechanical Engineering',
    skills: 'AutoCAD, SolidWorks, GD&T, CNC Milling, Lean Manufacturing',
    interests: 'CAD modeling, manufacturing processes, quality control',
    sector: 'Manufacturing and Mechanical',
    location: 'Ahmedabad',
  },
  {
    label: 'Commerce & Finance',
    education: 'Bachelor of Commerce (B.Com)',
    skills: 'Tally, GST, TDS, Bookkeeping, Financial Modeling, Advanced Excel',
    interests: 'Corporate taxation, statutory audit, banking operations',
    sector: 'Finance and Banking',
    location: 'Mumbai',
  },
]

function App() {
  const [formData, setFormData] = useState({
    education: '',
    skills: '',
    interests: '',
    sector: '',
    location: '',
    top_n: 5,
  })

  const [sectors, setSectors] = useState([])
  const [sectorsLoading, setSectorsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch sectors from API on mount
  useEffect(() => {
    async function loadSectors() {
      try {
        setSectorsLoading(true)
        const res = await fetch(`${API_BASE}/api/sectors`)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const data = await res.json()
        if (data.sectors && Array.isArray(data.sectors)) {
          setSectors(data.sectors)
        }
      } catch (err) {
        console.warn('Could not load sectors from API, using fallback:', err)
        // Fallback sectors if backend is not yet started
        setSectors([
          'IT',
          'Data Science and AI',
          'Cybersecurity',
          'Manufacturing and Mechanical',
          'Electrical and Electronics',
          'Finance and Banking',
          'Marketing and Media',
          'Healthcare and Life Sciences',
          'Agriculture and Rural Development',
          'Education and Training',
          'Civil and Infrastructure',
          'HR and Administration',
          'Logistics and Supply Chain',
          'Retail and E-Commerce',
        ])
      } finally {
        setSectorsLoading(false)
      }
    }

    loadSectors()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'top_n' ? Number(value) : value,
    }))
  }

  const handleApplySample = (sample) => {
    setFormData((prev) => ({
      ...prev,
      education: sample.education,
      skills: sample.skills,
      interests: sample.interests,
      sector: sample.sector,
      location: sample.location,
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.education.trim()) {
      setError('Education is required.')
      return
    }
    if (!formData.skills.trim()) {
      setError('Skills are required.')
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'Failed to fetch recommendations. Ensure the backend is running.')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    const pct = score * 100
    if (pct >= 50) return '#10b981' // emerald green
    if (pct >= 30) return '#3b82f6' // royal blue
    if (pct >= 15) return '#f59e0b' // amber
    return '#6b7280' // gray
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <span className="brand-badge">PM INTERNSHIP SCHEME</span>
            <h1 className="brand-title">PM Internship Recommender</h1>
            <p className="brand-subtitle">
              AI-driven profile-to-internship matching engine powered by TF-IDF & Cosine Similarity
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="content-grid">
          {/* Left Column: Profile Form */}
          <section className="form-section">
            <div className="card form-card">
              <div className="card-header">
                <h2>Candidate Profile</h2>
                <p>Fill in candidate credentials to discover matching opportunities</p>
              </div>

              {/* Quick sample buttons */}
              <div className="samples-box">
                <span className="samples-label">Quick autofill:</span>
                <div className="samples-buttons">
                  {SAMPLE_PROFILES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      className="sample-pill-btn"
                      onClick={() => handleApplySample(sample)}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="profile-form">
                {/* Education */}
                <div className="form-group">
                  <label htmlFor="education">
                    Education Degree / Qualification <span className="required">*</span>
                  </label>
                  <input
                    id="education"
                    name="education"
                    type="text"
                    required
                    placeholder="e.g. B.Tech in Computer Science, B.Com, Diploma in Mechanical"
                    value={formData.education}
                    onChange={handleChange}
                  />
                </div>

                {/* Skills */}
                <div className="form-group">
                  <label htmlFor="skills">
                    Key Technical & Professional Skills <span className="required">*</span>
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    rows="3"
                    required
                    placeholder="e.g. Python, SQL, React, Machine Learning, AutoCAD, Tally, Verilog"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                  <small className="field-hint">Comma-separated skills work best</small>
                </div>

                {/* Interests */}
                <div className="form-group">
                  <label htmlFor="interests">Career Interests & Domains</label>
                  <input
                    id="interests"
                    name="interests"
                    type="text"
                    placeholder="e.g. Web development, predictive modeling, financial analysis"
                    value={formData.interests}
                    onChange={handleChange}
                  />
                </div>

                {/* Sector Dropdown & Location Row */}
                <div className="form-row">
                  <div className="form-group form-col">
                    <label htmlFor="sector">Preferred Sector</label>
                    <select
                      id="sector"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      disabled={sectorsLoading}
                    >
                      <option value="">All Sectors (Any)</option>
                      {sectors.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-col">
                    <label htmlFor="location">Preferred Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Bengaluru, Mumbai, Pune"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Top N Segmented Control */}
                <div className="form-group">
                  <label>Number of Recommendations</label>
                  <div className="top-n-selector">
                    {[3, 5, 10].map((n) => (
                      <label
                        key={n}
                        className={`top-n-btn ${formData.top_n === n ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="top_n"
                          value={n}
                          checked={formData.top_n === n}
                          onChange={handleChange}
                        />
                        {n} Results
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="alert-error" role="alert">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-content">
                      <span className="spinner" /> Calculating Matches...
                    </span>
                  ) : (
                    <span className="btn-content">
                      Find Recommendations &rarr;
                    </span>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Right Column: Recommendations Results */}
          <section className="results-section">
            <div className="results-header">
              <h2>Ranked Recommendations</h2>
              {hasSearched && (
                <span className="results-count">
                  {recommendations.length} matching internship{recommendations.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="loading-card card">
                <div className="large-spinner" />
                <h3>Generating Recommendations</h3>
                <p>Computing TF-IDF vector distances and cosine similarities...</p>
              </div>
            )}

            {/* Initial empty state */}
            {!loading && !hasSearched && (
              <div className="empty-state card">
                <div className="empty-icon">🎯</div>
                <h3>Ready to Match</h3>
                <p>
                  Enter candidate education, skills, and sector preferences, then click{' '}
                  <strong>Find Recommendations</strong> to evaluate relevant internship opportunities.
                </p>
              </div>
            )}

            {/* No matches state */}
            {!loading && hasSearched && recommendations.length === 0 && !error && (
              <div className="empty-state card">
                <div className="empty-icon">🔍</div>
                <h3>No Matches Found</h3>
                <p>Try broadening your skills or choosing "All Sectors" to see more results.</p>
              </div>
            )}

            {/* Recommendations List */}
            {!loading && recommendations.length > 0 && (
              <div className="cards-list">
                {recommendations.map((item, index) => {
                  const scorePercent = Math.min(100, Math.max(0, item.score * 100))
                  const scoreColor = getScoreColor(item.score)
                  const skillsList = item.skills
                    ? item.skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : []

                  return (
                    <article key={item.id} className="internship-card card">
                      {/* Card Top: Rank & Title */}
                      <div className="card-top">
                        <div className="title-area">
                          <span className="rank-badge">#{index + 1}</span>
                          <div>
                            <h3 className="internship-title">{item.title}</h3>
                            <p className="company-name">{item.company}</p>
                          </div>
                        </div>

                        <div className="score-badge-group">
                          <span
                            className="score-pct-label"
                            style={{ color: scoreColor }}
                          >
                            {(item.score * 100).toFixed(1)}%
                          </span>
                          <span className="score-sub">Match Score</span>
                        </div>
                      </div>

                      {/* Score Percentage Bar */}
                      <div className="progress-track" title={`Match Score: ${(item.score * 100).toFixed(2)}%`}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.max(scorePercent, 5)}%`,
                            backgroundColor: scoreColor,
                          }}
                        />
                      </div>

                      {/* Meta badges: Sector & Location */}
                      <div className="card-meta">
                        <span className="meta-pill sector-pill">
                          🏢 {item.sector}
                        </span>
                        <span className="meta-pill location-pill">
                          📍 {item.location}
                        </span>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="card-description">{item.description}</p>
                      )}

                      {/* Skills Chips */}
                      {skillsList.length > 0 && (
                        <div className="skills-container">
                          <span className="skills-heading">Skills:</span>
                          <div className="skills-chips">
                            {skillsList.map((skill, sIdx) => (
                              <span key={sIdx} className="skill-chip">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>Prototype using synthetic data.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
