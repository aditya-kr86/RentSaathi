import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Moon,
  Save,
  Sun,
  UserCircle2,
} from 'lucide-react'

type ProfileWizardProps = {
  userId: number
  userEmail: string
  accessToken: string
  darkMode: boolean
  onToggleTheme: () => void
  onBack: () => void
  onSaveSuccess: () => void
}

type ProfileFormData = {
  full_name: string
  age: string
  gender: string
  location: string
  budget_min: string
  budget_max: string
  smoking: string
  alcohol: string
  food_preference: string
  cooking: string
  cleanliness_level: string
  sleep_schedule: string
  employment_status: string
  work_type: string
  working_hours: string
  preferred_gender: string
  preferred_occupation: string
  guests_allowed: string
  noise_tolerance: string
  dietary_restrictions: string
  personal_habits: string
}

const EMPTY_PROFILE: ProfileFormData = {
  full_name: '',
  age: '',
  gender: '',
  location: '',
  budget_min: '',
  budget_max: '',
  smoking: '',
  alcohol: '',
  food_preference: '',
  cooking: '',
  cleanliness_level: '',
  sleep_schedule: '',
  employment_status: '',
  work_type: '',
  working_hours: '',
  preferred_gender: '',
  preferred_occupation: '',
  guests_allowed: '',
  noise_tolerance: '',
  dietary_restrictions: '',
  personal_habits: '',
}

function buildDraftKey(userId: number): string {
  return `rentpartner_profile_draft_${userId}`
}

function mergeProfileData(source: Record<string, unknown>): ProfileFormData {
  return {
    ...EMPTY_PROFILE,
    ...Object.fromEntries(
      Object.entries(EMPTY_PROFILE).map(([key]) => [key, String(source[key] ?? '')]),
    ),
  }
}

