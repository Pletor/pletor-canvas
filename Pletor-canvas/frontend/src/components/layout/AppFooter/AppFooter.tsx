import './AppFooter.css'

function AppFooter() {
  return (
    <footer className="app-footer">
      <button className="footer-toggle-btn" aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="1" x2="6" y2="15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </footer>
  )
}

export default AppFooter
