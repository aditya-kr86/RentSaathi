import { useEffect, useState, type FormEvent } from 'react'
import AuthPage from './components/auth/AuthPage'
import type { AuthSuccessPayload } from './components/auth/AuthPage'
import FeaturesSection from './components/landing/FeaturesSection'
import Footer from './components/landing/Footer'
import HeroSection from './components/landing/HeroSection'
import HowItWorksSection from './components/landing/HowItWorksSection'
import Navbar from './components/landing/Navbar'
import ProblemSection from './components/landing/ProblemSection'
import ListFlatPage from './components/dashboard/ListFlatPage'
import MatchesSearchPage from './components/dashboard/MatchesSearchPage'
import MyListingsPage from './components/dashboard/MyListingsPage'
import AdminDashboard from './components/dashboard/AdminDashboard'
import UserDashboard from './components/dashboard/UserDashboard'
import ProfileWizard from './components/profile/ProfileWizard'
import type { FlowMode, FormStatus } from './components/landing/types'
import WaitlistSection from './components/landing/WaitlistSection'

type StoredSession = {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    created_at: string
    is_premium: boolean
    is_admin: boolean
  }
}

const AUTH_SESSION_KEY = 'rentpartner_auth_session'

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'profile' | 'list-flat' | 'matches' | 'my-listings'>('landing')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [scrolled, setScrolled] = useState(false)
  const [flow, setFlow] = useState<FlowMode>('rental')
  const [email, setEmail] = useState('')
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [authSession, setAuthSession] = useState<StoredSession | null>(null)

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const rawSession = localStorage.getItem(AUTH_SESSION_KEY)
      if (!rawSession) return

      try {
        const parsedSession = JSON.parse(rawSession) as StoredSession
        if (!parsedSession?.accessToken || !parsedSession?.refreshToken) {
          localStorage.removeItem(AUTH_SESSION_KEY)
          return
        }

        const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
        const meResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${parsedSession.accessToken}`,
          },
        })

        if (!meResponse.ok) {
          localStorage.removeItem(AUTH_SESSION_KEY)
          if (isMounted) setAuthSession(null)
          return
        }

        const mePayload = await meResponse.json()
        const hydratedSession: StoredSession = {
          accessToken: parsedSession.accessToken,
          refreshToken: parsedSession.refreshToken,
          user: {
            id: Number(mePayload.id),
            email: String(mePayload.email ?? ''),
            created_at: String(mePayload.created_at ?? ''),
            is_premium: Boolean(mePayload.is_premium),
            is_admin: Boolean(mePayload.is_admin),
          },
        }

        if (isMounted) {
          setAuthSession(hydratedSession)
        }
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(hydratedSession))
      } catch {
        localStorage.removeItem(AUTH_SESSION_KEY)
        if (isMounted) setAuthSession(null)
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAuthSuccess = (payload: AuthSuccessPayload) => {
    const session: StoredSession = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    }

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    setAuthSession(session)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_SESSION_KEY)
    setAuthSession(null)
    setView('landing')
  }

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return

    setFormStatus('loading')
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      if (!response.ok) {
        throw new Error('failed')
      }

      setFormStatus('success')
      setEmail('')
    } catch {
      setFormStatus('error')
    }
  }

  if (view === 'login' || view === 'signup') {
    return (
      <AuthPage
        view={view}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => setView('landing')}
        onSwitchView={setView}
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  if (view === 'dashboard') {
    if (!authSession) {
      return (
        <AuthPage
          view="login"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onBack={() => setView('landing')}
          onSwitchView={setView}
          onAuthSuccess={handleAuthSuccess}
        />
      )
    }

    return (
      authSession.user.is_admin ? (
        <AdminDashboard
          accessToken={authSession.accessToken}
          adminUserId={authSession.user.id}
          adminEmail={authSession.user.email}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onLogout={handleLogout}
        />
      ) : (
      <UserDashboard
        userEmail={authSession.user.email}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onCompleteProfile={() => setView('profile')}
        onListFlat={() => setView('list-flat')}
        onViewMyListings={() => setView('my-listings')}
        onExploreMatches={() => setView('matches')}
        onLogout={handleLogout}
      />
      )
    )
  }

  if (view === 'my-listings') {
    if (!authSession) {
      return (
        <AuthPage
          view="login"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onBack={() => setView('landing')}
          onSwitchView={setView}
          onAuthSuccess={handleAuthSuccess}
        />
      )
    }

    return (
      <MyListingsPage
        accessToken={authSession.accessToken}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => setView('dashboard')}
      />
    )
  }

  if (view === 'matches') {
    if (!authSession) {
      return (
        <AuthPage
          view="login"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onBack={() => setView('landing')}
          onSwitchView={setView}
          onAuthSuccess={handleAuthSuccess}
        />
      )
    }

    return (
      <MatchesSearchPage
        accessToken={authSession.accessToken}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => setView('dashboard')}
      />
    )
  }

  if (view === 'list-flat') {
    if (!authSession) {
      return (
        <AuthPage
          view="login"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onBack={() => setView('landing')}
          onSwitchView={setView}
          onAuthSuccess={handleAuthSuccess}
        />
      )
    }

    return (
      <ListFlatPage
        accessToken={authSession.accessToken}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => setView('dashboard')}
        onSaveSuccess={() => setView('my-listings')}
      />
    )
  }

  if (view === 'profile') {
    if (!authSession) {
      return (
        <AuthPage
          view="login"
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onBack={() => setView('landing')}
          onSwitchView={setView}
          onAuthSuccess={handleAuthSuccess}
        />
      )
    }

    return (
      <ProfileWizard
        userId={authSession.user.id}
        userEmail={authSession.user.email}
        accessToken={authSession.accessToken}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => setView('dashboard')}
        onSaveSuccess={() => setView('dashboard')}
      />
    )
  }

  return (
    <div>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <Navbar
          scrolled={scrolled}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onGoToDashboard={() => setView(authSession ? 'dashboard' : 'login')}
          onLogin={() => setView('login')}
          onSignup={() => setView('signup')}
          isAuthenticated={Boolean(authSession)}
          authenticatedEmail={authSession?.user.email}
          onLogout={handleLogout}
          onProfile={() => setView('profile')}
        />

        <HeroSection
          onLogin={() => setView('login')}
          onSignup={() => setView('signup')}
          isAuthenticated={Boolean(authSession)}
          onProfile={() => setView('profile')}
        />
        <ProblemSection />
        <HowItWorksSection flow={flow} onFlowChange={setFlow} />
        <FeaturesSection />
        <WaitlistSection
          email={email}
          formStatus={formStatus}
          onEmailChange={setEmail}
          onSubmit={handleWaitlistSubmit}
        />
        <Footer />
      </div>
    </div>
  )
}
