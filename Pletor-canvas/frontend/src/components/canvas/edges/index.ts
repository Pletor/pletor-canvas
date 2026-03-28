import PletorImportEdge from './PletorImportEdge/PletorImportEdge'
import PletorApiCallEdge from './PletorApiCallEdge/PletorApiCallEdge'
import PletorDataFlowEdge from './PletorDataFlowEdge/PletorDataFlowEdge'
import PletorEventEdge from './PletorEventEdge/PletorEventEdge'

export const pletorEdgeTypes = {
  import: PletorImportEdge,
  apiCall: PletorApiCallEdge,
  dataFlow: PletorDataFlowEdge,
  event: PletorEventEdge,
}
