import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext"
import logoFull from '../assets/logo-full-hori.png'
import logoMark from '../assets/logo-mark.png'

export default function Navbar({ onMenuClick }) {
  // Track open profile dropdown by ID ('inner', 'outer', 'mobile', or null)
  const [activeProfileMenu, setActiveProfileMenu] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const desktopInnerProfileRef = useRef(null)
  const desktopOuterProfileRef = useRef(null)
  const mobileProfileRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Handle click outside to close active dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      const isOutsideInner = desktopInnerProfileRef.current && !desktopInnerProfileRef.current.contains(event.target)
      const isOutsideOuter = desktopOuterProfileRef.current && !desktopOuterProfileRef.current.contains(event.target)
      const isOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)

      if (isOutsideInner && isOutsideOuter && isOutsideMobile) {
        setActiveProfileMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleProfileMenu = (menuId) => {
    setActiveProfileMenu((prev) => (prev === menuId ? null : menuId))
  }

  const handleLogout = async (e) => {
    e.stopPropagation()
    try {
      setActiveProfileMenu(null)
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleDropdownNavigation = (path) => {
    setActiveProfileMenu(null)
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
      {/* Full-width fixed header container with non-rounded full edges */}
      <header className={`sticky top-0 z-50 h-16 w-full transition-all duration-300 rounded-none ${
        isScrolled 
          ? 'glass-panel shadow-md' 
          : 'glass-panel'
      }`}>
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Outer Left Logo - Fades out on scroll */}
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

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center shrink-0">
            <Link to="/" className="flex items-center cursor-pointer">
              <img 
                src={logoMark} 
                alt="OncoCare" 
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Central Pill Floating Navigation Container */}
          <div className="glass-panel hidden items-center gap-2 rounded-full p-1.5 shadow-md md:flex">
            
            {/* Inner Logo Mark - Appears on scroll */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${
              isScrolled 
                ? 'max-w-[50px] opacity-100 pl-2 pr-1 translate-x-0' 
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

            {/* Core Links */}
            <div className="flex items-center gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm'
                        : 'text-ink-700 hover:bg-surface/70 hover:text-ink-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Inner Profile Dropdown Toggle - Appears inside central pill on scroll */}
            <div className={`transition-all duration-300 ease-in-out flex items-center ${
              isScrolled 
                ? 'max-w-[200px] opacity-100 pl-1 translate-x-0' 
                : 'max-w-0 opacity-0 p-0 translate-x-2 pointer-events-none overflow-hidden'
            }`}>
              {user ? (
                <div className="relative" ref={desktopInnerProfileRef}>
                  <button
                    type="button"
                    onClick={() => toggleProfileMenu('inner')}
                    className="flex items-center gap-2 rounded-full px-2 py-1 text-ink-700 transition-colors hover:bg-surface/70 focus:outline-none"
                  >
                    <div className="relative">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-8 w-8 rounded-full object-cover border border-serenity-200" 
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ice-100">
                          <i className={`fas ${getRoleIcon()} text-ink-700 text-xs`}></i>
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
                    </div>
                    <i className={`fas fa-chevron-down text-serenity-400 text-xs transition-transform ${activeProfileMenu === 'inner' ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Inner Dropdown Menu */}
                  {activeProfileMenu === 'inner' && (
                    <div className="glass-panel-solid absolute right-0 z-50 mt-3 w-56 rounded-xl py-2 shadow-xl">
                      <div className="border-b border-hairline/70 px-4 py-3">
                        <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                        <p className="truncate text-xs text-ink-400">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDropdownNavigation(getProfileLink())}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ice-100 cursor-pointer"
                      >
                        <i className="fas fa-user w-5 text-ink-400"></i>
                        My Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDropdownNavigation(getDashboardLink())}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ice-100 cursor-pointer"
                      >
                        <i className="fas fa-chart-line w-5 text-ink-400"></i>
                        {getRoleName()} Dashboard
                      </button>
                      <div className="mt-2 border-t border-hairline/70 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
                        >
                          <i className="fas fa-sign-out-alt w-5 text-rose-400"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink 
                  to="/login" 
                  className="flex whitespace-nowrap items-center gap-1.5 rounded-full bg-serenity-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-serenity-700 cursor-pointer"
                >
                  Log in
                  <span>→</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* Outer Right Action Container - Fades out on scroll */}
          <div className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
            isScrolled 
              ? 'opacity-0 translate-x-6 pointer-events-none scale-95 max-w-0 overflow-hidden' 
              : 'opacity-100 translate-x-0 scale-100'
          }`}>
            {user ? (
              <div className="relative" ref={desktopOuterProfileRef}>
                <button
                  type="button"
                  onClick={() => toggleProfileMenu('outer')}
                  className="flex items-center gap-2 rounded-full px-2 py-1 text-ink-700 transition-colors hover:bg-surface/70 focus:outline-none"
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover border-2 border-white/40" 
                      />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ice-100">
                          <i className={`fas ${getRoleIcon()} text-ink-700`}></i>
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-ink-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-ink-400">{getRoleName()}</p>
                  </div>
                  <i className={`fas fa-chevron-down text-ink-400 text-xs transition-transform ${activeProfileMenu === 'outer' ? 'rotate-180' : ''}`}></i>
                </button>

                {/* Outer Dropdown Menu */}
                {activeProfileMenu === 'outer' && (
                  <div className="glass-panel-solid absolute right-0 z-50 mt-3 w-56 rounded-xl py-2 shadow-xl">
                    <div className="border-b border-hairline/70 px-4 py-3">
                      <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                      <p className="truncate text-xs text-ink-400">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDropdownNavigation(getProfileLink())}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ice-100 cursor-pointer"
                    >
                      <i className="fas fa-user w-5 text-ink-400"></i>
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDropdownNavigation(getDashboardLink())}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ice-100 cursor-pointer"
                    >
                      <i className="fas fa-chart-line w-5 text-ink-400"></i>
                      {getRoleName()} Dashboard
                    </button>
                    <div className="mt-2 border-t border-hairline/70 pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
                      >
                        <i className="fas fa-sign-out-alt w-5 text-rose-400"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>

          {/* Mobile Profile Toggle & Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  type="button"
                  onClick={() => toggleProfileMenu('mobile')}
                  aria-label="Open profile menu"
                  aria-expanded={activeProfileMenu === 'mobile'}
                  className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 focus:outline-none cursor-pointer ${
                    'border-hairline bg-surface/60 text-ink-700 backdrop-blur-sm hover:bg-surface/80'
                  }`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <i className={`fas ${getRoleIcon()}`} aria-hidden="true"></i>
                  )}
                </button>

                {/* Mobile Dropdown */}
                {activeProfileMenu === 'mobile' && (
                  <div className="glass-panel-solid absolute right-0 top-12 z-50 w-56 rounded-xl py-2 shadow-xl">
                    <div className="border-b border-hairline/70 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                      <p className="truncate text-xs text-ink-400">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDropdownNavigation(getProfileLink())}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ice-100 cursor-pointer"
                    >
                      <i className="fas fa-user w-5 text-ink-400" aria-hidden="true"></i>
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDropdownNavigation(getDashboardLink())}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ice-100 cursor-pointer"
                    >
                      <i className="fas fa-chart-line w-5 text-ink-400" aria-hidden="true"></i>
                      {getRoleName()} Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-hairline/70 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <i className="fas fa-sign-out-alt w-5 text-rose-400" aria-hidden="true"></i>
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
                  'text-ink-700 hover:bg-surface/70'
              }`}
            >
              <i className="fas fa-bars text-lg" aria-hidden="true"></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="glass-panel-solid relative z-50 w-full px-5 pb-6 pt-20 shadow-xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm'
                        : 'text-ink-700 hover:bg-ice-100'
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