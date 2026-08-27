export default function FullPageLoader({ message = "Loading system resources..." }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-serenity-300 border-t-serenity-700"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-serenity-700 animate-pulse">{message}</p>
    </div>
  )
}