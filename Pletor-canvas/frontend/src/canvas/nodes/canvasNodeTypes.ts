import PletorFolderNode from './PletorFolderNode'
import PletorFileNode from './PletorFileNode'
import PletorAgentNode from './PletorAgentNode'
import PletorIntegrationNode from './PletorIntegrationNode'
import PletorImportEdge from './edges/PletorImportEdge'
import PletorApiCallEdge from './edges/PletorApiCallEdge'
import PletorDataFlowEdge from './edges/PletorDataFlowEdge'
import PletorEventEdge from './edges/PletorEventEdge'

export const pletorNodeTypes = {
  folder: PletorFolderNode,
  file: PletorFileNode,
  component: PletorFileNode,
  service: PletorFileNode,
  api: PletorFileNode,
  agent: PletorAgentNode,
  integration: PletorIntegrationNode,
}

export const pletorEdgeTypes = {
  import: PletorImportEdge,
  apiCall: PletorApiCallEdge,
  dataFlow: PletorDataFlowEdge,
  event: PletorEventEdge,
}
