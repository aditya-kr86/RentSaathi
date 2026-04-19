import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) return savedTheme
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="app" data-theme={theme}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <LandingPage />
    </div>
  )
}

export default App
