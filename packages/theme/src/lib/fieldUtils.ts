import type { FieldDefinition } from '../types'

/**
 * Safely get a field option value
 */
export function getFieldOption<T = any>(
  field: FieldDefinition,
  key: string,
  defaultValue?: T
): T | undefined {
  if (!field.options) {
    return defaultValue
  }
  const options = field.options as Record<string, any>
  return options[key] !== undefined ? options[key] : defaultValue
}
