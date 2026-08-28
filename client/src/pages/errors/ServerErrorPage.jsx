import React from 'react'
import ErrorLayout from '../../Layout/ErrorLayout'

export default function ServerErrorPage({ onRetry }) {
  const { t } = useLanguage()
  return (
    <ErrorLayout
      code="500"
      title="Internal Server Error"
      description="Something went wrong on our end while processing your request. Please try again or head back."
      badgeColor="bg-amber-100 text-amber-600"
      icon={
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
      primaryAction={onRetry ? {
        label: "Try Again",
        onClick: onRetry
      } : null}
      secondaryAction={{
        label: "Return Home",
        to: "/"
      }}
    />
  )
}