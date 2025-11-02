/**
 * Schema Component - 布尔字段构建器
 *
 * 提供布尔类型的字段构建器
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  BooleanFieldOptions,
  FieldType
} from '../../core/types'

/**
 * 创建布尔字段
 */
export function boolean(options: BooleanFieldOptions = {}): BaseFieldDefinition<boolean> {
  let schema: z.ZodType<boolean> = z.boolean({
    required_error: options.errorMessages?.required,
    invalid_type_error: options.errorMessages?.invalid
  })

  // 处理可选性和默认值
  if (!options.required && options.default === undefined) {
    schema = schema.optional() as z.ZodType<boolean>
  }
  if (options.nullable) {
    schema = schema.nullable() as z.ZodType<boolean>
  }
  if (options.default !== undefined) {
    schema = schema.default(options.default) as z.ZodType<boolean>
  }

  return {
    type: 'boolean' as FieldType,
    options,
    zodSchema: schema as any
  }
}
