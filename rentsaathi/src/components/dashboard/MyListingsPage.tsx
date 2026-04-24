import { ArrowLeft, LoaderCircle, MapPin, Moon, Sun, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type MyListingsPageProps = {
  accessToken: string
  darkMode: boolean
  onToggleTheme: () => void
  onBack: () => void
}

type ListingCard = {
  id: number
  title: string
  location: string
  rent: number
  availability: string | null
  description: string | null
  images: Array<{ id: number; image_url: string }>
  image_urls: string[]
}

export default function MyListingsPage({ accessToken, darkMode, onToggleTheme, onBack }: MyListingsPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingImages, setIsUpdatingImages] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [listings, setListings] = useState<ListingCard[]>([])
  const [selectedListing, setSelectedListing] = useState<ListingCard | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    rent: '',
    availability: '',
    description: '',
  })

  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, ''), [])

  const setEditFromListing = (listing: ListingCard) => {
    setSelectedListing(listing)
    setEditForm({
      title: listing.title,
      location: listing.location,
      rent: String(listing.rent),
      availability: listing.availability ?? '',
      description: listing.description ?? '',
    })
  }

  const refreshListings = async () => {
    const response = await fetch(`${apiBaseUrl}/listings/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const payload = (await response.json().catch(() => [])) as ListingCard[] | { detail?: string }

    if (!response.ok) {
      const detail = typeof payload === 'object' && payload && 'detail' in payload ? payload.detail : undefined
      throw new Error(detail ?? 'Unable to load your listings right now.')
    }

    const records = Array.isArray(payload) ? payload : []
    setListings(records)
    if (records.length === 0) {
      setStatusMessage('No listings posted yet. Create your first listing from dashboard.')
      setSelectedListing(null)
      return
    }

    if (selectedListing) {
      const latestSelected = records.find((item) => item.id === selectedListing.id)
      if (latestSelected) {
        setEditFromListing(latestSelected)
      } else {
        setSelectedListing(null)
      }
    }
  }

  useEffect(() => {
    const fetchMyListings = async () => {
      setStatusMessage('')
      setIsLoading(true)
      try {
        await refreshListings()
      } catch (error) {
        if (error instanceof TypeError) {
          setStatusMessage('Cannot reach backend right now. Start API server and retry.')
        } else {
          setStatusMessage(error instanceof Error ? error.message : 'Unable to load your listings right now.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyListings()
  }, [accessToken, apiBaseUrl])

  const handleSaveChanges = async () => {
    if (!selectedListing) return
    if (!editForm.title.trim() || !editForm.location.trim() || !editForm.rent.trim()) {
      setStatusMessage('Title, location, and rent are required to save changes.')
      return
    }

    setStatusMessage('')
    setIsSavingEdit(true)
    try {
      const response = await fetch(`${apiBaseUrl}/listings/${selectedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          location: editForm.location.trim(),
          rent: Number(editForm.rent),
          availability: editForm.availability.trim() || null,
          description: editForm.description.trim() || null,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payload.detail ?? 'Unable to update listing right now.')
      }

      await refreshListings()
      setStatusMessage('Listing updated successfully.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to update listing right now.')
      }
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteListing = async () => {
    if (!selectedListing) return
    const shouldDelete = window.confirm('Delete this listing permanently?')
    if (!shouldDelete) return

    setStatusMessage('')
    setIsDeleting(true)
    try {
      const response = await fetch(`${apiBaseUrl}/listings/${selectedListing.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payload.detail ?? 'Unable to delete listing right now.')
      }

      setSelectedListing(null)
      await refreshListings()
      setStatusMessage('Listing deleted successfully.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to delete listing right now.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddImages = async (files: File[]) => {
    if (!selectedListing || files.length === 0) return

    setStatusMessage('')
    setIsUpdatingImages(true)
    try {
      const payload = new FormData()
      for (const file of files) {
        payload.append('images', file)
      }

      const response = await fetch(`${apiBaseUrl}/listings/${selectedListing.id}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      })

      if (!response.ok) {
        const payloadError = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payloadError.detail ?? 'Unable to add images right now.')
      }

      await refreshListings()
      setStatusMessage('Images added successfully.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to add images right now.')
      }
    } finally {
      setIsUpdatingImages(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!selectedListing) return

    setStatusMessage('')
    setIsUpdatingImages(true)
    try {
      const response = await fetch(`${apiBaseUrl}/listings/${selectedListing.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const payloadError = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payloadError.detail ?? 'Unable to delete image right now.')
      }

      await refreshListings()
      setStatusMessage('Image removed successfully.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to delete image right now.')
      }
    } finally {
      setIsUpdatingImages(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between">
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

      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight">My Listings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Review all your listed flats and attached images.</p>

        {isLoading && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading your listings...
          </div>
        )}

        {!isLoading && statusMessage && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
            {statusMessage}
          </div>
        )}

        {!isLoading && listings.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  onClick={() => setEditFromListing(listing)}
                  className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${selectedListing?.id === listing.id ? 'border-indigo-500 dark:border-sky-400' : 'border-slate-200 dark:border-zinc-700'}`}
                >
                  <div className="flex w-full gap-1 bg-slate-100 p-1 dark:bg-zinc-800">
                    <div className="w-2/3">
                      <img
                        src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (listing.image_urls[0] ?? '')}
                        alt={listing.title}
                        className="aspect-square w-full rounded-md object-cover object-center"
                      />
                    </div>
                    <div className="flex w-1/3 flex-col gap-1">
                      <img
                        src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (listing.image_urls[1] ?? listing.image_urls[0] ?? '')}
                        alt={`${listing.title} preview 2`}
                        className="aspect-square w-full rounded-md object-cover object-center"
                      />
                      <img
                        src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (listing.image_urls[2] ?? listing.image_urls[0] ?? '')}
                        alt={`${listing.title} preview 3`}
                        className="aspect-square w-full rounded-md object-cover object-center"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 bg-slate-50 p-5 dark:bg-zinc-800">
                    <h2 className="line-clamp-2 text-lg font-bold">{listing.title}</h2>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-zinc-400">
                      <MapPin className="h-3.5 w-3.5" /> {listing.location}
                    </p>
                    <p className="mt-3 text-base font-semibold text-indigo-600 dark:text-sky-300">INR {listing.rent.toLocaleString()} / month</p>
                    {listing.availability && <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Available from: {listing.availability}</p>}
                    {listing.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{listing.description}</p>}
                    <p className="mt-3 text-xs font-medium text-slate-500 dark:text-zinc-400">{listing.image_urls.length} image(s) attached</p>
                  </div>
                </article>
              ))}
            </div>

            {selectedListing && (
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/40">
                <h2 className="text-lg font-bold">Edit Listing</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Tap any card to switch editing context.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-left">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Title</span>
                    <input
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                    />
                  </label>
                  <label className="text-left">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Location</span>
                    <input
                      value={editForm.location}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                    />
                  </label>
                  <label className="text-left">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Rent (INR)</span>
                    <input
                      type="number"
                      value={editForm.rent}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, rent: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                    />
                  </label>
                  <label className="text-left">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Availability</span>
                    <input
                      value={editForm.availability}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, availability: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                    />
                  </label>
                  <label className="text-left sm:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Description</span>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isSavingEdit || isDeleting || isUpdatingImages}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteListing}
                    disabled={isSavingEdit || isDeleting || isUpdatingImages}
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-zinc-700">
                  <p className="text-sm font-semibold">Manage Images</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Keep minimum 3 and maximum 6 images.</p>

                  <label className="mt-3 block text-left">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Add New Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? [])
                        void handleAddImages(files)
                        event.currentTarget.value = ''
                      }}
                      disabled={isUpdatingImages || isSavingEdit || isDeleting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-200 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:file:bg-sky-900/40 dark:file:text-sky-300"
                    />
                  </label>

                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {selectedListing.images.map((image) => (
                      <div key={image.id} className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-700">
                        <img
                          src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + image.image_url}
                          alt="Listing image"
                          className="h-20 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => void handleDeleteImage(image.id)}
                          disabled={isUpdatingImages || isSavingEdit || isDeleting}
                          className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-90 transition hover:bg-red-700 disabled:opacity-60"
                          aria-label="Delete image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
