import { useState, useRef, useCallback } from 'react'
import { agentApi } from '../../agent/agentApi'

interface InspectorAgentSectionProps {
  nodeId: string
}

function InspectorAgentSection({ nodeId }: InspectorAgentSectionProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<{ tokensIn: number; tokensOut: number; durationMs: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const outputRef = useRef<HTMLPreElement>(null)

  const handleGenerate = useCallback(async () => {
    setStatus('running')
    setOutput('')
    setStats(null)
    setError(null)

    try {
      for await (const event of agentApi.stream(nodeId)) {
        if (event.type === 'delta') {
          setOutput((prev) => prev + event.text)
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
          }
        }
        if (event.type === 'done') {
          setStats({ tokensIn: event.tokensIn, tokensOut: event.tokensOut, durationMs: event.durationMs })
          setStatus('done')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
      setStatus('error')
    }
  }, [nodeId])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
  }, [output])

  return (
    <div className="inspector-section">
      <span className="inspector-section-label">AI Agent</span>

      <button
        className="inspector-generate-btn"
        onClick={handleGenerate}
        disabled={status === 'running'}
      >
        {status === 'running' ? (
          <span className="inspector-generate-spinner" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {status === 'running' ? 'Generuji...' : 'Generovat kód'}
      </button>

      {error && (
        <div className="inspector-agent-error">{error}</div>
      )}

      {output && (
        <div className="inspector-agent-output-wrap">
          <div className="inspector-agent-output-header">
            <span>Výstup</span>
            <button className="inspector-agent-copy-btn" onClick={handleCopy}>
              Kopírovat
            </button>
          </div>
          <pre ref={outputRef} className="inspector-agent-output">{output}</pre>
        </div>
      )}

      {stats && (
        <div className="inspector-agent-stats">
          <span>{stats.tokensIn + stats.tokensOut} tokenů</span>
          <span>{(stats.durationMs / 1000).toFixed(1)}s</span>
        </div>
      )}
    </div>
  )
}

export default InspectorAgentSection
