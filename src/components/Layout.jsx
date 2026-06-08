import { Outlet, Link, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const location = useLocation()
  const isChatPage = location.pathname === '/chat'

  return (
    <div className={`bg-background text-on-surface ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col`} style={{ fontFamily: 'DM Sans' }}>
      <Header />
      <main className={isChatPage ? 'flex-1 flex overflow-hidden p-4 gap-4 bg-zinc-50' : 'flex-grow flex flex-col'}>
        <Outlet />
      </main>
      {!isChatPage && <Footer />}

      {/* Global Mobile FAB - visible only on mobile, and NOT on chat page */}
      {!isChatPage && (
        <Link 
          to="/chat"
          className="md:hidden fixed bottom-md right-md w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
          aria-label="Chat with AI Assistant"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>
            chat_bubble
          </span>
        </Link>
      )}
    </div>
  )
}
