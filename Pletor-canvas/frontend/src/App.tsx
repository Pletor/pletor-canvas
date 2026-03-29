import { useState } from 'react'
import AppHeader from './layout/AppHeader/AppHeader'
import AppSidebar from './layout/AppSidebar/AppSidebar'
import AppFooter from './layout/AppFooter/AppFooter'
import SettingsPage from './settings/SettingsPage/SettingsPage'
import CanvasPage from './canvas/CanvasPage/CanvasPage'
import './App.css'

function App() {
  const [activeMenu, setActiveMenu] = useState('project')
  const [view, setView] = useState<'settings' | 'canvas'>('settings')

  if (view === 'canvas') {
    return <CanvasPage onBack={() => setView('settings')} />
  }

  return (
    <div className="app-layout">
      <AppHeader onLaunch={() => setView('canvas')} />
      <main className="app-main">
        <AppSidebar activeMenu={activeMenu} onMenuSelect={setActiveMenu} />
        <SettingsPage activeMenu={activeMenu} />
      </main>
      <AppFooter />
    </div>
  )
}

export default App
