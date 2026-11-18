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
  const [skillsToLearn, setSkillsToLearn] = useState([])
  const [almostReady, setAlmostReady] = useState([])
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
      setSkillsToLearn(data.skills_to_learn || [])
      setAlmostReady(data.almost_ready || [])
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'Failed to fetch recommendations. Ensure the backend is running.')
      setRecommendations([])
      setSkillsToLearn([])
      setAlmostReady([])
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

  const formatSkillDisplay = (skill) => {
    if (!skill) return ''
    const upperAcronyms = [
      'sql', 'aws', 'etl', 'gis', 'gst', 'tds', 'pcr', 'cad', 'gcp', 'nlp',
      'cnn', 'api', 'bi', 'crm', 'seo', 'sem', 'hr', 'qa', 'qc', 'ui', 'ux',
      'fpga', 'arm', 'cmm', 'cnc', 'mrp', 'haccp', 'hplc', 'ats', 'siem', 'osint',
      'meddra', 'wms', 'pos', 'dcf'
    ]
    return skill
      .split(' ')
      .map((w) => {
        const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (upperAcronyms.includes(clean)) return w.toUpperCase()
        return w.charAt(0).toUpperCase() + w.slice(1)
      })
      .join(' ')
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
              <>
                {/* Learn These First: Skill Chips with Bars */}
                {skillsToLearn.length > 0 && (
                  <div className="learn-first-section card">
                    <div className="section-title-row">
                      <div>
                        <h3 className="section-title">
                          <span className="section-icon">⚡</span> Learn these first
                        </h3>
                        <p className="section-subtitle">
                          Top missing skills weighted by similarity score across your recommended roles
                        </p>
                      </div>
                      <span className="count-pill">{skillsToLearn.length} Priority Skills</span>
                    </div>

                    <div className="skills-bar-grid">
                      {skillsToLearn.map((item, idx) => {
                        const maxWeight = skillsToLearn[0]?.weight || 1
                        const barPercent = Math.min(100, Math.max(12, Math.round((item.weight / maxWeight) * 100)))

                        return (
                          <div key={item.skill || idx} className="skill-bar-card">
                            <div className="skill-bar-top">
                              <span className="skill-title">{formatSkillDisplay(item.skill)}</span>
                              <span className="skill-weight-badge" title="Cumulative similarity score">
                                weight {item.weight.toFixed(2)}
                              </span>
                            </div>

                            <div
                              className="skill-bar-track"
                              title={`Weight: ${item.weight} | Needed in ${item.needed_in} of ${item.out_of}`}
                            >
                              <div
                                className="skill-bar-fill"
                                style={{ width: `${barPercent}%` }}
                              />
                            </div>

                            <div className="skill-bar-meta">
                              <span>
                                Needed in <strong>{item.needed_in}</strong> of {item.out_of} roles
                              </span>
                              <span>{Math.round((item.needed_in / item.out_of) * 100)}% coverage</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Almost Ready: Cards with Missing Skill Highlighted */}
                {almostReady.length > 0 && (
                  <div className="almost-ready-section card">
                    <div className="section-title-row">
                      <div>
                        <h3 className="section-title">
                          <span className="section-icon">🎯</span> Almost ready
                        </h3>
                        <p className="section-subtitle">
                          Internships in your top matches with 2 or fewer missing skills
                        </p>
                      </div>
                      <span className="count-pill">{almostReady.length} Eligible Roles</span>
                    </div>

                    <div className="almost-ready-grid">
                      {almostReady.map((item) => {
                        const fullRec = recommendations.find((r) => r.id === item.id)
                        const missingCount = item.missing ? item.missing.length : 0

                        return (
                          <div key={item.id} className="almost-ready-card">
                            <div className="almost-ready-header">
                              <div className="almost-ready-title-group">
                                <span className="almost-ready-badge">{item.id}</span>
                                <div>
                                  <h4 className="almost-ready-title">{item.title}</h4>
                                  {fullRec?.company && (
                                    <p className="almost-ready-company">
                                      🏢 {fullRec.company} {fullRec.location ? `• 📍 ${fullRec.location}` : ''}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {fullRec?.score && (
                                <span
                                  className="almost-ready-match-score"
                                  style={{ color: getScoreColor(fullRec.score) }}
                                >
                                  {(fullRec.score * 100).toFixed(1)}% match
                                </span>
                              )}
                            </div>

                            <div className="almost-ready-body">
                              {missingCount > 0 ? (
                                <div className="missing-skills-group">
                                  <span className="missing-skills-label">
                                    Missing skill{missingCount > 1 ? 's' : ''} to qualify:
                                  </span>
                                  <div className="missing-skills-chips">
                                    {item.missing.map((sk) => (
                                      <span key={sk} className="missing-skill-highlight">
                                        <span className="gap-icon">⚠️</span> {formatSkillDisplay(sk)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="ready-match-badge">
                                  <span>✅ Fully Qualified! You possess all required skills.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="results-header list-header">
                  <h2>All Ranked Recommendations</h2>
                  <span className="results-count">
                    Showing top {recommendations.length} matches
                  </span>
                </div>

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
              </>
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
