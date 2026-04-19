import { useState } from 'react'
import './LandingPage.css'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage('Please enter your email')
      setStatus('error')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('http://localhost:8000/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('🎉 Thank you! You\'re on the waitlist!')
        setEmail('')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 5000)
      } else {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to join waitlist')
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🚀 Coming Soon</div>
          <h1 className="hero-title">
            Find Your Perfect Flatmate
            <span className="gradient-text"> Match</span>
          </h1>
          <p className="hero-subtitle">
            Stop scrolling through endless profiles. RentSaathi uses intelligent matching to connect you with compatible flatmates in seconds.
          </p>
          <button className="cta-button primary" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>
            Join the Waitlist
          </button>
        </div>
        <div className="hero-illustration">
          <div className="illustration-card card-1">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">Priya</div>
            <div className="profile-match">92% Match</div>
          </div>
          <div className="illustration-card card-2">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">Rahul</div>
            <div className="profile-match">87% Match</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <h2 className="section-title">The Flatmate Search Nightmare</h2>
        <p className="section-subtitle">Finding a compatible roommate shouldn't be this hard</p>

        <div className="problems-grid">
          <div className="problem-card">
            <div className="problem-icon">😤</div>
            <h3>Endless Scrolling</h3>
            <p>Hours spent browsing profiles with no real compatibility insight</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">⚠️</div>
            <h3>Lifestyle Mismatches</h3>
            <p>Silent conflicts over cleanliness, guests, and daily routines</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">💬</div>
            <h3>No Real Screening</h3>
            <p>Can't verify lifestyle preferences before moving in</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">💸</div>
            <h3>Budget Misalignments</h3>
            <p>Getting stuck with flatmates who can't afford their share</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">🚪</div>
            <h3>Toxic Living Situations</h3>
            <p>Conflicts escalate when lifestyles don't align from day one</p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">⏱️</div>
            <h3>Wasted Time & Stress</h3>
            <p>Failed roommate situations lead to costly breakups</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <h2 className="section-title">Meet RentSaathi</h2>
        <p className="section-subtitle">Smart matching. Real compatibility. Happy roommates.</p>

        <div className="solution-container">
          <div className="solution-content">
            <h3>How It Works</h3>
            <div className="solution-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Tell Us About You</h4>
                <p>Quick questionnaire about your lifestyle, schedule, and preferences</p>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <h4>Our Algorithm Learns</h4>
                <p>AI analyzes 20+ compatibility factors beyond just budget</p>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <h4>Get Matched</h4>
                <p>Discover flatmates with 80%+ compatibility scores</p>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <h4>Connect & Move In</h4>
                <p>Chat, verify, and meet your perfect match</p>
              </div>
            </div>
          </div>

          <div className="solution-features">
            <div className="feature-highlight">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Smart Algorithm</h4>
                <p>Matches based on lifestyle, schedule, budget, and personality</p>
              </div>
            </div>

            <div className="feature-highlight">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h4>Verified Profiles</h4>
                <p>Honest answers lead to genuine compatibility matches</p>
              </div>
            </div>

            <div className="feature-highlight">
              <div className="feature-icon">💡</div>
              <div className="feature-text">
                <h4>Better Outcomes</h4>
                <p>85%+ users report finding compatible flatmates in 2 weeks</p>
              </div>
            </div>

            <div className="feature-highlight">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <h4>Safer Connections</h4>
                <p>Screen for lifestyle compatibility before commitment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">What You Get</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">🎓</div>
            <h3>Lifestyle Matching</h3>
            <p>Match on smoking, alcohol, sleep schedule, cleanliness, work style, and more</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">💰</div>
            <h3>Budget Alignment</h3>
            <p>Connect with people in your budget range and work status</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">🏠</div>
            <h3>Smart Listings</h3>
            <p>Browse properties with match scores already calculated</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📊</div>
            <h3>Compatibility Score</h3>
            <p>See your match percentage before even messaging</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">💬</div>
            <h3>Smart Messaging</h3>
            <p>Chat with verified, compatible matches safely</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">⭐</div>
            <h3>Community Trust</h3>
            <p>Real reviews and ratings from the RentSaathi community</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">Why RentSaathi?</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">92%</div>
            <p>Compatibility Match Rate</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">14 Days</div>
            <p>Average Time to Find Match</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">10K+</div>
            <p>Happy Flatmates</p>
          </div>

          <div className="stat-card">
            <div className="stat-number">5 Years</div>
            <p>Average Compatibility</p>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="waitlist-section" id="waitlist">
        <div className="waitlist-container">
          <h2>Be the First to Find Your Match</h2>
          <p>Join our waitlist to get early access when we launch</p>

          <form className="waitlist-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="submit-button"
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>

            {message && (
              <div className={`form-message ${status}`}>
                {message}
              </div>
            )}
          </form>

          <p className="form-note">No spam. Just early access updates.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 RentSaathi. Find Your Perfect Flatmate.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}
