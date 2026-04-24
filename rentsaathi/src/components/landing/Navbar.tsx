import { Home, Moon, Sun } from 'lucide-react'

type NavbarProps = {
  scrolled: boolean
  darkMode: boolean
  onToggleTheme: () => void
  onGoToDashboard: () => void
  onLogin: () => void
  onSignup: () => void
  isAuthenticated: boolean
  authenticatedEmail?: string
  onLogout: () => void
  onProfile: () => void
}

export default function Navbar({
  scrolled,
  darkMode,
  onToggleTheme,
  onGoToDashboard,
  onLogin,
  onSignup,
  isAuthenticated,
  authenticatedEmail,
  onLogout,
  onProfile,
}: NavbarProps) {
  return (
    <nav className={`fixed z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 py-3 shadow-sm backdrop-blur-md dark:bg-zinc-950/80' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600 dark:text-sky-300">
          <Home className="h-7 w-7" />
          RentPartner
        </div>

        <div className="hidden items-center gap-8 font-medium text-slate-600 dark:text-zinc-300 md:flex">
          <a href="#problem" className="transition-colors hover:text-indigo-600 dark:hover:text-sky-300">The Problem</a>
          <a href="#how-it-works" className="transition-colors hover:text-indigo-600 dark:hover:text-sky-300">How it Works</a>
          <a href="#features" className="transition-colors hover:text-indigo-600 dark:hover:text-sky-300">Features</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
          <button onClick={onGoToDashboard} className="hidden items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex">
            Dashboard
          </button>
          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:block">
                {authenticatedEmail}
              </span>
              <button onClick={onProfile} className="hidden items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 sm:flex">
                Profile
              </button>
              <button onClick={onLogout} className="hidden items-center gap-2 rounded-full px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="hidden items-center gap-2 rounded-full px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex">
                Login
              </button>
              <button onClick={onSignup} className="hidden items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-md shadow-indigo-600/20 transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95 sm:flex">
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
