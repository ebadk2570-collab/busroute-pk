import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const navLinks = [
    { label: 'Routes', to: '/routes' },
    { label: 'Schedules', to: '/routes' },
    { label: 'Pricing', to: '/' },
    { label: 'AI Assistant', to: '/chat' },
  ]

  // Close drawer on route change or screen resize
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
      <nav className="flex justify-between items-center px-container-margin py-md max-w-7xl mx-auto w-full h-16">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 select-none transition-transform active:scale-95 duration-100" 
        >
          <img src="/logo.svg" alt="BusRoute PK Logo" className="h-9 w-auto" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-lg">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-label-md font-label-md py-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                style={{ fontSize: '14px', letterSpacing: '0.02em', fontWeight: isActive ? 700 : 500 }}
              >
                {link.label}
                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full transition-all duration-300" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Desktop Sign In Button */}
        <div className="hidden md:flex items-center">
          <button 
            className="bg-primary-container text-on-primary px-lg py-xs rounded-lg font-label-md text-label-md hover:bg-primary transition-all active:scale-95 duration-150 shadow-sm"
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            Sign In
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={isDrawerOpen}
        >
          <span className="material-symbols-outlined transition-transform duration-300" style={{ fontSize: '28px' }}>
            {isDrawerOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* Mobile Backdrop Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-45 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer Panel */}
      <div 
        className={`md:hidden fixed top-16 right-0 w-64 h-[calc(100vh-64px)] bg-surface border-l border-outline-variant/20 z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-lg flex flex-col gap-md">
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center px-md py-sm rounded-xl font-headline transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
                style={{ 
                  fontFamily: 'Plus Jakarta Sans', 
                  fontSize: '16px',
                  transitionDelay: isDrawerOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="p-lg border-t border-outline-variant/10 bg-surface-container-lowest">
          <button 
            className="w-full bg-primary-container text-on-primary py-md rounded-xl font-bold hover:bg-primary transition-all active:scale-95 duration-150 shadow-md"
            style={{ fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  )
}
