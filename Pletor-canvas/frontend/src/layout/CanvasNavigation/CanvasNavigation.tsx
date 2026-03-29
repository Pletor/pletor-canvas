import './CanvasNavigation.css'

interface NavigationSection {
  id: string
  label: string
  available: boolean
}

const SECTIONS: NavigationSection[] = [
  { id: 'canvas',       label: 'Canvas',       available: true },
  { id: 'agents',       label: 'AI Agenti',    available: false },
  { id: 'integrations', label: 'Integrace',    available: false },
  { id: 'tickets',      label: 'Tickety',      available: false },
  { id: 'logs',         label: 'Logy',         available: false },
  { id: 'memory',       label: 'Paměť',        available: false },
  { id: 'rules',        label: 'Pravidla',     available: false },
]

interface CanvasNavigationProps {
  activeSection: string
  onSectionChange: (id: string) => void
}

function CanvasNavigation({ activeSection, onSectionChange }: CanvasNavigationProps) {
  return (
    <nav className="canvas-navigation">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          className={`canvas-nav-btn ${activeSection === section.id ? 'active' : ''} ${!section.available ? 'disabled' : ''}`}
          onClick={() => section.available && onSectionChange(section.id)}
          disabled={!section.available}
          title={section.available ? section.label : `${section.label} — Připravujeme`}
        >
          {section.label}
          {!section.available && <span className="canvas-nav-soon">brzy</span>}
        </button>
      ))}
    </nav>
  )
}

export default CanvasNavigation
