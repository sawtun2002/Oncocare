import { Link } from 'react-router-dom'

const ICON_BASE =
  "mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"

const BADGE_BASE =
  "mt-8 inline-flex rounded-full border border-serenity-200/60 bg-white/50 px-6 py-2.5 text-xs font-semibold backdrop-blur-sm dark:border-serenity-700/50 dark:bg-serenity-800/50"

const PRIMARY_BASE =
  "flex-1 rounded-2xl bg-gradient-to-r from-serenity-600 to-serenity-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-serenity-600/30 transition-all hover:from-serenity-700 hover:to-serenity-600 hover:shadow-xl hover:shadow-serenity-600/40 active:scale-[0.98]"

const SECONDARY_BASE =
  "flex-1 rounded-2xl border-2 border-serenity-300 bg-white/80 px-8 py-4 text-sm font-semibold text-serenity-700 backdrop-blur-sm transition-all hover:border-serenity-400 hover:bg-white active:scale-[0.98] dark:border-serenity-600 dark:bg-serenity-800/80 dark:text-serenity-200 dark:hover:border-serenity-500 dark:hover:bg-serenity-800"

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function isExternalHref(to) {
  return typeof to === "string" && /^https?:\/\//i.test(to)
}

function renderAction(action, baseClass, key) {
  if (!action || !action.label) return null

  if (action.to && isExternalHref(action.to)) {
    return (
      <a
        key={key}
        href={action.to}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        {action.label}
      </a>
    )
  }

  if (action.to) {
    return (
      <Link key={key} to={action.to} state={action.state} className={baseClass}>
        {action.label}
      </Link>
    )
  }

  return (
    <button key={key} type="button" onClick={action.onClick} className={baseClass}>
      {action.label}
    </button>
  )
}

export default function ErrorLayout({
  code,
  title,
  description,
  icon,
  badge,
  badgeColor = "bg-serenity-100/80 text-serenity-700 dark:bg-serenity-800/80 dark:text-serenity-200",
  primaryAction,
  secondaryAction,
}) {
  const hasActions = Boolean(primaryAction || secondaryAction)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-serenity-50 via-white to-serenity-100 px-4 py-16 dark:from-serenity-950 dark:via-serenity-900 dark:to-serenity-950">
      
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-serenity-200/30 blur-3xl dark:bg-serenity-700/20" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-serenity-300/20 blur-3xl dark:bg-serenity-600/20" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-serenity-100/40 blur-2xl dark:bg-serenity-800/10" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
               backgroundSize: '40px 40px'
             }} 
        />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-2xl text-center">
        {icon && (
          <div className={cx(ICON_BASE, badgeColor)}>
            {icon}
          </div>
        )}

        {code && (
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-px w-8 bg-serenity-300 dark:bg-serenity-600" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-serenity-500 dark:text-serenity-400">
              Error {code}
            </span>
            <span className="h-px w-8 bg-serenity-300 dark:bg-serenity-600" />
          </div>
        )}

        {title && (
          <h1 className="mb-4 bg-gradient-to-r from-serenity-800 via-serenity-600 to-serenity-800 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-serenity-100 dark:via-serenity-300 dark:to-serenity-100 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        )}

        {description && (
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-serenity-600 dark:text-serenity-300 sm:text-lg">
            {description}
          </p>
        )}

        {badge && (
          <div className={cx(BADGE_BASE, badgeColor)}>
            {badge}
          </div>
        )}

        {hasActions && (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row-reverse sm:justify-center">
            {renderAction(primaryAction, PRIMARY_BASE, "primary")}
            {renderAction(secondaryAction, SECONDARY_BASE, "secondary")}
          </div>
        )}
      </div>

      {/* Subtle footer line */}
      <div className="relative mt-16 text-xs text-serenity-400 dark:text-serenity-600">
        <span className="mx-2">•</span>
        Serenity
        <span className="mx-2">•</span>
      </div>
    </div>
  )
}