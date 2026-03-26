import PletorImportEdge from './PletorImportEdge'
import PletorApiCallEdge from './PletorApiCallEdge'
import PletorDataFlowEdge from './PletorDataFlowEdge'
import PletorEventEdge from './PletorEventEdge'

// React Flow edgeTypes registrace — klíče odpovídají PletorEdgeType
export const pletorEdgeTypes = {
  import: PletorImportEdge,
  apiCall: PletorApiCallEdge,
  dataFlow: PletorDataFlowEdge,
  event: PletorEventEdge,
}
