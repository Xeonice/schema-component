/**
 * Adapters
 *
 * 适配器层,负责将 Theme 的 React 组件适配为 Engine 的 IRenderer 接口
 */

export {
  createDataRendererAdapter,
  createFieldRendererAdapter,
  createGroupRendererAdapter,
  createActionRendererAdapter,
  createViewRendererAdapter,
  createRendererAdapter,
  setReactComponentRegistrar,
} from './rendererAdapter'

export { registerAllRenderersToEngine } from './registerToEngine'
