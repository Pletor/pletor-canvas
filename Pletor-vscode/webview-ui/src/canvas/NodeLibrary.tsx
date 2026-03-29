import { NODE_LIBRARY, NODE_COLORS, type PletorNodeType } from './canvas.types'
import type { WorkspaceFile } from '../lib/vscode'
import './NodeLibrary.css'

interface NodeLibraryProps {
  workspaceFiles: WorkspaceFile[]
}

export function NodeLibrary({ workspaceFiles }: NodeLibraryProps) {
  return (
    <div className="node-library">
      <div className="node-library-section">
        <span className="node-library-heading">Uzly</span>
        <div className="node-library-items">
          {NODE_LIBRARY.map((item) => (
            <div
              key={item.type}
              className="node-library-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/pletor-node-type', item.type)
                e.dataTransfer.setData('application/pletor-node-label', item.label)
                e.dataTransfer.effectAllowed = 'move'
              }}
              style={{ borderColor: NODE_COLORS[item.type].border }}
            >
              <span>{item.icon}</span>
              <span style={{ color: NODE_COLORS[item.type].text }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {workspaceFiles.length > 0 && (
        <div className="node-library-section">
          <span className="node-library-heading">Workspace</span>
          <div className="node-library-files">
            {workspaceFiles.slice(0, 30).map((file) => (
              <div
                key={file.id}
                className="node-library-file"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/pletor-node-type', file.type)
                  e.dataTransfer.setData('application/pletor-node-label', file.label)
                  e.dataTransfer.setData('application/pletor-file-path', file.filePath)
                  e.dataTransfer.effectAllowed = 'move'
                }}
              >
                <span
                  className="node-library-file-dot"
                  style={{ background: NODE_COLORS[file.type as PletorNodeType].hex }}
                />
                <span className="node-library-file-name">{file.label}</span>
              </div>
            ))}
            {workspaceFiles.length > 30 && (
              <span className="node-library-more">+{workspaceFiles.length - 30} dalších</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
