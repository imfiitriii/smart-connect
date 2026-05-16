import { useState, useRef } from 'react'
import './App.css'

const INDUSTRIES = [
  'Agriculture', 'AI / Machine Learning', 'Biotech & Health',
  'Climate & Sustainability', 'Cybersecurity', 'EdTech', 'E-commerce',
  'FinTech', 'FoodTech', 'GovTech', 'HR & Future of Work',
  'Legal Tech', 'Logistics & Supply Chain', 'Manufacturing',
  'Media & Entertainment', 'PropTech', 'Retail', 'SaaS',
  'Social Impact', 'Travel & Hospitality', 'Other',
]

const initialForm = {
  name: '',
  industry: '',
  pitchDeck: null,
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  /* ── helpers ── */
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleFile = (file) => {
    if (!file) return
    const allowed = [
      'application/pdf',
    ]
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF file.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20 MB.')
      return
    }
    setError(null)
    setForm((f) => ({ ...f, pitchDeck: file }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const removeFile = () => {
    setForm((f) => ({ ...f, pitchDeck: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!form.name.trim() || !form.industry) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      let startupPayload = {
        name: form.name.trim(),
        industry: form.industry,
      }

      if (form.pitchDeck) {
        // 1. Extract text from PDF
        const formData = new FormData()
        formData.append('pdf', form.pitchDeck)
        
        const extractRes = await fetch('http://localhost:3000/extract', {
          method: 'POST',
          body: formData,
        })
        
        if (!extractRes.ok) {
          const err = await extractRes.json()
          throw new Error(err.error || 'Failed to extract text from PDF')
        }
        const { text } = await extractRes.json()

        // 2. Send text to LLM to get structured profile
        const llmRes = await fetch('http://localhost:3000/llmextract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!llmRes.ok) {
          const err = await llmRes.json()
          throw new Error(err.error || 'Failed to analyze pitch deck')
        }
        
        const profile = await llmRes.json()
        
        // Merge extracted profile with user form inputs (user inputs override)
        startupPayload = {
          ...profile,
          ...startupPayload,
        }
      }

      // 3. Submit to /startups for matching
      const res = await fetch('http://localhost:3000/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startupPayload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Server error')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── success screen ── */
  if (result) {
    const score = result.match?.matchscore
    const status = result.relationship?.status
    const scoreColor = score >= 85 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

    return (
      <div className="page-wrapper">
        <div className="success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="success-title">You're on the map!</h1>
          <p className="success-sub">Your startup profile has been submitted successfully.</p>

          <div className="result-grid">
            <div className="result-card">
              <span className="result-label">Match Score</span>
              <span className="result-score" style={{ color: scoreColor }}>
                {score}<span className="score-unit">/100</span>
              </span>
            </div>
            <div className="result-card">
              <span className="result-label">Status</span>
              <span className={`status-badge status-${status}`}>{status}</span>
            </div>
          </div>

          {result.match?.ai_reasoning && (
            <div className="reasoning-box">
              <p className="reasoning-label">AI Reasoning</p>
              <p className="reasoning-text">{result.match.ai_reasoning}</p>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => { setResult(null); setForm(initialForm) }}
          >
            Submit another startup
          </button>
        </div>
      </div>
    )
  }

  /* ── form ── */
  return (
    <div className="page-wrapper">
      <div className="form-container">

        {/* Header */}
        <header className="form-header">
          <div className="logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="form-title">Register Your Startup</h1>
          <p className="form-subtitle">
            Tell us about your startup and we'll match you with the perfect mentor using AI.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Fields ── */}
          <section className="form-section">

            <div className="field">
              <label htmlFor="startup-name">
                Startup Name <span className="required">*</span>
              </label>
              <input
                id="startup-name"
                type="text"
                placeholder="e.g. AgriVision AI"
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="startup-industry">
                Industry <span className="required">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="startup-industry"
                  value={form.industry}
                  onChange={set('industry')}
                  required
                >
                  <option value="">Select an industry…</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* ── Pitch Deck ── */}
            <div className="field">
              <label>Pitch Deck</label>
              {form.pitchDeck ? (
                <div className="file-preview">
                  <div className="file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                    </svg>
                  </div>
                  <div className="file-info">
                    <p className="file-name">{form.pitchDeck.name}</p>
                    <p className="file-size">{(form.pitchDeck.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" className="file-remove" onClick={removeFile} aria-label="Remove file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload pitch deck"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  <div className="drop-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <polyline points="16,16 12,12 8,16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                    </svg>
                  </div>
                  <p className="drop-primary">Drop your pitch deck here</p>
                  <p className="drop-secondary">or <span className="drop-link">browse files</span> — PDF only, max 20 MB</p>
                </div>
              )}
            </div>

          </section>

          {/* ── Error ── */}
          {error && (
            <div className="error-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            id="submit-btn"
            type="submit"
            className={`btn-primary btn-submit ${submitting ? 'loading' : ''}`}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Finding your mentor…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit &amp; Match Me
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
