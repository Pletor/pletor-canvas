import { useState } from 'react'
import { Header, Sidebar, Footer } from './components/layout'
import { SettingsPage, CanvasPage } from './pages'
import './App.css'

function App() {
  const [activeMenu, setActiveMenu] = useState('project')
  const [view, setView] = useState<'settings' | 'canvas'>('settings')

  if (view === 'canvas') {
    return <CanvasPage onBack={() => setView('settings')} />
  }

  return (
    <div className="app-layout">
      <Header onLaunch={() => setView('canvas')} />
      <main className="app-main">
        <Sidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <SettingsPage activeMenu={activeMenu} />
      </main>
      <Footer />
    </div>
  )
}

export default App
