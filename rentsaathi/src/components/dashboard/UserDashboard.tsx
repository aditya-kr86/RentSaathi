import { ArrowRight, Building2, ClipboardCheck, Compass, Crown, Home, LogOut, Moon, Sparkles, Sun, UserCircle2 } from 'lucide-react'

type UserDashboardProps = {
  userEmail: string
  darkMode: boolean
  onToggleTheme: () => void
  onCompleteProfile: () => void
  onListFlat: () => void
  onViewMyListings: () => void
  onExploreMatches: () => void
  onLogout: () => void
}

export default function UserDashboard({
  userEmail,
  darkMode,
  onToggleTheme,
  onCompleteProfile,
  onListFlat,
  onViewMyListings,
  onExploreMatches,
  onLogout,
}: UserDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-sky-900/40 dark:text-sky-300">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-sky-300">Dashboard</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Signed in as {userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Manage your profile, listings, and match preferences from one place.</p>
        </div>

        <div className="grid w-full gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-sky-900/50 dark:bg-sky-900/30 dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" /> Your next move
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight">Complete your profile to unlock better matches</h2>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-zinc-400">
            Your lifestyle preferences directly improve match quality. Finish your profile and start seeing high-compatibility flatmate suggestions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onCompleteProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              <ClipboardCheck className="h-4 w-4" /> Complete Profile
            </button>
            <button
              onClick={onListFlat}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Building2 className="h-4 w-4" /> List Your Flat
            </button>
            <button
              onClick={onExploreMatches}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Explore Matches <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onViewMyListings}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              My Listings
            </button>
          </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                <UserCircle2 className="h-3.5 w-3.5" /> Account
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Profile stage</p>
              <p className="mt-1 text-xl font-bold">Onboarding in progress</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Crown className="h-3.5 w-3.5" /> Plan
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Current plan</p>
              <p className="mt-1 text-xl font-bold">Free</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Compass className="h-3.5 w-3.5" /> Matching
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Suggestions</p>
              <p className="mt-1 text-xl font-bold">Ready after profile completion</p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-slate-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>RentPartner Dashboard</p>
          <p>Built for smarter, safer flatmate matching.</p>
        </div>
      </footer>
    </div>
  )
}
