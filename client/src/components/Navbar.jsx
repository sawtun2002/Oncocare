import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth() // Get user and logout from your auth context

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    
    switch (user.role) {
      case 'PATIENT':
        return '/patient/dashboard'
      case 'DOCTOR':
        return '/doctor/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      case 'RECEPTIONIST':
        return '/receptionist/dashboard'
      case 'NURSE':
        return '/nurse/dashboard'
      default:
        return '/'
    }
  }

  const getProfileLink = () => {
    if (!user) return '/'
    
    switch (user.role) {
      case 'PATIENT':
        return '/patient/profile'
      case 'DOCTOR':
        return '/doctor/profile'
      case 'ADMIN':
        return '/admin/profile'
      case 'RECEPTIONIST':
        return '/receptionist/profile'
      case 'NURSE':
        return '/nurse/profile'
      default:
        return '/profile'
    }
  }

  const getRoleIcon = () => {
    if (!user) return 'fa-user'
    
    switch (user.role) {
      case 'PATIENT':
        return 'fa-user'
      case 'DOCTOR':
        return 'fa-user-doctor'
      case 'ADMIN':
        return 'fa-user-shield'
      case 'RECEPTIONIST':
        return 'fa-user-tie'
      case 'NURSE':
        return 'fa-user-nurse'
      default:
        return 'fa-user'
    }
  }

  const getRoleName = () => {
    if (!user) return ''
    return user.role.charAt(0).toUpperCase() + user.role.slice(1)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-serenity-600 flex items-center justify-center">
                <i className="fas fa-heartbeat text-white"></i>
              </div>
              <span className="text-xl font-bold text-serenity-900">OncoCare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-serenity-700 hover:text-serenity-900 font-medium">
              Home
            </Link>
            <Link to="/doctors" className="text-serenity-700 hover:text-serenity-900 font-medium">
              Doctors
            </Link>
            <Link to="/rooms" className="text-serenity-700 hover:text-serenity-900 font-medium">
              Rooms
            </Link>
            <Link to="/about" className="text-serenity-700 hover:text-serenity-900 font-medium">
              About
            </Link>
            <Link to="/contact" className="text-serenity-700 hover:text-serenity-900 font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Buttons / Profile */}
          <div className="hidden items-center gap-4 md:flex">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-serenity-700 hover:text-serenity-900 font-medium px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-serenity-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-serenity-700 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-serenity-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-serenity-100 flex items-center justify-center">
                        <i className={`fas ${getRoleIcon()} text-serenity-700`}></i>
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-serenity-900 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-serenity-500">{getRoleName()}</p>
                  </div>
                  <i className={`fas fa-chevron-down text-serenity-400 text-xs transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-serenity-100 py-2">
                    <div className="px-4 py-3 border-b border-serenity-100">
                      <p className="text-sm font-semibold text-serenity-900">{user.name}</p>
                      <p className="text-xs text-serenity-500">{user.email}</p>
                    </div>

                    <Link
                      to={getProfileLink()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors"
                    >
                      <i className="fas fa-user text-serenity-400 w-5"></i>
                      My Profile
                    </Link>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors"
                    >
                      <i className="fas fa-chart-line text-serenity-400 w-5"></i>
                      {getRoleName()} Dashboard
                    </Link>

                    <div className="border-t border-serenity-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt text-red-400 w-5"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="Open my profile menu"
                  aria-expanded={isProfileOpen}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-serenity-300 bg-serenity-100 text-serenity-700 focus:outline-none focus:ring-2 focus:ring-serenity-300"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <i className={`fas ${getRoleIcon()}`} aria-hidden="true"></i>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-serenity-100 bg-white py-2 shadow-xl">
                    <div className="border-b border-serenity-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-serenity-900">{user.name}</p>
                      <p className="truncate text-xs text-serenity-500">{user.email}</p>
                    </div>
                    <Link
                      to={getProfileLink()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50"
                    >
                      <i className="fas fa-user w-5 text-serenity-400" aria-hidden="true"></i>
                      My Profile
                    </Link>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50"
                    >
                      <i className="fas fa-chart-line w-5 text-serenity-400" aria-hidden="true"></i>
                      {getRoleName()} Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-serenity-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-sign-out-alt w-5 text-red-400" aria-hidden="true"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-serenity-700 transition-colors hover:bg-serenity-100 focus:outline-none focus:ring-2 focus:ring-serenity-300"
            >
              <i className="fas fa-bars text-lg" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}