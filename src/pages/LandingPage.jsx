import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

function AnimatedCounter({ endValue, duration }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const stepTime = Math.max(Math.floor(duration / endValue), 10)
          
          const timer = setInterval(() => {
            start += Math.ceil(endValue / (duration / stepTime))
            if (start >= endValue) {
              setCount(endValue)
              clearInterval(timer)
            } else {
              setCount(start)
            }
          }, stepTime)
          
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [endValue, duration, hasAnimated])

  return (
    <span ref={elementRef} className="font-bold" style={{ color: '#fcaf21', fontSize: '24px', fontFamily: 'Plus Jakarta Sans' }}>
      {count}+
    </span>
  )
}

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>

      {/* Hero */}
      <section className="relative w-full overflow-hidden py-xl md:py-32 flex flex-col items-center justify-center text-center px-container-margin"
        style={{ background: 'linear-gradient(to bottom, #005129, #00381a)' }}>
        <div className="absolute inset-0 bus-pattern opacity-30" />
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-on-primary font-bold leading-tight mb-md"
            style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 'clamp(24px, 5vw, 48px)', letterSpacing: '-0.02em' }}>
            Karachi Ki Bus, <br />
            <span style={{ color: '#fcaf21' }}>Ab Smart Ho Gayi</span>
          </h1>
          <p className="text-on-primary/80 mb-xl max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Discover the easiest way to navigate Karachi's transit network. AI-powered route planning, live schedules, and fare estimates tailored for you.
          </p>
          <div className="glass-panel p-md rounded-xl flex flex-col md:flex-row gap-md items-center w-full max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-primary/60">search</span>
              <input
                className="w-full bg-transparent border-none text-on-primary placeholder:text-on-primary/50 pl-xl focus:ring-0"
                placeholder="Kahan jaana hai aapko?"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="flex gap-sm w-full md:w-auto">
              <Link to="/chat"
                className="bg-secondary-container text-on-secondary-container px-lg py-md rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center gap-xs flex-1 md:flex-none"
                style={{ fontSize: '20px', fontFamily: 'Plus Jakarta Sans' }}>
                <span className="material-symbols-outlined">auto_awesome</span>
                AI Se Poochho
              </Link>
              <Link to="/routes"
                className="border border-on-primary text-on-primary px-lg py-md rounded-lg font-bold hover:bg-white/10 transition-all flex-1 md:flex-none text-center"
                style={{ fontSize: '20px', fontFamily: 'Plus Jakarta Sans' }}>
                Routes Dekhein
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="py-lg" style={{ backgroundColor: '#00381a' }}>
        <div className="max-w-7xl mx-auto px-container-margin grid grid-cols-2 md:grid-cols-4 gap-lg items-center divide-x-0 md:divide-x divide-white/10">
          <div className="flex flex-col items-center text-center">
            <AnimatedCounter endValue={150} duration={1500} />
            <span className="text-on-primary/60" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>Routes</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <AnimatedCounter endValue={800} duration={1500} />
            <span className="text-on-primary/60" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>Stops</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold" style={{ color: '#fcaf21', fontSize: '24px', fontFamily: 'Plus Jakarta Sans' }}>AI Powered</span>
            <span className="text-on-primary/60" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>Navigation</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-bold" style={{ color: '#fcaf21', fontSize: '24px', fontFamily: 'Plus Jakarta Sans' }}>Free Forever</span>
            <span className="text-on-primary/60" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>No Hidden Fees</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-container-margin">
          <div className="text-center mb-24 reveal">
            <h2 className="text-primary font-bold mb-md" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px' }}>
              Bus Ka Safar, Teen Simple Steps Mein
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Reliable public transport information, simplified with artificial intelligence for every Karachiite.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { num: '1', icon: 'location_on', title: 'Apni Location Batao', desc: 'Just type where you are and where you want to go. Or let AI detect your current stop.', delay: '100ms' },
              { num: '2', icon: 'psychology', title: 'AI Route Suggest Karta Hai', desc: 'Our smart engine calculates the fastest route, including transfers and walk times.', delay: '200ms' },
              { num: '3', icon: 'directions_bus', title: 'Bus Pakdo Paisa Bachao', desc: 'Get real-time frequency info and fare details. Reach your destination without the hassle.', delay: '300ms' },
            ].map(step => (
              <div key={step.num} className="bg-white p-lg rounded-xl custom-shadow flex flex-col items-center text-center reveal"
                style={{ transitionDelay: step.delay }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-lg" style={{ background: 'rgba(252,175,33,0.1)' }}>
                  <span className="font-bold" style={{ color: '#fcaf21', fontSize: '32px', fontFamily: 'Plus Jakarta Sans' }}>{step.num}</span>
                </div>
                <span className="material-symbols-outlined text-primary mb-md" style={{ fontSize: '36px' }}>{step.icon}</span>
                <h3 className="text-primary font-semibold mb-sm" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>{step.title}</h3>
                <p className="text-on-surface-variant" style={{ fontSize: '14px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Preview */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-container-margin grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="rounded-3xl p-lg custom-shadow relative min-h-96 flex flex-col reveal" style={{ backgroundColor: '#005129' }}>
            <div className="flex items-center gap-sm mb-xl border-b border-white/10 pb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">smart_toy</span>
              </div>
              <div className="text-on-primary">
                <div className="font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>BusRoute AI</div>
                <div className="opacity-60" style={{ fontSize: '10px' }}>Always Online</div>
              </div>
            </div>
            <div className="space-y-md flex-1">
              <div className="flex justify-end">
                <div className="text-on-primary-container px-md py-sm rounded-2xl rounded-tr-none max-w-xs" style={{ backgroundColor: '#005129', border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', color: '#7dc390' }}>
                  Saddar se Gulshan janay k liye kaunsi bus best hai?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="glass-panel text-on-primary px-md py-sm rounded-2xl rounded-tl-none max-w-xs" style={{ fontSize: '14px' }}>
                  Gulshan-e-Iqbal k liye aap <strong>7-C</strong> ya <strong>G-27</strong> le saktay hain. 7-C Saddar Stop se har 10 min baad milti hai.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="glass-panel text-on-primary px-md py-sm rounded-2xl rounded-tl-none flex gap-xs items-center">
                  {[0, 0.2, 0.4].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="reveal">
            <h2 className="text-primary font-bold mb-md" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px' }}>
              Poochho Kuch Bhi, <br />AI Jawab Dega
            </h2>
            <p className="text-on-surface-variant mb-xl" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              Our Urdu-optimized AI understands local slang and specific Karachi landmarks. No more confusing maps—just ask like you would ask a friend.
            </p>
            <Link to="/chat"
              className="inline-block bg-secondary-container text-on-secondary-container px-xl py-md rounded-lg font-bold hover:scale-105 transition-transform"
              style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>
              Start Chatting Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Routes */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-container-margin">
          <div className="flex justify-between items-end mb-xl reveal">
            <div>
              <h2 className="text-primary font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px' }}>Mashhoor Routes</h2>
              <p className="text-on-surface-variant">Karachi's most traveled bus paths</p>
            </div>
            <Link to="/routes" className="text-primary font-semibold text-sm flex items-center gap-xs hover:underline">
              View All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              { num: '7-C', op: 'Local Operator', title: 'Saddar to Gulshan', stops: ['Empress Market', 'NIPA Chowrangi'], freq: 'Every 15 min', fare: 'Rs. 50-80', delay: '100ms' },
              { num: 'G-27', op: 'Local Operator', title: 'Tower to Quaidabad', stops: ['Merewether Tower', 'Malir Halt'], freq: 'Every 10 min', fare: 'Rs. 40-100', delay: '200ms' },
              { num: 'Peoples Bus', op: 'Government', title: 'Model Colony to Dockyard', stops: ['Airport', 'I.I Chundrigar'], freq: 'Every 20 min', fare: 'Rs. 50 Fixed', delay: '300ms' },
              { num: 'W-11', op: 'Local Operator', title: 'North Karachi to Kemari', stops: ['UP More', 'Kemari Port'], freq: 'Every 12 min', fare: 'Rs. 30-70', delay: '400ms' },
            ].map(route => (
              <div key={route.num}
                className="bg-white p-md rounded-xl custom-shadow hover:-translate-y-2 hover:border-l-4 border-primary-container transition-all reveal"
                style={{ transitionDelay: route.delay }}>
                <div className="flex justify-between items-start mb-md">
                  <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded font-bold" style={{ fontSize: '12px' }}>{route.num}</span>
                  <span className="text-on-surface-variant" style={{ fontSize: '12px' }}>{route.op}</span>
                </div>
                <h4 className="text-primary font-semibold mb-lg" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>{route.title}</h4>
                <div className="route-dot-line space-y-lg mb-lg">
                  {route.stops.map(stop => (
                    <div key={stop} className="flex items-center gap-md relative">
                      <span className="w-4 h-4 rounded-full border-4 border-secondary-container bg-white z-10" />
                      <span className="font-medium" style={{ fontSize: '14px' }}>{stop}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-md border-t border-surface-variant flex justify-between" style={{ fontSize: '12px' }}>
                  <span className="text-on-surface-variant">{route.freq}</span>
                  <span className="text-primary font-bold">{route.fare}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-container-margin">
          <h2 className="text-primary font-bold text-center mb-24 reveal" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '32px' }}>Hamari Khusoosiyat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {[
              { icon: 'translate', title: 'AI in Urdu & English', desc: 'Talk to us in Roman Urdu or proper English. We understand "Kahan hai?" as much as "Where is the bus?".', delay: '0ms' },
              { icon: 'map', title: 'Detailed Stop Maps', desc: 'High-precision data for every small bus stop from Surjani to Clifton. Never miss a stop again.', delay: '100ms' },
              { icon: 'payments', title: 'Fare Comparison', desc: 'Compare fares between different routes and operators to find the most economical way home.', delay: '200ms' },
              { icon: 'update', title: 'Live Frequency Info', desc: 'Real-time crowdsourced updates on bus timings. No more long waits at the bus stop.', delay: '300ms' },
            ].map(f => (
              <div key={f.title} className="flex gap-lg items-start reveal" style={{ transitionDelay: f.delay }}>
                <div className="w-16 h-16 shrink-0 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{f.icon}</span>
                </div>
                <div>
                  <h3 className="text-primary font-semibold mb-xs" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px' }}>{f.title}</h3>
                  <p className="text-on-surface-variant" style={{ fontSize: '14px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xl">
        <div className="max-w-7xl mx-auto px-container-margin">
          <div className="rounded-3xl p-xl md:p-24 text-center relative overflow-hidden reveal" style={{ backgroundColor: '#005129' }}>
            <div className="absolute inset-0 bus-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-on-primary font-bold mb-xl" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 'clamp(28px, 4vw, 48px)' }}>
                Abhi Try Karo — Koi Sign Up <br />Nahi Chahiye
              </h2>
              <Link to="/chat"
                className="inline-block bg-secondary-container text-on-secondary-container px-2xl py-lg rounded-xl font-bold hover:scale-105 transition-transform shadow-xl"
                style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '24px' }}>
                Start Your Journey
              </Link>
              <p className="mt-lg text-on-primary/60" style={{ fontSize: '14px' }}>It's 100% free for everyone in Karachi.</p>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
