import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import routes from '../data/routes'
import RouteCard from '../components/RouteCard'

// ==========================================
// 1. Helper Icons
// ==========================================
const getFilterIcon = (filterId) => {
  switch (filterId) {
    case 'all': return 'dashboard'
    case 'government': return 'account_balance'
    case 'private': return 'hail'
    case 'brt': return 'train'
    case 'pbs': return 'directions_bus'
    case 'ev': return 'bolt'
    case 'double_decker': return 'layers'
    case 'pink_bus': return 'female'
    default: return 'filter_list'
  }
}

// ==========================================
// Reusable Component: SearchBar (Debounced)
// ==========================================
function SearchBar({ onSearchChange }) {
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch)
    }, 250) // 250ms highly responsive debounce
    return () => clearTimeout(handler)
  }, [localSearch, onSearchChange])

  return (
    <div className="relative w-full max-w-2xl">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">
        search
      </span>
      <input
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-on-surface placeholder:text-on-surface-variant/50"
        placeholder="Search bus route, stop, tag, e.g. 'EV', 'Red Bus', 'NIPA'..."
        style={{ fontSize: '16px' }}
      />
      {localSearch && (
        <button
          onClick={() => setLocalSearch('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors focus:outline-none"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>
      )}
    </div>
  )
}

// ==========================================
// Reusable Component: FilterChips
// ==========================================
function FilterChips({ activeFilter, onFilterSelect }) {
  const filterCategories = [
    { label: 'All Routes', id: 'all' },
    { label: 'Government', id: 'government' },
    { label: 'Private', id: 'private' },
    { label: 'PBS Red Buses', id: 'pbs' },
    { label: 'EV Buses', id: 'ev' },
    { label: 'Pink Bus', id: 'pink_bus' },
    { label: 'BRT', id: 'brt' },
    { label: 'Double Decker', id: 'double_decker' }
  ]

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <span className="text-on-surface-variant uppercase tracking-wider text-[11px] font-bold select-none lg:mt-0.5">
        Filter By:
      </span>
      
      {/* Horizontally scrollable container on mobile, wraps on desktop */}
      <div className="w-full flex overflow-x-auto whitespace-nowrap pb-2 lg:pb-0 gap-2.5 scrollbar-thin select-none">
        {filterCategories.map((f) => {
          const isActive = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => onFilterSelect(f.id)}
              className={`px-5 py-2.5 rounded-full font-bold flex items-center gap-1.5 border transition-all active:scale-95 duration-200 ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20 scale-102'
                  : 'bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high hover:border-outline-variant'
              }`}
              style={{ fontSize: '13px' }}
            >
              <span className="material-symbols-outlined animate-pulse-subtle" style={{ fontSize: '18px' }}>
                {getFilterIcon(f.id)}
              </span>
              {f.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ==========================================
// RouteCard and related timeline sub-components are now 
// imported from src/components/RouteCard.jsx
// ==========================================

// ==========================================
// Reusable Component: EmptyState
// ==========================================
function EmptyState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-outline-variant/20 rounded-3xl p-8 max-w-xl mx-auto shadow-sm animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-outline text-5xl">directions_bus</span>
      </div>
      <h3 className="text-primary font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '24px' }}>
        Koi Bus Route Nahi Mila
      </h3>
      <p className="text-on-surface-variant/80 mb-6 text-sm leading-relaxed">
        Hamein "{query}" ke liye koi result nahi mila. Please check the spelling, or try searching for major hubs like <strong>"NIPA"</strong>, <strong>"Saddar"</strong>, operator types like <strong>"Government"</strong>, or categories like <strong>"EV"</strong>.
      </p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-md hover:opacity-90"
        style={{ fontSize: '14px' }}
      >
        Clear Filters & Search
      </button>
    </div>
  )
}

// ==========================================
// Main Component: RoutesDirectory
// ==========================================
export default function RoutesDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Real-time compound filtering and matching logic
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      // 1. Filter selection matching
      if (activeFilter !== 'all') {
        if (activeFilter === 'government' && route.operatorType !== 'government') return false
        if (activeFilter === 'private' && route.operatorType !== 'private') return false
        if (activeFilter === 'brt' && route.serviceType !== 'BRT') return false
        if (activeFilter === 'pbs' && route.serviceType !== 'PBS') return false
        if (activeFilter === 'ev' && route.serviceType !== 'EV') return false
        if (activeFilter === 'double_decker' && route.serviceType !== 'Double Decker') return false
        if (activeFilter === 'pink_bus' && route.serviceType !== 'Pink Bus') return false
      }

      // 2. Search query matching
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        
        // Primary index check (tags)
        const matchTags = route.tags.some((tag) => tag.toLowerCase().includes(q))
        
        // Deep properties checks
        const matchNumber = route.routeNumber.toLowerCase().includes(q)
        const matchName = route.name.toLowerCase().includes(q)
        const matchOrigin = route.origin.toLowerCase().includes(q)
        const matchDestination = route.destination.toLowerCase().includes(q)
        const matchCategory = route.category.toLowerCase().includes(q)
        const matchService = route.serviceType.toLowerCase().includes(q)
        const matchOperator = route.operatorType.toLowerCase().includes(q)
        const matchStops = route.stops.some((stop) => stop.label.toLowerCase().includes(q))

        return matchTags || matchNumber || matchName || matchOrigin || matchDestination || matchStops || matchCategory || matchService || matchOperator
      }

      return true
    })
  }, [activeFilter, searchQuery])

  const handleClearAll = () => {
    setSearchQuery('')
    setActiveFilter('all')
    const inputEl = document.querySelector('input')
    if (inputEl) inputEl.value = ''
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 w-full">
      {/* Header and subtitle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-8">
        <div>
          <h1 className="font-bold text-on-surface leading-tight tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px' }}>
            Smart Transit Discovery
          </h1>
          <p className="text-on-surface-variant mt-1 animate-fade-in" style={{ fontSize: '15px' }}>
            Karachi's modern transport search engine. Track schedules, stops, and fares across {routes.length} transit lines in real-time.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-bold select-none border border-primary/10 hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>map</span>
          Transit Hub Map
        </div>
      </div>

      {/* Search & Filter section */}
      <section className="mb-10 flex flex-col gap-6 bg-white border border-outline-variant/15 p-6 rounded-2xl shadow-sm custom-shadow">
        <SearchBar onSearchChange={setSearchQuery} />
        <FilterChips activeFilter={activeFilter} onFilterSelect={setActiveFilter} />
      </section>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-on-surface font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
          {filteredRoutes.length === 0 ? 'No Routes Match' : `Showing ${filteredRoutes.length} Active Routes`}
        </h2>
        {filteredRoutes.length < routes.length && (
          <button
            onClick={handleClearAll}
            className="text-primary font-bold text-xs hover:underline flex items-center gap-0.5 border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Grid / Layout transitions */}
      {filteredRoutes.length === 0 ? (
        <EmptyState query={searchQuery} onClear={handleClearAll} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
          {filteredRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}

      {/* Bottom Informative CTA card */}
      <div className="mt-16 flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 bg-surface-container-low rounded-3xl border border-outline-variant/20 overflow-hidden relative custom-shadow">
        <div className="flex-1 z-10">
          <h2 className="font-bold text-on-surface mb-3" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '28px' }}>
            Don't see your regular route?
          </h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed max-w-xl" style={{ fontSize: '15px' }}>
            Our smart transport discovery system is continuously updated with the latest bus frequencies, stops, and fare charts from both public departments and private operators. Ask our AI Assistant for custom route queries.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all shadow-md hover:bg-primary-container"
            style={{ fontSize: '15px', fontFamily: 'Plus Jakarta Sans' }}
          >
            <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Ask AI Assistant
          </Link>
        </div>
        <div className="w-full md:w-1/4 aspect-square bg-surface-container rounded-2xl flex items-center justify-center text-outline-variant border border-outline-variant/20 shadow-inner shrink-0 relative overflow-hidden group">
          <span className="material-symbols-outlined text-outline-variant group-hover:scale-110 transition-transform duration-500" style={{ fontSize: '80px' }}>
            directions_bus
          </span>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </main>
  )
}
