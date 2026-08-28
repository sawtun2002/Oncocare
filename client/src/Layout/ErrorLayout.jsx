import { Link } from 'react-router-dom'

const ICON_BASE =
  "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform hover:scale-105"

const BADGE_BASE =
  "mt-6 rounded-xl border border-serenity-200/50 px-4 py-3 text-xs font-medium dark:border-serenity-800/50"

const PRIMARY_BASE =
  "flex-1 rounded-xl bg-serenity-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-serenity-600/20 transition-all hover:bg-serenity-700 active:scale-[0.98]"

const SECONDARY_BASE =
  "flex-1 rounded-xl border border-serenity-200 bg-transparent px-5 py-3 text-sm font-semibold text-serenity-700 transition-all hover:bg-serenity-50 active:scale-[0.98] dark:border-serenity-700 dark:text-serenity-200 dark:hover:bg-serenity-800"

/**
 * Join class lists, dropping falsy values. This is the template-literal
 * fallback requested by the brief -- if `tailwind-merge` is ever added,
 * swap the body for `twMerge(...classes)` so an incoming `badgeColor` can
 * override a default `bg-*`/`text-*` without leaving both in the string.
 */
function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function isExternalHref(to) {
  return typeof to === "string" && /^https?:\/\//i.test(to)
}

function renderAction(action, baseClass, key) {
  if (!action || !action.label) return null

  // External URL -> plain anchor that opens in a new tab safely.
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

  // Internal route string -> React Router Link (state is forwarded for
  // things like "redirect back after login").
  if (action.to) {
    return (
      <Link key={key} to={action.to} state={action.state} className={baseClass}>
        {action.label}
      </Link>
    )
  }

  // No route -> behaviour is driven by an onClick handler (e.g. retry).
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
  badgeColor = "bg-serenity-100 text-serenity-700",
  primaryAction,
  secondaryAction,
}) {
  const hasActions = Boolean(primaryAction || secondaryAction)

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-md rounded-3xl border border-serenity-200/60 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-serenity-800/50 dark:bg-serenity-900/80">
        {icon && (
          <div className={cx(ICON_BASE, badgeColor)}>{icon}</div>
        )}

        {code && (
          <span className="text-xs font-bold tracking-widest uppercase text-serenity-500">
            Error {code}
          </span>
        )}

        {title && (
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-serenity-950 dark:text-white sm:text-4xl">
            {title}
          </h1>
        )}

        {description && (
          <p className="mt-3 text-sm leading-relaxed text-serenity-600 dark:text-serenity-300">
            {description}
          </p>
        )}

        {badge && (
          <div className={cx(BADGE_BASE, badgeColor)}>{badge}</div>
        )}

        {hasActions && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
            {renderAction(primaryAction, PRIMARY_BASE, "primary")}
            {renderAction(secondaryAction, SECONDARY_BASE, "secondary")}
          </div>
        )}
      </div>
    </div>
  )
}
