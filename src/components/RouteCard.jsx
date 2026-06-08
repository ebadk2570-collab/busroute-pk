import React from 'react'

// ==========================================
// 1. Icon Mapper
// ==========================================
export const getServiceIcon = (serviceType) => {
  switch (serviceType) {
    case 'PBS':
      return 'directions_bus'
    case 'EV':
      return 'bolt'
    case 'Pink Bus':
      return 'female'
    case 'Double Decker':
      return 'layers'
    case 'BRT':
      return 'train'
    case 'Private':
      return 'hail'
    default:
      return 'directions_bus'
  }
}

// ==========================================
// Helper StopDot component
// ==========================================
export function StopDot({ type, color }) {
  if (type === 'mid') return <div className="absolute left-1 w-2 h-2 rounded-full bg-outline-variant" />
  return (
    <div
      className="absolute left-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest"
      style={{ backgroundColor: color || (type === 'start' ? '#005129' : '#ba1a1a') }}
    />
  )
}

// ==========================================
// Reusable Component: RouteMetaInfo
// ==========================================
export function RouteMetaInfo({ freq, fare }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 mt-auto">
      <div>
        <p className="text-on-surface-variant uppercase tracking-wider" style={{ fontSize: '10px', fontWeight: 600 }}>
          Frequency
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-on-surface">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>schedule</span>
          <span className="font-medium" style={{ fontSize: '13px' }}>{freq}</span>
        </div>
      </div>
      <div>
        <p className="text-on-surface-variant uppercase tracking-wider" style={{ fontSize: '10px', fontWeight: 600 }}>
          Fare Range
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-on-surface">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>payments</span>
          <span className="font-bold text-primary" style={{ fontSize: '13px' }}>{fare}</span>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Reusable Component: RouteCard
// ==========================================
export default function RouteCard({ route }) {
  if (!route) return null

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group animate-fade-in custom-shadow h-full w-full text-left">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-3 py-1 rounded-xl font-extrabold ${route.numBg} ${route.numText} shadow-sm`}
            style={{ fontSize: '20px', fontFamily: 'Plus Jakarta Sans', ...route.numStyle }}
          >
            {route.routeNumber}
          </div>
          <span
            className="px-2.5 py-1 rounded-lg uppercase tracking-wider border font-bold flex items-center gap-1"
            style={{
              fontSize: '11px',
              backgroundColor: route.badgeColor?.bg || '#f2f4f0',
              color: route.badgeColor?.text || '#1a1c1a',
              borderColor: route.badgeColor?.border || 'rgba(0,0,0,0.1)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {getServiceIcon(route.serviceType)}
            </span>
            {route.category}
          </span>
        </div>

        {/* Route Title */}
        <h3 className="text-on-surface mb-3 font-bold group-hover:text-primary transition-colors leading-snug" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '17px' }}>
          {route.name}
        </h3>

        {/* Origin to Destination Banner */}
        <div className="flex items-center gap-2 mb-4 bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/10">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Origin</p>
            <p className="font-bold text-xs truncate text-on-surface">{route.origin}</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-base select-none">arrow_forward</span>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Destination</p>
            <p className="font-bold text-xs truncate text-on-surface">{route.destination}</p>
          </div>
        </div>

        {/* Timeline Stop Label Tracker */}
        <div className="relative py-2 mb-4">
          <div className="absolute left-2 top-4 bottom-4 w-0.5 timeline-line" />
          <div className="flex flex-col gap-2.5">
            {route.stops?.map((stop, i) => (
              <div key={stop.label + i} className="flex items-center gap-4 pl-6 relative">
                <StopDot type={stop.type} color={stop.color} />
                <span
                  className={stop.type === 'mid' ? 'text-on-surface-variant font-medium' : 'text-on-surface font-extrabold'}
                  style={{ fontSize: stop.type === 'mid' ? '12px' : '13px' }}
                >
                  {stop.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meta details */}
      <RouteMetaInfo freq={route.freq} fare={route.fare} />
    </div>
  )
}
