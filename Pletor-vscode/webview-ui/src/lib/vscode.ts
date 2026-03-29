// VS Code WebView API bridge
// V extension kontextu: window.acquireVsCodeApi() vrátí skutečné API
// V dev módu (Vite): fallback na mock

interface VsCodeApi {
  postMessage(message: unknown): void
  getState(): unknown
  setState(state: unknown): void
}

declare global {
  interface Window {
    acquireVsCodeApi?: () => VsCodeApi
    __PLETOR_INITIAL_DATA__?: PletorInitialData
    __PLETOR_VSCODE__?: boolean
  }
}

export interface PletorInitialData {
  view: 'plan' | 'canvas'
  plan?: import('../plan/plan.types').PlanData
  canvas?: import('../canvas/canvas.types').CanvasData
  workspaceFiles?: WorkspaceFile[]
}

export interface WorkspaceFile {
  id: string
  label: string
  filePath: string
  type: 'folder' | 'file' | 'component' | 'service' | 'api' | 'agent' | 'integration' | 'database'
}

// Singleton — acquireVsCodeApi() lze volat jen jednou
let _vscode: VsCodeApi | null = null

function getVscode(): VsCodeApi {
  if (_vscode) return _vscode

  if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
    _vscode = window.acquireVsCodeApi()
  } else {
    // Dev mock
    _vscode = {
      postMessage: (msg) => console.log('[vscode mock] postMessage:', msg),
      getState: () => null,
      setState: () => {},
    }
  }

  return _vscode
}

export function postMessage(type: string, payload?: unknown): void {
  getVscode().postMessage({ type, payload })
}

export function getInitialData(): PletorInitialData {
  if (typeof window !== 'undefined' && window.__PLETOR_INITIAL_DATA__) {
    return window.__PLETOR_INITIAL_DATA__
  }
  // Dev fallback
  return { view: 'canvas' }
}

// Naslouchá zprávám z extension → webview
export function onMessage(handler: (message: { type: string; payload: unknown }) => void): () => void {
  const listener = (event: MessageEvent) => {
    if (event.data && typeof event.data.type === 'string') {
      handler(event.data as { type: string; payload: unknown })
    }
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}
