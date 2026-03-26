import PletorFolderNode from './PletorFolderNode'
import PletorFileNode from './PletorFileNode'
import PletorAgentNode from './PletorAgentNode'
import PletorIntegrationNode from './PletorIntegrationNode'

// React Flow nodeTypes registrace — klíče odpovídají PletorNodeType
export const pletorNodeTypes = {
  folder: PletorFolderNode,
  file: PletorFileNode,
  component: PletorFileNode,
  service: PletorFileNode,
  api: PletorFileNode,
  agent: PletorAgentNode,
  integration: PletorIntegrationNode,
}
