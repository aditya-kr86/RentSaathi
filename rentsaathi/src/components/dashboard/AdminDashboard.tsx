import { Home, LoaderCircle, Moon, RefreshCw, ShieldCheck, Sun, Trash2, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type AdminDashboardProps = {
  accessToken: string
  adminUserId: number
  adminEmail: string
  darkMode: boolean
  onToggleTheme: () => void
  onLogout: () => void
}

type AdminListing = {
  id: number
  owner_id: number
  title: string
  location: string
  rent: number
  availability: string | null
  description: string | null
  image_urls: string[]
  created_at: string
}

type AdminUser = {
  id: number
  email: string
  created_at: string
  is_premium: boolean
  is_admin: boolean
  listing_count: number
}

export default function AdminDashboard({ accessToken, adminUserId, adminEmail, darkMode, onToggleTheme, onLogout }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [listings, setListings] = useState<AdminListing[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])

  const apiBaseUrl = useMemo(() => (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, ''), [])

  const fetchAdminData = async () => {
    setStatusMessage('')
    setIsRefreshing(true)

    try {
      const [listingsResponse, usersResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/listings?limit=200`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${apiBaseUrl}/admin/users?limit=200`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ])

      const listingsPayload = (await listingsResponse.json().catch(() => [])) as AdminListing[] | { detail?: string }
      const usersPayload = (await usersResponse.json().catch(() => [])) as AdminUser[] | { detail?: string }

      if (!listingsResponse.ok) {
        const detail = typeof listingsPayload === 'object' && listingsPayload && 'detail' in listingsPayload ? listingsPayload.detail : undefined
        throw new Error(detail ?? 'Unable to load listings for moderation.')
      }

      if (!usersResponse.ok) {
        const detail = typeof usersPayload === 'object' && usersPayload && 'detail' in usersPayload ? usersPayload.detail : undefined
        throw new Error(detail ?? 'Unable to load users for moderation.')
      }

      setListings(Array.isArray(listingsPayload) ? listingsPayload : [])
      setUsers(Array.isArray(usersPayload) ? usersPayload : [])
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to load admin dashboard data.')
      }
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [accessToken, apiBaseUrl])

  const handleDeleteListing = async (listingId: number) => {
    const shouldDelete = window.confirm('Remove this listing as misleading? This action is permanent.')
    if (!shouldDelete) return

    setStatusMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const payload = (await response.json().catch(() => ({} as Record<string, string>)))
      if (!response.ok) {
        throw new Error(payload.detail ?? 'Unable to delete listing right now.')
      }

      await fetchAdminData()
      setStatusMessage('Listing removed by admin.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to delete listing right now.')
      }
    }
  }

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    const shouldDelete = window.confirm(`Remove user ${userEmail} and all their listings? This action is permanent.`)
    if (!shouldDelete) return

    setStatusMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const payload = (await response.json().catch(() => ({} as Record<string, string>)))
      if (!response.ok) {
        throw new Error(payload.detail ?? 'Unable to delete user right now.')
      }

      await fetchAdminData()
      setStatusMessage('User and all listings removed by admin.')
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend right now. Start API server and retry.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to delete user right now.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-300">Admin Control</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Signed in as {adminEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>
            <button
              onClick={fetchAdminData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">RentPartner Moderation Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Monitor listings and keep your community safe with quick moderation actions.</p>
        </div>

        {statusMessage && (
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
            {statusMessage}
          </div>
        )}

        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading moderation data...
          </div>
        )}

        {!isLoading && (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold">
                <ShieldCheck className="h-5 w-5 text-rose-500" /> Listing Moderation
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                      <th className="px-3 py-3 font-semibold">Listing</th>
                      <th className="px-3 py-3 font-semibold">Owner ID</th>
                      <th className="px-3 py-3 font-semibold">Location</th>
                      <th className="px-3 py-3 font-semibold">Rent</th>
                      <th className="px-3 py-3 font-semibold">Images</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-slate-100 align-top dark:border-zinc-800">
                        <td className="px-3 py-3">
                          <p className="font-semibold">{listing.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">{listing.description ?? 'No description'}</p>
                        </td>
                        <td className="px-3 py-3">{listing.owner_id}</td>
                        <td className="px-3 py-3">{listing.location}</td>
                        <td className="px-3 py-3">INR {listing.rent.toLocaleString()}</td>
                        <td className="px-3 py-3">{listing.image_urls.length}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove Listing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold">
                <Users className="h-5 w-5 text-indigo-500" /> User Moderation
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                      <th className="px-3 py-3 font-semibold">User</th>
                      <th className="px-3 py-3 font-semibold">Role</th>
                      <th className="px-3 py-3 font-semibold">Listings</th>
                      <th className="px-3 py-3 font-semibold">Joined</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 dark:border-zinc-800">
                        <td className="px-3 py-3">
                          <p className="font-semibold">{user.email}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">User ID: {user.id}</p>
                        </td>
                        <td className="px-3 py-3">
                          {user.is_admin ? (
                            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Admin</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">User</span>
                          )}
                        </td>
                        <td className="px-3 py-3">{user.listing_count}</td>
                        <td className="px-3 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={user.id === adminUserId || user.is_admin}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove User + Listings
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-slate-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>RentPartner Admin Panel</p>
          <p>Moderation operations are logged for accountability.</p>
        </div>
      </footer>
    </div>
  )
}
