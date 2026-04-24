import { useMemo, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Home,
  Lock,
  LogIn,
  Mail,
  Moon,
  Sun,
  User,
  UserPlus,
} from 'lucide-react'

type AuthView = 'login' | 'signup'

type AuthUser = {
  id: number
  email: string
  created_at: string
  is_premium: boolean
  is_admin: boolean
}

export type AuthSuccessPayload = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type AuthPageProps = {
  view: AuthView
  darkMode: boolean
  onToggleTheme: () => void
  onBack: () => void
  onSwitchView: (view: AuthView) => void
  onAuthSuccess: (payload: AuthSuccessPayload) => void
}

type AuthErrors = {
  name?: string
  email?: string
  password?: string
}

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

function PasswordStrengthBar({ password }: { password: string }) {
  const score = getPasswordStrength(password)

  const getBgColor = (index: number) => {
    if (password.length === 0) return 'bg-slate-200 dark:bg-zinc-700'
    if (score <= 1) return index === 0 ? 'bg-red-500' : 'bg-slate-200 dark:bg-zinc-700'
    if (score === 2) return index < 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-zinc-700'
    if (score === 3) return index < 3 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-zinc-700'
    return 'bg-green-500'
  }

  const helperText =
    password.length === 0
      ? 'Minimum 8 characters'
      : score <= 1
        ? 'Weak: add numbers and uppercase letters'
        : score === 2
          ? 'Fair: add a special character'
          : score === 3
            ? 'Good: almost there'
            : 'Strong password'

  return (
    <div className="mt-2 text-left">
      <div className="flex h-1.5 w-full gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`flex-1 rounded-full transition-colors duration-300 ${getBgColor(index)}`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">{helperText}</p>
    </div>
  )
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AuthPage({ view, darkMode, onToggleTheme, onBack, onSwitchView, onAuthSuccess }: AuthPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<AuthErrors>({})
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const endpoint = useMemo(() => {
    return view === 'signup' ? '/auth/register' : '/auth/login'
  }, [view])

  const resetStateForView = (nextView: AuthView) => {
    setName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setErrors({})
    setStatusMessage('')
    onSwitchView(nextView)
  }

  const validateForm = (): boolean => {
    const nextErrors: AuthErrors = {}
    const cleanEmail = email.trim().toLowerCase()

    if (view === 'signup' && !name.trim()) {
      nextErrors.name = 'Full name is required'
    }

    if (!cleanEmail) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(cleanEmail)) {
      nextErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      nextErrors.password = 'Password is required'
    } else if (view === 'signup' && getPasswordStrength(password) < 2) {
      nextErrors.password = 'Please choose a stronger password'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage('')
    if (!validateForm()) return

    setIsLoading(true)
    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

    try {
      const body = {
        email: email.trim().toLowerCase(),
        password,
        ...(view === 'signup' ? { name: name.trim() } : {}),
      }

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => ({} as Record<string, string>))

      if (!response.ok) {
        throw new Error(payload.detail ?? 'Authentication failed. Please try again.')
      }

      const accessToken = payload.access_token
      const refreshToken = payload.refresh_token
      if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        throw new Error('Authentication response is missing required tokens.')
      }

      const meResponse = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const mePayload = await meResponse.json().catch(() => ({} as Record<string, unknown>))
      if (!meResponse.ok) {
        throw new Error('Login succeeded but profile fetch failed. Please try again.')
      }

      onAuthSuccess({
        accessToken,
        refreshToken,
        user: {
          id: Number(mePayload.id),
          email: String(mePayload.email ?? ''),
          created_at: String(mePayload.created_at ?? ''),
          is_premium: Boolean(mePayload.is_premium),
          is_admin: Boolean(mePayload.is_admin),
        },
      })

      setStatusMessage(view === 'login' ? 'Successfully logged in.' : 'Account created successfully.')
      setErrors({})
    } catch (error) {
        if (error instanceof TypeError) {
          setStatusMessage(`Cannot reach backend at ${apiBaseUrl}. Start backend and verify VITE_API_URL.`)
        } else {
          setStatusMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
        }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-between">
        <button
          onClick={onBack}
          className="-ml-2 flex items-center gap-2 rounded-xl p-2 font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5" /> Back
        </button>
        <button onClick={onToggleTheme} className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800">
          {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 mb-6 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Home className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight">{view === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p className="font-medium text-slate-500 dark:text-zinc-400">
            {view === 'login' ? 'Enter your details to sign in.' : 'Start finding your perfect flatmate.'}
          </p>
        </div>

        <div className="relative z-10 mb-6 flex rounded-xl bg-slate-100 p-1.5 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => resetStateForView('login')}
            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${view === 'login' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <LogIn className="h-4 w-4" /> Log In
            </span>
          </button>
          <button
            type="button"
            onClick={() => resetStateForView('signup')}
            className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${view === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" /> Sign Up
            </span>
          </button>
          <div
            className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-lg border border-slate-200/50 bg-white shadow-sm transition-transform duration-300 ease-in-out dark:border-zinc-700/50 dark:bg-zinc-950"
            style={{ transform: view === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
          />
        </div>

        {!!statusMessage && (
          <div className={`relative z-10 mb-6 flex items-start gap-3 rounded-xl border p-4 animate-fade-in ${statusMessage.toLowerCase().includes('success') || statusMessage.toLowerCase().includes('logged') ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300'}`}>
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{statusMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5" noValidate>
          {view === 'signup' && (
            <div className="space-y-1.5 text-left">
              <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 outline-none transition-all dark:bg-zinc-950 ${errors.name ? 'border-red-400 focus:ring-red-300/40 dark:border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800'}`}
                />
              </div>
              {errors.name && <p className="ml-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 outline-none transition-all dark:bg-zinc-950 ${errors.email ? 'border-red-400 focus:ring-red-300/40 dark:border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800'}`}
              />
            </div>
            {errors.email && <p className="ml-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="ml-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-12 outline-none transition-all dark:bg-zinc-950 ${errors.password ? 'border-red-400 focus:ring-red-300/40 dark:border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {view === 'signup' && <PasswordStrengthBar password={password} />}
            {errors.password && <p className="ml-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : view === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
