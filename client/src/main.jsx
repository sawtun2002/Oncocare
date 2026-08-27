import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      {/* `reducedMotion="user"` is the single place prefers-reduced-motion is
          honoured: Framer Motion then drops transform and layout animation
          everywhere in the app on its own, keeping only opacity. Without it,
          every variant in lib/motion.js would need its own branch. */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>,
)
