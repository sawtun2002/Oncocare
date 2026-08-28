import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import {LoadingBarProvider} from './context/LoadingBarContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Treat fetched data as fresh for 30s. Without this, every page mount
      // refetches data it already holds (default staleTime is 0), so moving
      // between pages re-runs queries and re-renders for no gain. Mutations
      // still invalidate their keys explicitly, so a change is never missed.
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
      {/* `reducedMotion="user"` is the single place prefers-reduced-motion is
          honoured: Framer Motion then drops transform and layout animation
          everywhere in the app on its own, keeping only opacity. Without it,
          every variant in lib/motion.js would need its own branch. */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <LoadingBarProvider>
                  <App />
                </LoadingBarProvider>
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)



