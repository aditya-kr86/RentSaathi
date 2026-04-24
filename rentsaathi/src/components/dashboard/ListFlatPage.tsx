import { ArrowLeft, Building2, Home, LoaderCircle, Moon, Sun } from 'lucide-react'
import { useState, type FormEvent } from 'react'

type ListFlatPageProps = {
  accessToken: string
  darkMode: boolean
  onToggleTheme: () => void
  onBack: () => void
  onSaveSuccess: () => void
}

type ListingForm = {
  title: string
  location: string
  rent: string
  availability: string
  description: string
}

const EMPTY_FORM: ListingForm = {
  title: '',
  location: '',
  rent: '',
  availability: '',
  description: '',
}

export default function ListFlatPage({ accessToken, darkMode, onToggleTheme, onBack, onSaveSuccess }: ListFlatPageProps) {
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const updateField = <K extends keyof ListingForm>(key: K, value: ListingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage('')

    if (!form.title.trim() || !form.location.trim() || !form.rent.trim()) {
      setStatusMessage('Please fill title, location, and rent before publishing.')
      return
    }

    if (selectedImages.length < 3 || selectedImages.length > 6) {
      setStatusMessage('Please attach minimum 3 and maximum 6 listing images.')
      return
    }

    setIsSubmitting(true)
    try {
      const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')
      const payload = new FormData()
      payload.append('title', form.title.trim())
      payload.append('location', form.location.trim())
      payload.append('rent', String(Number(form.rent)))
      payload.append('availability', form.availability.trim())
      payload.append('description', form.description.trim())
      for (const image of selectedImages) {
        payload.append('images', image)
      }

      const response = await fetch(`${apiBaseUrl}/listings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payload.detail ?? 'Unable to save listing right now.')
      }

      const listingPayload = (await response.json()) as Record<string, unknown>
      if (typeof listingPayload.id !== 'number') {
        throw new Error('Listing response is invalid. Please try again.')
      }

      setStatusMessage('Listing saved successfully. We will use this in feed + matching soon.')
      setForm(EMPTY_FORM)
        setSelectedImages([])
        onSaveSuccess()
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend. Start API server and try again.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to save listing right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <button onClick={onToggleTheme} className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800">
          {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-sky-900/30 dark:text-sky-300">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">List Your Flat</h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Post your flat details and find compatible flatmates faster.</p>
          </div>
        </div>

        {statusMessage && (
          <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${statusMessage.toLowerCase().includes('saved') ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300'}`}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handlePublish} className="grid gap-4">
          <label className="text-left">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Listing Title</span>
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="1 BHK in Koramangala with balcony"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-left">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Location</span>
              <input
                value={form.location}
                onChange={(event) => updateField('location', event.target.value)}
                placeholder="Bangalore"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
              />
            </label>

            <label className="text-left">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Monthly Rent (INR)</span>
              <input
                type="number"
                value={form.rent}
                onChange={(event) => updateField('rent', event.target.value)}
                placeholder="22000"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
              />
            </label>
          </div>

          <label className="text-left">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Available From</span>
            <input
              value={form.availability}
              onChange={(event) => updateField('availability', event.target.value)}
              placeholder="1 May 2026"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            />
          </label>

          <label className="text-left">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Flat Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={5}
              placeholder="Nearby metro, fully furnished, owner prefers tidy and non-smoking flatmates."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            />
          </label>

          <label className="text-left">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Flat Images (3 to 6)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                setSelectedImages(files)
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:file:bg-sky-900/40 dark:file:text-sky-300"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Selected: {selectedImages.length} image(s)</p>
          </label>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {selectedImages.slice(0, 6).map((image, index) => (
                <div key={`${image.name}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <img src={URL.createObjectURL(image)} alt={`Listing preview ${index + 1}`} className="h-20 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Home className="h-4 w-4" />}
            Save Listing
          </button>
        </form>
      </div>
    </div>
  )
}
