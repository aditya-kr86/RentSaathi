const FEATURES = [
  { title: 'Smart Matching', desc: 'Lifestyle, routine, and budget scoring in one profile.', icon: '🧠' },
  { title: 'Verified Profiles', desc: 'Trust-focused onboarding for safer co-living.', icon: '✅' },
  { title: 'Owner/Renter Flows', desc: 'Different journey for people listing and people searching.', icon: '🏠' },
  { title: 'Premium Ready', desc: 'Contact unlock flow already designed for future monetization.', icon: '💎' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-100/80 py-20 dark:bg-zinc-900/60">
      <div className="container mx-auto max-w-6xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold lg:text-5xl">Why RentPartner Works</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-600 dark:text-zinc-400">Built for compatibility-first decisions so you can avoid mismatches before moving in.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-slate-600 dark:text-zinc-400">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
