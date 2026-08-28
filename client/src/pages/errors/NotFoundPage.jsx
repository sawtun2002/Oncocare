import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-serenity-300/40 bg-white p-8 shadow-lg max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-serenity-500">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-serenity-900">{t('err.404Title')}</h2>
        <p className="mt-2 text-sm text-serenity-700">{t('err.404Body')}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block w-full rounded-xl bg-serenity-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-serenity-700"
          >
            {t('err.backHomePage')}
          </Link>
        </div>
      </div>
    </div>
  )
}