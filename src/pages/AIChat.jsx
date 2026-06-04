import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import routes from '../data/routes'
import RouteCard from '../components/RouteCard'

export default function AIChat() {
  // --- STATE ---
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('busroute_chat_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse chat history', e)
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Assalam-o-Alaikum! 🚌 Main BusRoute PK ka AI Assistant hoon. Main Karachi ke routes, schedules, stops, aur fares ke baare mein aapki madad kar sakta hoon.\n\nMujhse koi bhi sawal poochain, jaise:\n• NIPA se Tower jane ke liye kaunsi bus hai?\n• Green Line BRT ka fare aur timing kya hai?\n• Aeroport (Airport) jane wali buses ke naam batayein.\n• Pink Bus kis route par chalti hai?'
      }
    ]
  })
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null)

  // --- PERSIST HISTORY ---
  useEffect(() => {
    localStorage.setItem('busroute_chat_history', JSON.stringify(messages))
  }, [messages])

  // --- AUTO SCROLL ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // --- VIEWPORT RESIZE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])



  // --- SEND MESSAGE LOGIC ---
  const handleSend = async (textToSend) => {
    const queryText = textToSend || input
    if (!queryText.trim()) return

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // 1. Prepare clean data for the AI context (removing visual UI configurations to save tokens)
      const transitDataForAI = routes.map(r => ({
        id: r.id,
        routeNumber: r.routeNumber,
        name: r.name,
        origin: r.origin,
        destination: r.destination,
        operatorType: r.operatorType,
        serviceType: r.serviceType,
        category: r.category,
        stops: r.stops.map(s => s.label),
        freq: r.freq,
        fare: r.fare,
        tags: r.tags
      }))

      // 2. Build the System Instruction
      const systemInstruction = `You are the BusRoute PKsss AI Assistant, a highly knowledgeable and friendly transit expert for Karachi, Pakistan.
Your primary role is to help commuters plan their travels using the provided Karachi Smart Transit Dataset.

DATASET:
${JSON.stringify(transitDataForAI, null, 2)}

GUIDELINES:
1. LANGUAGE & TONE: Speak in a helpful, conversational, and welcoming Roman Urdu / Hinglish (a mix of Urdu and English written using English alphabet). Use expressions common to Karachiites (like 'Bhai', 'Chowrangi', 'Morr', 'Rider', 'Service'). Keep explanations neat and concise.
2. STRICT DATA GROUNDING: You must ONLY recommend routes, buses, fares, and stops that exist in the provided DATASET. Do not hallucinate or make up fake buses or route numbers. If a route or destination is not in the database, politely explain that it is currently not in your database and offer the nearest/best alternative route that DOES exist.
3. CITATION SYNTAX (CRITICAL): When you recommend or discuss a specific route, you MUST include a citation tag in the exact format: [ROUTE:route-id]
   For example:
   - If recommending Peoples Bus Service R-1, include: [ROUTE:pbs-r1]
   - If recommending Green Line BRT, include: [ROUTE:brt-green]
   - If recommending Private Mini Bus W-11, include: [ROUTE:w-11]
   - If recommending EV-1, include: [ROUTE:ev-1]
   Place the tag at the end of the sentence or on a new line. Only use valid ids from the dataset (e.g. pbs-r1, pbs-r2, ev-1, pink-1, brt-green, w-11, g-27). This allows our system to render the actual interactive transit card for that bus!
4. COMMUTING TIPS: Give helpful guidance about pricing (fixed vs distance-based), frequency, and which lines are air-conditioned (PBS, BRT, EV, Pink) vs non-air-conditioned (Private Mini Buses).`

      // 3. Construct chat history for the API call
      // We will skip the welcome message to avoid confusing the API, and format the rest
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))

      // Append current message
      chatHistory.push({
        role: 'user',
        parts: [{ text: queryText }]
      })

      // Helper function to call Gemini directly (for local fallback)
      const fetchDirectGemini = async () => {
        if (!apiKey) {
          throw new Error('Gemini API key is not configured in local environment variable (VITE_GEMINI_API_KEY).')
        }
        return fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: chatHistory,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1500
              }
            })
          }
        )
      }

      // 4. API Request
      let response;
      const isDev = import.meta.env.DEV;

      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: chatHistory,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          })
        });

        // If the backend API route is not found (404) or fails, try to fallback in development
        if (!response.ok) {
          if (isDev && apiKey) {
            console.warn('Backend API route failed or not found. Falling back to direct client-side Gemini API call.');
            response = await fetchDirectGemini();
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error ${response.status}`);
          }
        }
      } catch (err) {
        // If fetch failed completely (e.g. local server not running) and we are in dev, try fallback
        if (isDev && apiKey) {
          console.warn('Could not connect to /api/chat. Falling back to direct client-side Gemini API call:', err);
          response = await fetchDirectGemini();
        } else {
          throw err;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Kuch masla hua, please try again.'

      // Add AI message
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: responseText
        }
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Afsos! 🛠️ Response generate karte hue kuch masla pesh aya. \n\n*Error details:* ${error.message}\n\nPlease check your internet connection or verify your Gemini API key.`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // --- PARSE TEXT AND RENDER INLINE ROUTE CARDS ---
  const renderMessageContent = (text) => {
    // Matches patterns like [ROUTE:pbs-r1]
    const routeRegex = /(\[ROUTE:[a-zA-Z0-9-]+\])/g
    const parts = text.split(routeRegex)

    return parts.map((part, index) => {
      if (part.match(/^\[ROUTE:([a-zA-Z0-9-]+)\]$/)) {
        const routeId = part.replace(/^\[ROUTE:|\]$/g, '')
        const foundRoute = routes.find(r => r.id === routeId)
        
        if (foundRoute) {
          return (
            <div key={index} className="my-4 w-full max-w-md animate-fade-in">
              <RouteCard route={foundRoute} />
            </div>
          )
        }
        return null // If route not found in our list, hide it
      } else {
        // Render paragraphs and lists nicely
        return (
          <div key={index} className="whitespace-pre-wrap leading-relaxed text-on-surface" style={{ fontSize: '15px' }}>
            {part.split('\n').map((line, lIdx) => {
              // Format simple bold markdown **text**
              const boldRegex = /\*\*(.*?)\*\*/g
              const formattedLine = line.split(boldRegex).map((sub, sIdx) => {
                return sIdx % 2 === 1 ? <strong key={sIdx} className="font-extrabold text-primary">{sub}</strong> : sub
              })

              return (
                <p key={lIdx} className={line.trim() === '' ? 'h-3' : 'mb-2'}>
                  {formattedLine}
                </p>
              )
            })}
          </div>
        )
      }
    })
  }

  // --- RECENT / POPULAR DYNAMIC CLICKS ---
  const handleSidebarClick = (query) => {
    handleSend(query)
  }

  // --- CLEAR HISTORY ---
  const handleClearHistory = () => {
    if (window.confirm('Kya aap chat history delete karna chahte hain?')) {
      const defaultWelcome = [
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Assalam-o-Alaikum! 🚌 Main BusRoute PK ka AI Assistant hoon. Main Karachi ke routes, schedules, stops, aur fares ke baare mein aapki madad kar sakta hoon.\n\nMujhse koi bhi sawal poochain, jaise:\n• NIPA se Tower jane ke liye kaunsi bus hai?\n• Green Line BRT ka fare aur timing kya hai?\n• Aeroport (Airport) jane wali buses ke naam batayein.\n• Pink Bus kis route par chalti hai?'
        }
      ]
      setMessages(defaultWelcome)
      localStorage.removeItem('busroute_chat_history')
    }
  }

  return (
    <div 
      className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 grid grid-cols-1 md:grid-cols-12 gap-gutter bg-background" 
      style={{ height: `${viewportHeight - 180}px`, minHeight: '650px' }}
    >
      {/* Left: Chat Area */}
      <section 
        className="md:col-span-8 bg-white border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        
        {/* Chat Toolbar Header */}
        <div className="p-4 border-b border-outline-variant/25 flex justify-between items-center bg-surface-container-low select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined font-extrabold" style={{ fontSize: '24px' }}>smart_toy</span>
            </div>
            <div>
              <h2 className="text-on-surface font-headline font-bold text-base leading-tight">BusRoute PK AI</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-on-surface-variant text-[11px] font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            <button 
              onClick={handleClearHistory}
              className="p-2 border border-outline-variant/30 rounded-xl text-outline hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 flex items-center justify-center"
              title="Clear History"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
            </button>
          </div>
        </div>



        {/* Message Thread Box */}
        <div 
          className="p-6 space-y-6 scrollbar-thin bg-background/50" 
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {messages.map((message) => {
            const isUser = message.sender === 'user'
            
            return (
              <div 
                key={message.id} 
                className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Icon */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 shadow-sm border border-primary/10">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div 
                  className={`p-4 sm:p-5 rounded-2xl shadow-sm max-w-[85%] sm:max-w-xl break-words whitespace-pre-wrap transition-all duration-200 ${
                    isUser 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-white border border-outline-variant/30 text-on-surface rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: '15px' }}>
                      {message.text}
                    </p>
                  ) : (
                    renderMessageContent(message.text)
                  )}
                </div>

                {/* User Icon placeholder to balance margins */}
                {isUser && (
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-on-secondary flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Skeleton Pulse Loader */}
          {isLoading && (
            <div className="flex w-full gap-3 justify-start animate-pulse">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/10">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span>
              </div>
              <div className="bg-white border border-outline-variant/20 p-5 rounded-2xl rounded-tl-none shadow-sm w-full max-w-sm space-y-3">
                <div className="h-3.5 bg-outline-variant/20 rounded-full w-2/3" />
                <div className="h-3.5 bg-outline-variant/20 rounded-full w-5/6" />
                <div className="h-3.5 bg-outline-variant/20 rounded-full w-1/2" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips Panel */}
        <div className="px-6 py-3 border-t border-outline-variant/10 bg-white flex flex-wrap gap-2 select-none">
          {['BRT Green Line routes', 'Malir se Tower route', 'PBS R-1 vs R-2', 'Pink bus timings?'].map(chip => (
            <button 
              key={chip}
              onClick={() => handleSidebarClick(chip)}
              disabled={isLoading}
              className="bg-surface-container-lowest border border-outline-variant/35 px-4 py-2 rounded-full text-on-surface hover:bg-primary-container hover:text-on-primary-container hover:border-transparent active:scale-95 transition-all duration-200 select-none text-[13px] font-semibold"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Text Input Field */}
        <div className="p-4 border-t border-outline-variant/20 bg-white flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend()
              }
            }}
            disabled={isLoading}
            className="flex-grow bg-surface-container-low border border-outline-variant/20 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface font-medium"
            placeholder="Yahan poochain (e.g. NIPA se Saddar jane ki bus...)"
            style={{ fontSize: '15px' }}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-primary text-on-primary p-3.5 rounded-2xl hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex items-center justify-center shadow-md shadow-primary/10 grow-0 shrink-0"
          >
            <span className="material-symbols-outlined font-extrabold" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>send</span>
          </button>
        </div>
      </section>

      {/* Right Sidebar */}
      <aside className="md:col-span-4 space-y-6 h-full overflow-y-auto pr-1 scrollbar-thin hidden md:block">
        
        {/* Recent Searches (Now interactive!) */}
        <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm select-none">
          <div className="p-4 border-b border-outline-variant/25 flex justify-between items-center bg-surface-container-low">
            <h2 className="text-on-surface font-headline font-bold text-base leading-tight">Quick Routes</h2>
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>history</span>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {[
              { title: 'Malir to Tower', desc: 'Find Peoples Bus & EV options' },
              { title: 'Surjani Town to Numaish', desc: 'Green Line BRT fast track route' },
              { title: 'Model Colony to Dockyard', desc: 'PBS Red Bus R-1 details' },
            ].map(item => (
              <button 
                key={item.title} 
                onClick={() => handleSidebarClick(`${item.title}`)}
                disabled={isLoading}
                className="w-full p-4 flex items-start gap-3 hover:bg-surface-container-low transition-colors text-left group disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors mt-0.5" style={{ fontSize: '20px' }}>location_on</span>
                <div className="flex-grow">
                  <p className="text-on-surface font-extrabold text-sm group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 leading-normal">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Destinations (Now interactive!) */}
        <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm select-none">
          <div className="p-4 border-b border-outline-variant/25 bg-surface-container-low">
            <h2 className="text-on-surface font-headline font-bold text-base leading-tight">Popular Stops</h2>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            {[
              { name: 'NIPA Chowrangi', routes: 'Malir Cantt, Tower, Indus Hospital', color: '#1a6b3c' },
              { name: 'Saddar / Tower', routes: 'Model Colony, Power House, Malir Cantt', color: '#005129' },
            ].map(dest => (
              <div 
                key={dest.name}
                onClick={() => handleSidebarClick(`${dest.name} ke routes`)}
                className="relative h-24 rounded-xl overflow-hidden group cursor-pointer flex items-end p-4 border border-outline-variant/10 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-98"
                style={{ background: `linear-gradient(135deg, ${dest.color}, #00381a)` }}
              >
                <div className="absolute inset-0 bus-pattern opacity-10" />
                <div className="relative z-10">
                  <p className="text-white font-bold text-sm leading-tight">{dest.name}</p>
                  <p className="text-white/80 text-[11px] mt-1 leading-snug font-medium">Buses: {dest.routes}</p>
                </div>
                <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Promo Card */}
        <div className="bg-primary-container p-6 rounded-2xl text-on-primary shadow-lg relative overflow-hidden select-none border border-primary/20">
          <div className="relative z-10">
            <h3 className="font-headline font-bold mb-2 text-lg leading-tight">Travel Greener 🌿</h3>
            <p className="opacity-90 mb-4 text-xs leading-relaxed">
              Use the new Green Line BRT and Electric EV Buses for a faster, eco-friendly, and silent commute across Karachi.
            </p>
            <button 
              onClick={() => handleSidebarClick('Green Line BRT aur EV bus routes ke baare mein bataayein')}
              className="bg-white text-primary font-bold px-4 py-2 rounded-xl text-xs hover:bg-opacity-95 transition-all shadow-md active:scale-95"
            >
              Ask AI about EV/BRT
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-on-primary/10 rounded-full blur-2xl animate-pulse" />
        </div>
      </aside>
    </div>
  )
}
