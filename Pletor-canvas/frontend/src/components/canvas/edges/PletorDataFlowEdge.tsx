import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

function PletorDataFlowEdge(props: EdgeProps) {
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
        stroke: '#f59e0b',
        strokeWidth: 2,
      }}
    />
  )
}

export default PletorDataFlowEdge
