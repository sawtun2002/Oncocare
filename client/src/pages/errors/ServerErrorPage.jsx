import { Link } from 'react-router-dom'

export default function ServerErrorPage({ onRetry }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-serenity-300/40 bg-white p-8 shadow-lg max-w-md w-full">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-serenity-900">500</h1>
        <h2 className="mt-2 text-xl font-bold text-amber-600">Internal Server Error</h2>
        <p className="mt-2 text-sm text-serenity-700">
          Something went wrong on our server while processing your request. Please try again or return home.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full rounded-xl border border-serenity-300 px-4 py-2.5 text-sm font-semibold text-serenity-700 hover:bg-serenity-100"
            >
              Try Again
            </button>
          )}
          <Link
            to="/"
            className="w-full rounded-xl bg-serenity-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-serenity-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}