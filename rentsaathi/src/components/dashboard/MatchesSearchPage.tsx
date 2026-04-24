import { ArrowLeft, LoaderCircle, MapPin, Moon, RefreshCw, Sun, User, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type MatchesSearchPageProps = {
  accessToken: string
  darkMode: boolean
  onToggleTheme: () => void
  onBack: () => void
}

type MatchUser = {
  user_id: number
  location: string
  full_name: string
  age: number
  gender: string
  budget_min: number
  budget_max: number
  smoking: string | null
}

type MatchResult = {
  match_score: number
  user: MatchUser
}

type ListingCard = {
  id: number
  owner_id: number
  title: string
  location: string
  rent: number
  availability: string | null
  description: string | null
  image_urls: string[]
}

type MatchedListing = {
  listing: ListingCard
  match: MatchResult | null
}

export default function MatchesSearchPage({ accessToken, darkMode, onToggleTheme, onBack }: MatchesSearchPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [matches, setMatches] = useState<MatchedListing[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchedListing | null>(null)

  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, ''), [])

  const formatApiError = (payload: unknown, fallback: string) => {
    if (!payload || typeof payload !== 'object') return fallback

    if ('detail' in payload) {
      const detail = (payload as { detail?: unknown }).detail
      if (typeof detail === 'string' && detail.trim()) return detail

      if (Array.isArray(detail)) {
        const firstItem = detail[0]
        if (typeof firstItem === 'string' && firstItem.trim()) return firstItem
        if (firstItem && typeof firstItem === 'object' && 'msg' in firstItem) {
          const message = (firstItem as { msg?: unknown }).msg
          if (typeof message === 'string' && message.trim()) return message
        }
      }

      if (detail && typeof detail === 'object' && 'msg' in detail) {
        const message = (detail as { msg?: unknown }).msg
        if (typeof message === 'string' && message.trim()) return message
      }
    }

    return fallback
  }

  const fetchMatches = async () => {
    setStatusMessage('')
    setIsLoading(true)

    try {
      const [matchesResponse, listingsResponse, meResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/matches?limit=100`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${apiBaseUrl}/listings?limit=100`),
        fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ])

      const matchesPayload = (await matchesResponse.json().catch(() => [])) as MatchResult[] | { detail?: string }
      const listingsPayload = (await listingsResponse.json().catch(() => [])) as ListingCard[] | { detail?: string }
      const mePayload = (await meResponse.json().catch(() => ({} as { id?: number; detail?: string }))) as {
        id?: number
        detail?: string
      }

      if (!listingsResponse.ok) {
        throw new Error(formatApiError(listingsPayload, 'Unable to fetch listings right now.'))
      }

      const activeUserId = meResponse.ok && typeof mePayload.id === 'number' ? mePayload.id : null

      const matchRecords = matchesResponse.ok && Array.isArray(matchesPayload) ? matchesPayload : []
      const listingRecords = Array.isArray(listingsPayload) ? listingsPayload : []
      const scoredByOwnerId = new Map(matchRecords.map((match) => [match.user.user_id, match]))

      const listingMatches = listingRecords
        .filter((listing) => listing.owner_id !== activeUserId)
        .map((listing) => {
          const ownerMatch = scoredByOwnerId.get(listing.owner_id)
          return { listing, match: ownerMatch ?? null }
        })
        .sort((a, b) => {
          const scoreA = a.match?.match_score ?? -1
          const scoreB = b.match?.match_score ?? -1
          return scoreB - scoreA
        })

      setMatches(listingMatches)
      setSelectedMatch((prev) => (prev ? listingMatches.find((item) => item.listing.id === prev.listing.id) ?? null : null))

      if (!matchesResponse.ok) {
        setStatusMessage('Showing flat listings. Compatibility score is unavailable until profile matching data is ready.')
        return
      }

      if (listingMatches.length === 0) {
        setStatusMessage('No flat listings found from other users yet.')
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to fetch listings right now.')
      }
      setMatches([])
      setSelectedMatch(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [accessToken, apiBaseUrl])

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
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Matches</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          Smart compatibility scores based on your profile preferences.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-700 dark:text-zinc-200">
            {isLoading ? 'Calculating your best matches...' : `${matches.length} match(es) found`}
          </p>
          <button
            onClick={fetchMatches}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        {statusMessage && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
            {statusMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((item) => (
            <article
              key={item.listing.id}
              onClick={() => setSelectedMatch(item)}
              className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 ${selectedMatch?.listing.id === item.listing.id ? 'border-indigo-500 dark:border-sky-400' : 'border-slate-200 dark:border-zinc-700'}`}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-4 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">Compatibility</p>
                <p className="text-3xl font-black leading-none">{item.match ? `${item.match.match_score}%` : 'N/A'}</p>
              </div>
              <div className="flex w-full gap-1 bg-slate-100 p-1 dark:bg-zinc-800">
                <div className="w-2/3">
                  <img
                    src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (item.listing.image_urls[0] ?? '')}
                    alt={item.listing.title}
                    className="aspect-square w-full rounded-md object-cover object-center"
                  />
                </div>
                <div className="flex w-1/3 flex-col gap-1">
                  <img
                    src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (item.listing.image_urls[1] ?? item.listing.image_urls[0] ?? '')}
                    alt={`${item.listing.title} preview 2`}
                    className="aspect-square w-full rounded-md object-cover object-center"
                  />
                  <img
                    src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + (item.listing.image_urls[2] ?? item.listing.image_urls[0] ?? '')}
                    alt={`${item.listing.title} preview 3`}
                    className="aspect-square w-full rounded-md object-cover object-center"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-slate-50 p-5 dark:bg-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-sky-300">
                  {item.match ? `${item.match.match_score}% Match` : 'Profile Match Pending'}
                </p>
                <h2 className="line-clamp-2 text-lg font-bold">{item.listing.title}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" /> {item.listing.location}
                </p>
                <p className="text-base font-semibold text-indigo-600 dark:text-sky-300">INR {item.listing.rent.toLocaleString()} / month</p>
                {item.listing.availability && <p className="text-sm text-slate-600 dark:text-zinc-400">Available from: {item.listing.availability}</p>}
                {item.listing.description && <p className="line-clamp-3 text-sm text-slate-600 dark:text-zinc-400">{item.listing.description}</p>}
                <p className="text-sm text-slate-600 dark:text-zinc-400">Listed by: {item.match?.user.full_name ?? `User ID ${item.listing.owner_id}`}</p>
              </div>
            </article>
          ))}
        </div>

      </div>

      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <button
              onClick={() => setSelectedMatch(null)}
              aria-label="Close listing details"
              className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-sky-900/50 dark:bg-sky-900/30 dark:text-sky-300">
                <User className="h-3.5 w-3.5" /> {selectedMatch.match ? `${selectedMatch.match.match_score}% Match` : 'Profile Match Pending'}
              </div>

              <h3 className="mt-3 text-2xl font-bold tracking-tight">{selectedMatch.listing.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                Listed by {selectedMatch.match?.user.full_name ?? `User ID ${selectedMatch.listing.owner_id}`}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Location: {selectedMatch.listing.location}</p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm text-slate-600 dark:text-zinc-400">Monthly rent</p>
                <p className="mt-1 text-lg font-semibold text-indigo-600 dark:text-sky-300">
                  INR {selectedMatch.listing.rent.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm text-slate-600 dark:text-zinc-400">Availability</p>
                <p className="mt-1 text-base font-medium text-slate-800 dark:text-zinc-200">{selectedMatch.listing.availability ?? 'Not specified'}</p>
              </div>

              {selectedMatch.listing.description && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-sm text-slate-600 dark:text-zinc-400">Flat details</p>
                  <p className="mt-1 text-base font-medium text-slate-800 dark:text-zinc-200">{selectedMatch.listing.description}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {selectedMatch.listing.image_urls.map((imageUrl, index) => (
                  <div key={`${selectedMatch.listing.id}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                      src={(import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '') + imageUrl}
                      alt={`Listing image ${index + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400">
                Profile compatibility score appears when the lister has completed profile details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
