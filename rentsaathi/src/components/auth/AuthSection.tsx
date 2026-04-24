import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, LoaderCircle, LogIn, UserPlus } from 'lucide-react'

type AuthMode = 'signup' | 'login'
type AuthStatus = 'idle' | 'loading' | 'success' | 'error'

type FormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function AuthSection() {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const endpoint = useMemo(() => {
    return mode === 'signup' ? '/auth/register' : '/auth/login'
  }, [mode])

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {}
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address'
    }

    if (!password) {
      nextErrors.password = 'Password is required'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Confirm your password'
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setStatus('idle')
    setStatusMessage('')
    setErrors({})
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return

    setStatus('loading')
    setStatusMessage('')

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const payload = await response.json().catch(() => ({} as Record<string, string>))

      if (!response.ok) {
        throw new Error(payload.detail ?? 'Authentication failed. Please try again.')
      }

      setStatus('success')
      setStatusMessage(
        mode === 'signup'
          ? 'Account created successfully. You can now continue to profile setup.'
          : 'Login successful. Redirect to dashboard can be added in the next step.'
      )
      setPassword('')
      setConfirmPassword('')
      setErrors({})
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <section id="auth" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(14,165,233,0.12),transparent_40%)]" />

      <div className="container mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-sky-300">
            Milestone 2
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Your account, <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-zinc-100 dark:to-sky-300">ready in minutes.</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-zinc-400">
            Create your account or sign in to continue. This flow includes email/password validation, loading states, and clear error feedback.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-zinc-300">
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">Client-side email format validation</li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">Password rule checks and confirm-password match</li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">Submission loading and API error/success feedback</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1.5 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => resetForMode('signup')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-sky-300' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Sign Up
              </span>
            </button>
            <button
              type="button"
              onClick={() => resetForMode('login')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-sky-300' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100'}`}
            >
              <span className="inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Login
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-200" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${errors.email ? 'border-red-400 bg-red-50/40 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/10 dark:focus:ring-red-900/50' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-sky-400 dark:focus:ring-sky-900/40'}`}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={status === 'loading'}
              />
              {errors.email && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-200" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${errors.password ? 'border-red-400 bg-red-50/40 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/10 dark:focus:ring-red-900/50' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-sky-400 dark:focus:ring-sky-900/40'}`}
                placeholder="At least 8 characters"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                disabled={status === 'loading'}
              />
              {errors.password && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-200" htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-4 ${errors.confirmPassword ? 'border-red-400 bg-red-50/40 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/10 dark:focus:ring-red-900/50' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-sky-400 dark:focus:ring-sky-900/40'}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={status === 'loading'}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:text-zinc-950 dark:hover:bg-sky-400"
            >
              {status === 'loading' ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {status === 'success' && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>{statusMessage}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
