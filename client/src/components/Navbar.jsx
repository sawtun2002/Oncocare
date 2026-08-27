import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext"
import logoFull from '../assets/logo-full-hori.png'
import logoMark from '../assets/logo-mark.png'

export default function Navbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Separate refs for desktop and mobile containers to avoid DOM node conflicts
  const desktopProfileRef = useRef(null)
  const mobileProfileRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Track scroll position for navbar morphing
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    function handleClickOutside(event) {
      const isOutsideDesktop = desktopProfileRef.current && !desktopProfileRef.current.contains(event.target)
      const isOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)

      if (isOutsideDesktop && isOutsideMobile) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async (e) => {
    e.stopPropagation()
    try {
      setIsProfileOpen(false)
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleDropdownNavigation = (e, path) => {
    e.stopPropagation()
    setIsProfileOpen(false)
    navigate(path)
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    return user.role === 'PATIENT' ? '/my-bookings' : '/dashboard'
  }

  const getProfileLink = () => {
    return user ? '/profile' : '/'
  }

  const getRoleIcon = () => {
    if (!user) return 'fa-user'
    switch (user.role) {
      case 'PATIENT': return 'fa-user'
      case 'DOCTOR': return 'fa-user-doctor'
      case 'ADMIN': return 'fa-user-shield'
      case 'RECEPTIONIST': return 'fa-user-tie'
      case 'NURSE': return 'fa-user-nurse'
      default: return 'fa-user'
    }
  }

  const getRoleName = () => {
    if (!user) return ''
    return user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Outer Left Logo - Hidden on scroll */}
          <div className={`hidden md:flex items-center shrink-0 transition-all duration-300 ease-in-out ${
            isScrolled 
              ? 'opacity-0 -translate-x-6 pointer-events-none scale-95 max-w-0 overflow-hidden' 
              : 'opacity-100 translate-x-0 scale-100'
          }`}>
            <Link to="/" className="flex items-center cursor-pointer group">
              <img 
                src={logoFull} 
                alt="OncoCare" 
                className="h-10 lg:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Mobile Logo - Always visible on mobile */}
          <div className="md:hidden flex items-center shrink-0">
            <Link to="/" className="flex items-center cursor-pointer">
              <img 
                src={logoMark} 
                alt="OncoCare" 
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Central Pill Navigation Wrapper */}
          <div className={`hidden md:flex items-center transition-all duration-300 ease-in-out rounded-full ${
            isScrolled 
              ? 'bg-white border border-serenity-100 shadow-md p-2 gap-3' 
              : 'bg-white/10 backdrop-blur-sm border border-white/20 p-2 gap-1.5'
          }`}>
            
            {/* Inner Logo Mark - Appears on scroll */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${
              isScrolled 
                ? 'max-w-[140px] opacity-100 pl-2 pr-1 translate-x-0' 
                : 'max-w-0 opacity-0 p-0 -translate-x-2 pointer-events-none'
            }`}>
              <Link to="/" className="flex items-center cursor-pointer transition-transform duration-200 hover:scale-105">
                <img 
                  src={logoMark} 
                  alt="OncoCare Mark" 
                  className="h-8 w-auto min-w-[32px] object-contain"
                />
              </Link>
            </div>

            {/* Core Nav Links */}
            <div className="flex items-center gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? isScrolled
                          ? 'bg-serenity-600 text-white shadow-sm'
                          : 'bg-white/20 text-white shadow-sm'
                        : isScrolled
                          ? 'text-serenity-700 hover:bg-serenity-50'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Inner Login/Profile Button - Appears on scroll */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${
              isScrolled 
                ? 'max-w-[200px] opacity-100 pl-1 translate-x-0' 
                : 'max-w-0 opacity-0 p-0 translate-x-2 pointer-events-none'
            }`}>
              {user ? (
                <div className="relative" ref={desktopProfileRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer rounded-full px-2 py-1 transition-colors hover:bg-serenity-50"
                  >
                    <div className="relative">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-9 w-9 rounded-full object-cover border-2 border-serenity-200" 
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-serenity-100 flex items-center justify-center">
                          <i className={`fas ${getRoleIcon()} text-serenity-700`}></i>
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>
                    <i className="fas fa-chevron-down text-serenity-400 text-xs transition-transform ${isProfileOpen ? 'rotate-180' : ''}"></i>
                  </button>

                  {/* Inner Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-serenity-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-serenity-100">
                        <p className="text-sm font-semibold text-serenity-900">{user.name}</p>
                        <p className="text-xs text-serenity-500">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => handleDropdownNavigation(e, getProfileLink())}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors cursor-pointer"
                      >
                        <i className="fas fa-user text-serenity-400 w-5"></i>
                        My Profile
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => handleDropdownNavigation(e, getDashboardLink())}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors cursor-pointer"
                      >
                        <i className="fas fa-chart-line text-serenity-400 w-5"></i>
                        {getRoleName()} Dashboard
                      </button>
                      <div className="border-t border-serenity-100 mt-2 pt-2">
                        <button
                          type="button"
                          onMouseDown={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <i className="fas fa-sign-out-alt text-red-400 w-5"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink 
                  to="/login" 
                  className="flex whitespace-nowrap items-center gap-2 rounded-full bg-serenity-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-serenity-700 active:scale-95 cursor-pointer"
                >
                  Log in
                  <span className="text-xs">→</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Outer Right Action CTA Button - Hidden on scroll */}
          <div className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
            isScrolled 
              ? 'opacity-0 translate-x-6 pointer-events-none scale-95 max-w-0 overflow-hidden' 
              : 'opacity-100 translate-x-0 scale-100'
          }`}>
            {user ? (
              <div className="relative" ref={desktopProfileRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer rounded-full px-2 py-1 transition-colors hover:bg-white/10"
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover border-2 border-white/40" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <i className={`fas ${getRoleIcon()} text-white`}></i>
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-white/80">{getRoleName()}</p>
                  </div>
                  <i className={`fas fa-chevron-down text-white/80 text-xs transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Outer Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-serenity-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-serenity-100">
                      <p className="text-sm font-semibold text-serenity-900">{user.name}</p>
                      <p className="text-xs text-serenity-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => handleDropdownNavigation(e, getProfileLink())}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors cursor-pointer"
                    >
                      <i className="fas fa-user text-serenity-400 w-5"></i>
                      My Profile
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => handleDropdownNavigation(e, getDashboardLink())}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 transition-colors cursor-pointer"
                    >
                      <i className="fas fa-chart-line text-serenity-400 w-5"></i>
                      {getRoleName()} Dashboard
                    </button>
                    <div className="border-t border-serenity-100 mt-2 pt-2">
                      <button
                        type="button"
                        onMouseDown={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <i className="fas fa-sign-out-alt text-red-400 w-5"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className="font-medium px-4 py-2 rounded-full transition-all cursor-pointer text-white hover:bg-white/10"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="px-4 py-2 rounded-full font-medium transition-all cursor-pointer bg-white text-serenity-700 hover:bg-serenity-50 shadow-lg"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Profile & Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-label="Open my profile menu"
                  aria-expanded={isProfileOpen}
                  className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 focus:outline-none cursor-pointer ${
                    isScrolled 
                      ? 'border-serenity-300 bg-serenity-100 text-serenity-700' 
                      : 'border-white/40 bg-white/20 text-white'
                  }`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <i className={`fas ${getRoleIcon()}`} aria-hidden="true"></i>
                  )}
                </button>

                {/* Mobile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-serenity-100 bg-white py-2 shadow-xl">
                    <div className="border-b border-serenity-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-serenity-900">{user.name}</p>
                      <p className="truncate text-xs text-serenity-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => handleDropdownNavigation(e, getProfileLink())}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 cursor-pointer"
                    >
                      <i className="fas fa-user w-5 text-serenity-400" aria-hidden="true"></i>
                      My Profile
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => handleDropdownNavigation(e, getDashboardLink())}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-serenity-700 hover:bg-serenity-50 cursor-pointer"
                    >
                      <i className="fas fa-chart-line w-5 text-serenity-400" aria-hidden="true"></i>
                      {getRoleName()} Dashboard
                    </button>
                    <button
                      type="button"
                      onMouseDown={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-serenity-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
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
              onClick={onMenuClick || (() => setMobileMenuOpen(!mobileMenuOpen))}
              aria-label="Open navigation menu"
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus:outline-none cursor-pointer ${
                isScrolled 
                  ? 'text-serenity-700 hover:bg-serenity-100' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <i className="fas fa-bars text-lg" aria-hidden="true"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-full bg-white px-5 pt-20 pb-6 shadow-xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-serenity-600 text-white shadow-sm'
                        : 'text-serenity-700 hover:bg-serenity-50'
                    }`
                  }
                >
                  {link.label}
                  <span className="text-xs opacity-60">→</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}