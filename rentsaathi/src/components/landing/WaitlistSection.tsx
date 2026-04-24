import type { FormEvent } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import type { FormStatus } from './types'

type WaitlistSectionProps = {
  email: string
  formStatus: FormStatus
  onEmailChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function WaitlistSection({ email, formStatus, onEmailChange, onSubmit }: WaitlistSectionProps) {
  return (
    <section id="waitlist" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 origin-bottom-right scale-110 skew-y-3 bg-indigo-100 dark:bg-zinc-900" />

      <div className="container mx-auto px-6 text-center text-slate-900 dark:text-zinc-100">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-6xl">Stop Compromising.</h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl font-medium text-slate-700 dark:text-zinc-300">
          We are launching very soon. Join the waitlist to get 1 month of <span className="font-bold text-indigo-600 dark:text-sky-300">Premium Matchmaking</span> for free.
        </p>

        <form onSubmit={onSubmit} className="group relative mx-auto max-w-md">
          <div className="relative flex items-center">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
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
  )
}
