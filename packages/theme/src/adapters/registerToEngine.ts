/**
 * Register to Engine
 *
 * 将 Theme 层的所有渲染器注册到 Engine 层的 RendererRegistry
 *
 * 使用适配器模式,将 React 组件包装成符合 Engine IRenderer 接口的渲染器
 */

import { RendererRegistry } from '@schema-component/engine'
import { createDataRendererAdapter, createFieldRendererAdapter, createGroupRendererAdapter, createActionRendererAdapter, createViewRendererAdapter } from './rendererAdapter'

// Import all renderers
import {
  TextRenderer,
  EmailRenderer,
  UrlRenderer,
  PhoneRenderer,
  TextareaRenderer,
  PasswordRenderer,
  ColorRenderer,
} from '../components/renderers/data/string'

import {
  NumberRenderer,
  IntegerRenderer,
  FloatRenderer,
  CurrencyRenderer,
  PercentRenderer,
} from '../components/renderers/data/number'

import {
  CheckboxRenderer,
  SwitchRenderer,
  BadgeRenderer,
} from '../components/renderers/data/boolean'

import {
  DateRenderer,
  DateTimeRenderer,
  TimestampRenderer,
  RelativeTimeRenderer,
} from '../components/renderers/data/date'

import {
  ArrayRenderer,
  TagArrayRenderer,
} from '../components/renderers/data/array'

import {
  ObjectRenderer,
  KeyValueRenderer,
} from '../components/renderers/data/object'

import {
  BelongsToRenderer,
  HasManyRenderer,
  ManyToManyRenderer,
} from '../components/renderers/data/relation'

import {
  ImageRenderer,
  FileRenderer,
} from '../components/renderers/data/media'

import {
  JSONRenderer,
  CodeRenderer,
} from '../components/renderers/data/special'

import {
  HorizontalFieldRenderer,
  InlineFieldRenderer,
} from '../components/renderers/field'

import {
  CardGroupRenderer,
  TabsGroupRenderer,
  AccordionGroupRenderer,
  GridGroupRenderer,
  StackGroupRenderer,
} from '../components/renderers/group'

import {
  ActionRenderer,
  ButtonActionRenderer,
  LinkActionRenderer,
  DropdownActionRenderer,
} from '../components/renderers/action'

import {
  FormView,
  TableView,
  DetailView,
  ListView,
} from '../components/renderers/view'

/**
 * 注册所有 Data Renderers 到 Engine
 */
function registerDataRenderersToEngine() {
  const registry = RendererRegistry.getInstance()

  // String renderers
  registry.register(createDataRendererAdapter('string', TextRenderer))
  registry.register(createDataRendererAdapter('text', TextRenderer))
  registry.register(createDataRendererAdapter('email', EmailRenderer))
  registry.register(createDataRendererAdapter('url', UrlRenderer))
  registry.register(createDataRendererAdapter('phone', PhoneRenderer))
  registry.register(createDataRendererAdapter('textarea', TextareaRenderer))
  registry.register(createDataRendererAdapter('password', PasswordRenderer))
  registry.register(createDataRendererAdapter('color', ColorRenderer))

  // Number renderers
  registry.register(createDataRendererAdapter('number', NumberRenderer))
  registry.register(createDataRendererAdapter('integer', IntegerRenderer))
  registry.register(createDataRendererAdapter('float', FloatRenderer))
  registry.register(createDataRendererAdapter('currency', CurrencyRenderer))
  registry.register(createDataRendererAdapter('percent', PercentRenderer))

  // Boolean renderers
  registry.register(createDataRendererAdapter('boolean', CheckboxRenderer))
  registry.register(createDataRendererAdapter('checkbox', CheckboxRenderer))
  registry.register(createDataRendererAdapter('switch', SwitchRenderer))
  registry.register(createDataRendererAdapter('badge', BadgeRenderer))

  // Date renderers
  registry.register(createDataRendererAdapter('date', DateRenderer))
  registry.register(createDataRendererAdapter('datetime', DateTimeRenderer))
  registry.register(createDataRendererAdapter('timestamp', TimestampRenderer))
  registry.register(createDataRendererAdapter('relativetime', RelativeTimeRenderer))

  // Array renderers
  registry.register(createDataRendererAdapter('array', ArrayRenderer))
  registry.register(createDataRendererAdapter('tags', TagArrayRenderer))

  // Object renderers
  registry.register(createDataRendererAdapter('object', ObjectRenderer))
  registry.register(createDataRendererAdapter('keyvalue', KeyValueRenderer))

  // Relation renderers
  registry.register(createDataRendererAdapter('belongsto', BelongsToRenderer))
  registry.register(createDataRendererAdapter('hasmany', HasManyRenderer))
  registry.register(createDataRendererAdapter('manytomany', ManyToManyRenderer))

  // Media renderers
  registry.register(createDataRendererAdapter('image', ImageRenderer))
  registry.register(createDataRendererAdapter('file', FileRenderer))

  // Special renderers
  registry.register(createDataRendererAdapter('json', JSONRenderer))
  registry.register(createDataRendererAdapter('code', CodeRenderer))
}

