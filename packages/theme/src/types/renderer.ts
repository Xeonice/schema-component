import type { ReactNode } from 'react'
import type {
  SchemaDefinition,
  BaseFieldDefinition as SchemaFieldDefinition,
} from '@schema-component/schema'
import type {
  RenderViewDefinition as ViewDefinition,
  GroupDefinition,
  FieldDefinition as FieldReference,
  ActionDefinition,
} from '@schema-component/engine'

// Re-export for convenience
export type FieldDefinition = SchemaFieldDefinition

/**
 * Base renderer context shared by all renderers
 */
export interface RendererContext {
  /** Current schema definition */
  schema: SchemaDefinition
  /** Current data being rendered */
  data?: any
  /** Rendering mode */
  mode?: 'view' | 'edit' | 'create'
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is read-only */
  readOnly?: boolean
  /** Additional CSS classes */
  className?: string
  /** Custom styles */
  style?: React.CSSProperties
  /** Error message for the field */
  error?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Data renderer props
 * Renders a single data value based on field type
 */
export interface DataRendererProps extends RendererContext {
  /** Field definition from schema */
  field: FieldDefinition
  /** Field name */
  name: string
  /** Field value */
  value: any
  /** Value change handler (for edit mode) */
  onChange?: (value: any) => void
}

/**
 * Field renderer props
 * Renders a field with label and data renderer
 */
export interface FieldRendererProps extends RendererContext {
  /** Field reference from view/group */
  field: FieldReference
  /** Field definition from schema */
  fieldDef: FieldDefinition
  /** Field value */
  value: any
  /** Value change handler */
  onChange?: (value: any) => void
}

/**
 * Group renderer props
 * Renders a group of fields with specific layout
 */
export interface GroupRendererProps extends RendererContext {
  /** Group definition */
  group: GroupDefinition
  /** Data for the group */
  data: any
  /** Data change handler */
  onChange?: (data: any) => void
  /** Child content (for container groups) */
  children?: ReactNode
}

/**
 * Action renderer props
 * Renders an action button/link
 */
export interface ActionRendererProps {
  /** Action definition */
  action: ActionDefinition
  /** Current context data */
  data?: any
  /** Action click handler */
  onClick?: () => void | Promise<void>
  /** Whether the action is disabled */
  disabled?: boolean
  /** Whether the action is loading */
  loading?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * View renderer props
 * Renders a complete view (form, table, detail, etc.)
 */
export interface ViewRendererProps extends RendererContext {
  /** View definition */
  view: ViewDefinition
  /** View data */
  data?: any
  /** Data change handler */
  onChange?: (data: any) => void
  /** Actions */
  actions?: ActionDefinition[]
  /** Action execution handler */
  onAction?: (actionName: string) => void
}

/**
 * Renderer component type
 */
export type RendererComponent<P = any> = React.FC<P>

/**
 * Data renderer registration
 */
export interface DataRendererRegistration {
  /** Renderer component */
  component: RendererComponent<DataRendererProps>
  /** Display name */
  displayName?: string
  /** Whether this renderer supports edit mode */
  supportsEdit?: boolean
}

/**
 * Field renderer registration
 */
export interface FieldRendererRegistration {
  /** Renderer component */
  component: RendererComponent<FieldRendererProps>
  /** Display name */
  displayName?: string
}

/**
 * Group renderer registration
 */
export interface GroupRendererRegistration {
  /** Renderer component */
  component: RendererComponent<GroupRendererProps>
  /** Display name */
  displayName?: string
}

/**
 * Action renderer registration
 */
export interface ActionRendererRegistration {
  /** Renderer component */
  component: RendererComponent<ActionRendererProps>
  /** Display name */
  displayName?: string
}

/**
 * View renderer registration
 */
export interface ViewRendererRegistration {
  /** Renderer component */
  component: RendererComponent<ViewRendererProps>
  /** Display name */
  displayName?: string
}
