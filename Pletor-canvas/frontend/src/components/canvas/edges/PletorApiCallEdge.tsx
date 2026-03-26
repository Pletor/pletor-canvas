import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

function PletorApiCallEdge(props: EdgeProps) {
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
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '8 4',
      }}
    />
  )
}

export default PletorApiCallEdge
