const PROBLEM_ITEMS = [
  {
    title: 'The Sink Monster',
    desc: 'Leaves dishes for days. Believes the magical cleaning fairy will eventually arrive.',
    icon: '🗑️',
    color: 'bg-red-50 dark:bg-zinc-800/70',
  },
  {
    title: 'The Midnight DJ',
    desc: 'Takes loud calls at 2 AM. Blasts music while you are prepping for a 9 AM presentation.',
    icon: '📣',
    color: 'bg-orange-50 dark:bg-zinc-800/70',
  },
  {
    title: 'The Vibe Mismatch',
    desc: 'Opposite dietary habits, clashing party cultures, and totally different hygiene standards.',
    icon: '⚡',
    color: 'bg-amber-50 dark:bg-zinc-800/70',
  },
]

export default function ProblemSection() {
  return (
    <section id="problem" className="border-y border-slate-100 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold lg:text-5xl">Tired of the Flatmate Roulette?</h2>
        <p className="mx-auto mb-16 max-w-2xl text-lg text-slate-600 dark:text-zinc-400">
          Finding a flat is hard. Finding a flatmate you actually want to live with is harder. Facebook groups are full of spam, and brokers do not care about your vibe.
        </p>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {PROBLEM_ITEMS.map((item) => (
            <div key={item.title} className={`${item.color} rounded-3xl border border-slate-100 p-8 transition-transform duration-300 hover:-translate-y-2 dark:border-zinc-700`}>
              <div className="mb-4 text-4xl">{item.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p className="text-slate-600 dark:text-zinc-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
