import PletorFolderNode from './PletorFolderNode/PletorFolderNode'
import PletorFileNode from './PletorFileNode/PletorFileNode'
import PletorAgentNode from './PletorAgentNode/PletorAgentNode'
import PletorIntegrationNode from './PletorIntegrationNode/PletorIntegrationNode'

export const pletorNodeTypes = {
  folder: PletorFolderNode,
  file: PletorFileNode,
  component: PletorFileNode,
  service: PletorFileNode,
  api: PletorFileNode,
  agent: PletorAgentNode,
  integration: PletorIntegrationNode,
}
