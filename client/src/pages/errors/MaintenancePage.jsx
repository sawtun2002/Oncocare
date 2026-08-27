export default function MaintenancePage() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 text-center bg-serenity-900 text-white">
      <div className="max-w-lg p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-serenity-700 text-serenity-100">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zm12 0a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zM4 18a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1zm12 0a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">System Maintenance</h1>
        <p className="mt-4 text-serenity-100/80 leading-relaxed">
          OncoCare HMIS is currently undergoing scheduled platform upgrades to improve service security and performance.
        </p>
        <div className="mt-8 rounded-xl bg-white/10 p-4 text-sm backdrop-blur-md">
          Estimated downtime: <span className="font-semibold text-white">30 Minutes</span>
        </div>
      </div>
    </div>
  )
}