import { NODE_LIBRARY, NODE_COLORS, type PletorNodeType } from '../../../types/canvas.types'
import './CanvasNodeLibraryPanel.css'

interface CanvasNodeLibraryPanelProps {
  onDragStart: (type: PletorNodeType, label: string) => void
}

function CanvasNodeLibraryPanel({ onDragStart }: CanvasNodeLibraryPanelProps) {
  const categories = [...new Set(NODE_LIBRARY.map((n) => n.category))]

  return (
    <div className="node-library-panel">
      <div className="node-library-header">
        <span className="node-library-title">Uzly</span>
      </div>
      {categories.map((category) => (
        <div key={category} className="node-library-category">
          <span className="node-library-category-label">{category}</span>
          <div className="node-library-items">
            {NODE_LIBRARY.filter((n) => n.category === category).map((item) => (
              <div
                key={item.type}
                className="node-library-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/pletor-node-type', item.type)
                  e.dataTransfer.setData('application/pletor-node-label', item.label)
                  e.dataTransfer.effectAllowed = 'move'
                  onDragStart(item.type, item.label)
                }}
                style={{
                  borderColor: NODE_COLORS[item.type].border,
                  background: NODE_COLORS[item.type].bg,
                }}
              >
                <span
                  className="node-library-item-dot"
                  style={{ background: NODE_COLORS[item.type].hex }}
                />
                <span
                  className="node-library-item-label"
                  style={{ color: NODE_COLORS[item.type].text }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CanvasNodeLibraryPanel
