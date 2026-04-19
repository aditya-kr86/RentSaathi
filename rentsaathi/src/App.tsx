import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  Heart,
  Home,
  MapPin,
  Moon,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  VolumeX,
} from 'lucide-react'

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [scrolled, setScrolled] = useState(false)
  const [flow, setFlow] = useState<'rental' | 'owner'>('rental')
  const [email, setEmail] = useState('')
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
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
                onClick={() => setDarkMode((prev) => !prev)}
                className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>
              <button onClick={scrollToWaitlist} className="hidden items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-md shadow-indigo-600/20 transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95 sm:flex">
                Join Waitlist
              </button>
            </div>
          </div>
        </nav>

        <section className="relative overflow-hidden px-6 pb-20 pt-32 lg:pb-32 lg:pt-48">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-sky-500/15" />

          <div className="container mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-sky-200">
                <Sparkles className="h-4 w-4" />
                <span>The Future of Co-living</span>
              </div>
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
                Stop Surviving. <br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-zinc-100 dark:to-sky-300">
                  Start Living.
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-zinc-400 lg:mx-0 lg:text-xl">
                Find flatmates based on vibes, lifestyle, and compatibility, not just random luck. Smart matching for a stress-free home.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <button onClick={scrollToWaitlist} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 sm:w-auto">
                  Get Early Access <ArrowRight className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-slate-500">Join 2,000+ others waiting</span>
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

        <section id="problem" className="border-y border-slate-100 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-5xl">Tired of the Flatmate Roulette?</h2>
            <p className="mx-auto mb-16 max-w-2xl text-lg text-slate-600 dark:text-zinc-400">
              Finding a flat is hard. Finding a flatmate you actually want to live with is harder. Facebook groups are full of spam, and brokers do not care about your vibe.
            </p>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {[
                { title: 'The Sink Monster', desc: 'Leaves dishes for days. Believes the magical cleaning fairy will eventually arrive.', icon: '🗑️', color: 'bg-red-50 dark:bg-zinc-800/70' },
                { title: 'The Midnight DJ', desc: 'Takes loud calls at 2 AM. Blasts music while you are prepping for a 9 AM presentation.', icon: '📣', color: 'bg-orange-50 dark:bg-zinc-800/70' },
                { title: 'The Vibe Mismatch', desc: 'Opposite dietary habits, clashing party cultures, and totally different hygiene standards.', icon: '⚡', color: 'bg-amber-50 dark:bg-zinc-800/70' },
              ].map((item) => (
                <div key={item.title} className={`${item.color} rounded-3xl border border-slate-100 p-8 transition-transform duration-300 hover:-translate-y-2 dark:border-zinc-700`}>
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                  <p className="text-slate-600 dark:text-zinc-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative px-6 py-24">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="mb-6 text-3xl font-bold lg:text-5xl">Your Perfect Match in 4 Steps</h2>
            <p className="mb-12 text-lg text-slate-600 dark:text-zinc-400">No endless scrolling, no awkward interviews. Choose your path and let our algorithm do the heavy lifting.</p>

            <div className="relative mb-16 inline-flex rounded-full bg-slate-200 p-1.5 dark:bg-zinc-800">
              <button
                onClick={() => setFlow('rental')}
                className={`relative z-10 rounded-full px-8 py-3 text-sm font-bold transition-colors duration-300 ${flow === 'rental' ? 'text-indigo-700 dark:text-sky-300' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
              >
                I Need a Flatmate
              </button>
              <button
                onClick={() => setFlow('owner')}
                className={`relative z-10 rounded-full px-8 py-3 text-sm font-bold transition-colors duration-300 ${flow === 'owner' ? 'text-indigo-700 dark:text-sky-300' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
              >
                I Have a Room
              </button>

              <div
                className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-zinc-900"
                style={{ transform: flow === 'rental' ? 'translateX(0)' : 'translateX(100%)' }}
              />
            </div>

            <div className="relative grid gap-6 md:grid-cols-4">
              <div className="absolute left-0 top-1/2 z-0 hidden h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-zinc-800 md:block" />

              {[
                { icon: <User />, title: 'Create Profile', desc: 'Sign up in 30 seconds. Drop your basic details.' },
                { icon: <ShieldCheck />, title: 'Trust & Safety', desc: 'Quick Aadhaar verification to keep things 100% secure.' },
                flow === 'rental'
                  ? { icon: <Search />, title: 'The Vibe Check', desc: '5 quick questions to map out your lifestyle & habits.' }
                  : { icon: <Home />, title: 'Showcase Space', desc: 'Upload photos, set the rent, and define the house rules.' },
                { icon: <Heart className="fill-pink-500/20 text-pink-500" />, title: 'Meet Your Match', desc: 'Our algorithm finds your most compatible flatmates instantly.' },
              ].map((step, index) => (
                <div key={step.title} className="relative z-10 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-slate-50 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-zinc-950">
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Step {index + 1}</h3>
                  <h4 className="mb-2 font-semibold text-slate-800 dark:text-zinc-200">{step.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-100/80 py-20 dark:bg-zinc-900/60">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="mb-4 text-center text-3xl font-bold lg:text-5xl">Why RentPartner Works</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600 dark:text-zinc-400">Built for compatibility-first decisions so you can avoid mismatches before moving in.</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Smart Matching', desc: 'Lifestyle, routine, and budget scoring in one profile.', icon: '🧠' },
                { title: 'Verified Profiles', desc: 'Trust-focused onboarding for safer co-living.', icon: '✅' },
                { title: 'Owner/Renter Flows', desc: 'Different journey for people listing and people searching.', icon: '🏠' },
                { title: 'Premium Ready', desc: 'Contact unlock flow already designed for future monetization.', icon: '💎' },
              ].map((feature) => (
                <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-3 text-3xl">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-zinc-400">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="waitlist" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 origin-bottom-right scale-110 skew-y-3 bg-indigo-100 dark:bg-zinc-900" />

          <div className="container mx-auto px-6 text-center text-slate-900 dark:text-zinc-100">
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-6xl">Stop Compromising.</h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl font-medium text-slate-700 dark:text-zinc-300">
              We are launching very soon. Join the waitlist to get 1 month of <span className="font-bold text-indigo-600 dark:text-sky-300">Premium Matchmaking</span> for free.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="group relative mx-auto max-w-md">
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                  className="w-full rounded-full bg-white py-4 pl-6 pr-32 font-medium text-slate-900 shadow-2xl transition-shadow focus:outline-none focus:ring-4 focus:ring-indigo-300/50 disabled:opacity-70"
                />
                <button
                  type="submit"
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                  className="absolute right-2 flex items-center gap-2 rounded-full bg-indigo-900 px-6 py-2.5 font-bold text-white transition-colors hover:bg-slate-900 disabled:bg-indigo-400"
                >
                  {formStatus === 'loading' ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : formStatus === 'success' ? (
                    <><CheckCircle2 className="h-5 w-5" /> Done</>
                  ) : (
                    <><Send className="h-4 w-4" /> Join</>
                  )}
                </button>
              </div>

              {formStatus === 'success' && (
                <div className="animate-fade-in absolute -bottom-8 left-0 w-full text-center text-sm font-medium text-green-300">
                  You are on the list! Keep an eye on your inbox.
                </div>
              )}
              {formStatus === 'error' && (
                <div className="animate-fade-in absolute -bottom-8 left-0 w-full text-center text-sm font-medium text-red-300">
                  Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>
        </section>

        <footer className="border-t border-slate-800 bg-slate-900 py-12 text-center text-slate-400 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="container mx-auto px-6">
            <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-white">
              <Home className="h-6 w-6" />
              RentPartner
            </div>
            <p className="mx-auto mb-6 max-w-md">Making co-living peaceful, secure, and compatible. Built with care for better living.</p>
            <div className="mb-8 flex justify-center gap-6 text-sm">
              <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-white">Contact</a>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} RentPartner Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