export default function ProfileWizard({
  userId,
  userEmail,
  accessToken,
  darkMode,
  onToggleTheme,
  onBack,
  onSaveSuccess,
}: ProfileWizardProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<ProfileFormData>(EMPTY_PROFILE)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [isLoadingServerData, setIsLoadingServerData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<string>('')

  const draftStorageKey = useMemo(() => buildDraftKey(userId), [userId])
  const completion = step === 1 ? 50 : 100

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
      const localDraft = localStorage.getItem(draftStorageKey)
      if (localDraft && isMounted) {
        try {
          setForm(mergeProfileData(JSON.parse(localDraft) as Record<string, unknown>))
          setStatusMessage('Resumed from your saved draft.')
        } catch {
          localStorage.removeItem(draftStorageKey)
        }
      }

      try {
        const response = await fetch(`${apiBaseUrl}/profile/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.ok) {
          const payload = (await response.json()) as Record<string, unknown>
          if (isMounted) {
            setForm(mergeProfileData(payload))
            setHasExistingProfile(true)
            setStatusMessage('Loaded your profile details from database. You can edit and save changes.')
          }
        } else if (isMounted && localDraft) {
          // Keep local draft as fallback only when no server profile exists.
          setHasExistingProfile(false)
        }
      } catch {
        // Keep local draft-only flow when backend profile endpoints are unavailable.
      } finally {
        if (isMounted) {
          setIsLoadingServerData(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [accessToken, draftStorageKey])

  useEffect(() => {
    if (isLoadingServerData) return
    localStorage.setItem(draftStorageKey, JSON.stringify(form))
    setLastSavedAt(new Date().toLocaleTimeString())
  }, [draftStorageKey, form, isLoadingServerData])

  const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validateStep1 = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileFormData, string>> = {}
    if (!form.full_name.trim()) nextErrors.full_name = 'Full name is required'

    const age = Number(form.age)
    if (!form.age.trim()) nextErrors.age = 'Age is required'
    else if (!Number.isFinite(age) || age < 18 || age > 80) nextErrors.age = 'Age must be between 18 and 80'

    if (!form.gender) nextErrors.gender = 'Gender is required'
    if (!form.location.trim()) nextErrors.location = 'Location is required'

    const budgetMin = Number(form.budget_min)
    const budgetMax = Number(form.budget_max)
    if (!form.budget_min.trim()) nextErrors.budget_min = 'Minimum budget is required'
    if (!form.budget_max.trim()) nextErrors.budget_max = 'Maximum budget is required'
    if (
      form.budget_min.trim() &&
      form.budget_max.trim() &&
      Number.isFinite(budgetMin) &&
      Number.isFinite(budgetMax) &&
      budgetMin > budgetMax
    ) {
      nextErrors.budget_max = 'Maximum budget must be greater than minimum budget'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSaveDraft = () => {
    localStorage.setItem(draftStorageKey, JSON.stringify(form))
    setLastSavedAt(new Date().toLocaleTimeString())
    setStatusMessage('Draft saved successfully.')
  }

  const handleSubmitProfile = async () => {
    if (!validateStep1()) {
      setStep(1)
      setStatusMessage('Please complete required profile details before saving.')
      return
    }

    setStatusMessage('')
    setIsSubmitting(true)

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')
      const response = await fetch(`${apiBaseUrl}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          budget_min: Number(form.budget_min),
          budget_max: Number(form.budget_max),
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({} as Record<string, string>)))
        throw new Error(payload.detail ?? 'Unable to save profile right now.')
      }

      const savedProfile = (await response.json()) as Record<string, unknown>
      if (typeof savedProfile.id !== 'number') {
        throw new Error('Profile response is invalid. Please try again.')
      }

      localStorage.removeItem(draftStorageKey)
      setHasExistingProfile(true)
      setStatusMessage('Profile saved successfully.')
      onSaveSuccess()
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('Cannot reach backend. Please ensure the API server is running and try again.')
      } else {
        setStatusMessage(error instanceof Error ? error.message : 'Unable to save profile right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInput = (
    label: string,
    key: keyof ProfileFormData,
    placeholder: string,
    type: 'text' | 'number' = 'text',
    optional = false,
  ) => (
    <label className="text-left">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}{optional ? ' (Optional)' : ''}
      </span>
      <input
        type={type}
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 dark:bg-zinc-900 ${errors[key] ? 'border-red-400 focus:ring-red-300/40 dark:border-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-zinc-700 dark:focus:border-sky-400 dark:focus:ring-sky-500/20'}`}
      />
      {errors[key] && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors[key]}</p>}
    </label>
  )

  const renderSelect = (
    label: string,
    key: keyof ProfileFormData,
    options: string[],
    optional = false,
  ) => (
    <label className="text-left">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}{optional ? ' (Optional)' : ''}
      </span>
      <select
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 dark:bg-zinc-900 ${errors[key] ? 'border-red-400 focus:ring-red-300/40 dark:border-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-zinc-700 dark:focus:border-sky-400 dark:focus:ring-sky-500/20'}`}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors[key] && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors[key]}</p>}
    </label>
  )

  if (isLoadingServerData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading your profile wizard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 font-sans text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onToggleTheme} className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800">
          {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Complete Your Profile</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Signed in as {userEmail}. Step {step} of 2.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-sky-900/30 dark:text-sky-300">
            <UserCircle2 className="h-4 w-4" /> Milestone 3
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            <span>Progress</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-300 dark:from-sky-400 dark:to-blue-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {statusMessage && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${statusMessage.toLowerCase().includes('success') ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300' : statusMessage.toLowerCase().includes('unable') ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-300'}`}>
            {statusMessage}
          </div>
        )}

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {renderInput('Full Name', 'full_name', 'John Doe')}
            {renderInput('Age', 'age', '24', 'number')}
            {renderSelect('Gender', 'gender', ['Male', 'Female', 'Non-binary', 'Prefer not to say'])}
            {renderInput('Current City / Preferred Location', 'location', 'Bangalore')}
            {renderInput('Budget Min (INR)', 'budget_min', '10000', 'number')}
            {renderInput('Budget Max (INR)', 'budget_max', '25000', 'number')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {renderSelect('Smoking', 'smoking', ['Yes', 'No', 'Occasionally'])}
            {renderSelect('Alcohol', 'alcohol', ['Yes', 'No', 'Occasionally'])}
            {renderSelect('Food Preference', 'food_preference', ['Veg', 'Non-Veg', 'Eggetarian'])}
            {renderSelect('Cooking', 'cooking', ['Yes', 'No'])}
            {renderSelect('Cleanliness Level', 'cleanliness_level', ['Low', 'Medium', 'High'])}
            {renderSelect('Sleep Schedule', 'sleep_schedule', ['Early', 'Late'])}
            {renderSelect('Employment Status', 'employment_status', ['Student', 'Working', 'Other'])}
            {renderSelect('Work Type', 'work_type', ['WFH', 'Office', 'Hybrid'])}
            {renderSelect('Working Hours', 'working_hours', ['Day', 'Night', 'Flexible'])}
            {renderSelect('Preferred Gender', 'preferred_gender', ['Male', 'Female', 'Any'], true)}
            {renderSelect('Preferred Occupation', 'preferred_occupation', ['Student', 'Working', 'Any'], true)}
            {renderSelect('Guests Allowed', 'guests_allowed', ['Yes', 'No'])}
            {renderSelect('Noise Tolerance', 'noise_tolerance', ['Low', 'Medium', 'High'])}
            {renderInput('Dietary Restrictions', 'dietary_restrictions', 'Optional details', 'text', true)}
            <div className="sm:col-span-2">
              {renderInput('Personal Habits', 'personal_habits', 'Optional details', 'text', true)}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {lastSavedAt ? `Last saved at ${lastSavedAt}` : 'Draft autosave enabled'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2)
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitProfile}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {hasExistingProfile ? 'Save Changes' : 'Save Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
