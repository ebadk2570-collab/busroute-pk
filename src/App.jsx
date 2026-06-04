import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import RoutesDirectory from './pages/RoutesDirectory.jsx'
import AIChat from './pages/AIChat.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/routes" element={<RoutesDirectory />} />
          <Route path="/chat" element={<AIChat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

