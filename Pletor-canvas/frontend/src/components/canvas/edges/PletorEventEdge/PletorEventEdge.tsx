import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

function PletorEventEdge(props: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  })

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      style={{
        stroke: 'oklch(59% 0.21 280)',
        strokeWidth: 2,
        strokeDasharray: '3 3',
      }}
    />
  )
}

export default PletorEventEdge
