import { Link, useLocation } from 'react-router-dom'

export default function UnauthorizedPage() {
  const location = useLocation()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-serenity-300/40 bg-white p-8 shadow-lg max-w-md w-full">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-serenity-100 text-serenity-700 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-serenity-900">401</h1>
        <h2 className="mt-2 text-xl font-bold text-serenity-700">Authentication Required</h2>
        <p className="mt-2 text-sm text-serenity-700">
          You must be logged in to view this medical portal feature.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/login"
            state={{ from: location }}
            className="w-full rounded-xl bg-serenity-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-serenity-700"
          >
            Log In to Access
          </Link>
          <Link
            to="/"
            className="w-full rounded-xl border border-serenity-300 px-5 py-2.5 text-sm font-medium text-serenity-700 hover:bg-serenity-100"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}