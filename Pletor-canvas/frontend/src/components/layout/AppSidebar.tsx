import { MENU_ITEMS } from '../../data/appMenuItems'
import './AppSidebar.css'

interface AppSidebarProps {
  activeMenu: string
  onMenuSelect: (id: string) => void
}

function AppSidebar({ activeMenu, onMenuSelect }: AppSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-icons">
        <button className="sidebar-icon-btn sidebar-icon-add" aria-label="Přidat">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="1.5" />
            <line x1="10" y1="6" x2="10" y2="14" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="10" x2="14" y2="10" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button className="sidebar-icon-btn" aria-label="Domů">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 7.5L9 2.5L15 7.5V15C15 15.55 14.55 16 14 16H4C3.45 16 3 15.55 3 15V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7 16V10H11V16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="sidebar-icon-btn" aria-label="Projekty">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="6" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav className="sidebar-menu">
        {MENU_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-menu-btn ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuSelect(item.id)}
          >
            <span className="sidebar-menu-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default AppSidebar
