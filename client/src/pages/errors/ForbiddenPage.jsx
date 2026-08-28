import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function ForbiddenPage() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-lg max-w-md w-full">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-serenity-900">403</h1>
        <h2 className="mt-2 text-xl font-bold text-red-600">{t('err.403Title')}</h2>
        <p className="mt-2 text-sm text-serenity-700">{t('err.403Body')}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full rounded-xl bg-serenity-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-serenity-700"
          >
            {t('err.returnHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}