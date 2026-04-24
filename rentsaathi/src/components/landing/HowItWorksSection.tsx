import { Heart, Home, Search, ShieldCheck, User } from 'lucide-react'
import type { FlowMode } from './types'

type HowItWorksSectionProps = {
  flow: FlowMode
  onFlowChange: (flow: FlowMode) => void
}

export default function HowItWorksSection({ flow, onFlowChange }: HowItWorksSectionProps) {
  const steps = [
    { icon: <User />, title: 'Create Profile', desc: 'Sign up in 30 seconds. Drop your basic details.' },
    { icon: <ShieldCheck />, title: 'Trust & Safety', desc: 'Quick Aadhaar verification to keep things 100% secure.' },
    flow === 'rental'
      ? { icon: <Search />, title: 'The Vibe Check', desc: '5 quick questions to map out your lifestyle & habits.' }
      : { icon: <Home />, title: 'Showcase Space', desc: 'Upload photos, set the rent, and define the house rules.' },
    { icon: <Heart className="fill-pink-500/20 text-pink-500" />, title: 'Meet Your Match', desc: 'Our algorithm finds your most compatible flatmates instantly.' },
  ]

  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="mb-6 text-3xl font-bold lg:text-5xl">Your Perfect Match in 4 Steps</h2>
        <p className="mb-12 text-lg text-slate-600 dark:text-zinc-400">No endless scrolling, no awkward interviews. Choose your path and let our algorithm do the heavy lifting.</p>

        <div className="relative mb-16 inline-flex rounded-full bg-slate-200 p-1.5 dark:bg-zinc-800">
          <button
            onClick={() => onFlowChange('rental')}
            className={`relative z-10 rounded-full px-8 py-3 text-sm font-bold transition-colors duration-300 ${flow === 'rental' ? 'text-indigo-700 dark:text-sky-300' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
          >
            I Need a Flatmate
          </button>
          <button
            onClick={() => onFlowChange('owner')}
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

          {steps.map((step, index) => (
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
  )
}
