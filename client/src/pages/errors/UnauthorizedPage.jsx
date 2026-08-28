import React from 'react'
import { useLocation } from 'react-router-dom'
import ErrorLayout from '../../Layout/ErrorLayout'

export default function UnauthorizedPage() {
  const location = useLocation()
  const { t } = useLanguage()

  return (
    <ErrorLayout
      code="401"
      title="Authentication Required"
      description="You must be logged in to access this section of the medical portal."
      icon={
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
      badgeColor="bg-serenity-100 text-serenity-600"
      primaryAction={{
        label: "Log In to Access",
        to: "/login",
        state: { from: location }
      }}
      secondaryAction={{
        label: "Back to Home",
        to: "/"
      }}
    />
  )
}