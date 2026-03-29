import { getInitialData } from './lib/vscode'
import PlanView from './plan/PlanView'
import CanvasView from './canvas/CanvasView'

function App() {
  const data = getInitialData()

  if (data.view === 'plan') {
    return <PlanView initial={data.plan} />
  }

  return (
    <CanvasView
      initial={data.canvas}
      workspaceFiles={data.workspaceFiles ?? []}
    />
  )
}

export default App
