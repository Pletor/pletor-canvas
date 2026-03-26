import './Header.css'

interface HeaderProps {
  onLaunch: () => void
}

function Header({ onLaunch }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="header-logo">Pletor</span>
      </div>
      <div className="header-right">
        <button className="header-launch-btn" onClick={onLaunch}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 2L11 7L4 12V2Z" fill="currentColor" />
          </svg>
          Spustit projekt
        </button>
      </div>
    </header>
  )
}

export default Header
