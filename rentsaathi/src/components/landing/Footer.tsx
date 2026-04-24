import { Home } from 'lucide-react'

export default function Footer() {
  return (
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
        <p className="text-sm">© {new Date().getFullYear()} InnoMantra . All rights reserved.</p>
      </div>
    </footer>
  )
}