/**
 * 注册所有 Field Renderers 到 Engine
 */
function registerFieldRenderersToEngine() {
  const registry = RendererRegistry.getInstance()

  registry.register(createFieldRendererAdapter('horizontal', HorizontalFieldRenderer))
  registry.register(createFieldRendererAdapter('vertical', HorizontalFieldRenderer)) // 暂时使用 Horizontal 作为 Vertical 的实现
  registry.register(createFieldRendererAdapter('inline', InlineFieldRenderer))
  registry.register(createFieldRendererAdapter('grid', HorizontalFieldRenderer)) // 暂时使用 Horizontal 作为 Grid 的实现
}

/**
 * 注册所有 Group Renderers 到 Engine
 */
function registerGroupRenderersToEngine() {
  const registry = RendererRegistry.getInstance()

  registry.register(createGroupRendererAdapter('card', CardGroupRenderer))
  registry.register(createGroupRendererAdapter('collapse', AccordionGroupRenderer)) // 使用 Accordion 作为 Collapse 的实现
  registry.register(createGroupRendererAdapter('tab', TabsGroupRenderer))
  registry.register(createGroupRendererAdapter('section', StackGroupRenderer)) // 使用 Stack 作为 Section 的实现
  registry.register(createGroupRendererAdapter('accordion', AccordionGroupRenderer))
  registry.register(createGroupRendererAdapter('grid', GridGroupRenderer))
  registry.register(createGroupRendererAdapter('stack', StackGroupRenderer))
}

/**
 * 注册所有 Action Renderers 到 Engine
 */
function registerActionRenderersToEngine() {
  const registry = RendererRegistry.getInstance()

  registry.register(createActionRendererAdapter('default', ActionRenderer))
  registry.register(createActionRendererAdapter('button', ButtonActionRenderer))
  registry.register(createActionRendererAdapter('primary', ButtonActionRenderer)) // 使用 Button 作为 Primary 的实现
  registry.register(createActionRendererAdapter('danger', ButtonActionRenderer)) // 使用 Button 作为 Danger 的实现
  registry.register(createActionRendererAdapter('link', LinkActionRenderer))
  registry.register(createActionRendererAdapter('dropdown', DropdownActionRenderer))
}

/**
 * 注册所有 View Renderers 到 Engine
 */
function registerViewRenderersToEngine() {
  const registry = RendererRegistry.getInstance()

  registry.register(createViewRendererAdapter('form', FormView))
  registry.register(createViewRendererAdapter('table', TableView))
  registry.register(createViewRendererAdapter('detail', DetailView))
  registry.register(createViewRendererAdapter('list', ListView))
}

/**
 * 注册所有渲染器到 Engine
 * 这是新的入口函数,取代原有的 registerRenderers
 */
export function registerAllRenderersToEngine() {
  registerDataRenderersToEngine()
  registerFieldRenderersToEngine()
  registerGroupRenderersToEngine()
  registerActionRenderersToEngine()
  registerViewRenderersToEngine()
}
