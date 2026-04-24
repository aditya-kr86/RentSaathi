import { ArrowRight, CheckCircle2, Clock, Coffee, Heart, MapPin, Sparkles, VolumeX } from 'lucide-react'

type HeroSectionProps = {
  onLogin: () => void
  onSignup: () => void
  isAuthenticated: boolean
  onProfile: () => void
}

export default function HeroSection({ onLogin, onSignup, isAuthenticated, onProfile }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-32 lg:pb-32 lg:pt-48">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-sky-500/15" />

      <div className="container mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-sky-200">
            <Sparkles className="h-4 w-4" />
            <span>The Future of Co-living</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
            Stop Adjusting. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-zinc-100 dark:to-sky-300">
              Start Living.
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-zinc-400 lg:mx-0 lg:text-xl">
            Find flatmates based on vibes, lifestyle, and compatibility, not just random luck. Smart matching for a stress-free home.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            {isAuthenticated ? (
              <button onClick={onProfile} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 sm:w-auto">
                Complete Profile <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button onClick={onSignup} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 sm:w-auto">
                  Get Early Access <ArrowRight className="h-5 w-5" />
                </button>
                <button onClick={onLogin} className="w-full rounded-full border border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto">
                  Log In
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md flex-1">
          <div className="absolute inset-0 scale-105 rotate-3 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 animate-pulse dark:from-sky-600 dark:to-blue-500 dark:opacity-30" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <img src="https://i.pravatar.cc/150?img=47" alt="Profile match" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Priya Sharma</h3>
                <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400">
                  <MapPin className="h-3 w-3" /> Koramangala, BLR
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Heart className="h-4 w-4 fill-current" /> 87% Match
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-indigo-500" /> <span className="font-medium">Sleeps Late</span></div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3"><Coffee className="h-5 w-5 text-amber-500" /> <span className="font-medium">Vegetarian</span></div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3"><VolumeX className="h-5 w-5 text-slate-400" /> <span className="font-medium">Low Noise</span></div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Unlock Contact
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
