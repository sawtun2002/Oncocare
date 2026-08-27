import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-serenity-300/40 bg-white p-8 shadow-lg max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-serenity-500">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-serenity-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-serenity-700">
          The requested page doesn't exist or has been moved to a new address.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block w-full rounded-xl bg-serenity-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-serenity-700"
          >
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  )
}