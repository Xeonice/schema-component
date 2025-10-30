/**
 * Schema Component - BelongsTo 关联字段构建器
 *
 * 实现 Many-to-One 和 One-to-One 关联关系
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  BelongsToOptions,
  FieldType
} from '../../core/types'

/**
 * 创建 BelongsTo 关联字段 (Many-to-One / One-to-One)
 *
 * @example
 * ```typescript
 * // 文章属于用户
 * const Post = defineSchema({
 *   name: 'Post',
 *   fields: {
 *     author: belongsTo({
 *       target: 'User',
 *       foreignKey: 'authorId',
 *       onDelete: 'CASCADE'
 *     })
 *   }
 * })
 * ```
 */
export function belongsTo<T = any>(
  options: BelongsToOptions
): BaseFieldDefinition<T | null> {
  if (!options.foreignKey) {
    throw new Error('BelongsTo relation must specify foreignKey')
  }

  // BelongsTo 关联在运行时返回关联的对象
  // 但在验证层面，我们只需要验证外键
  let schema: z.ZodTypeAny = z.any()

  // 如果设置了 eager 加载，在验证时会包含关联对象
  if (options.eager) {
    schema = z.lazy(() => z.any())
  }

  // 处理可选性
  if (!options.required) {
    schema = schema.optional()
  }

  // BelongsTo 关联通常允许 null（外键可为 null）
  if (options.nullable !== false) {
    schema = schema.nullable()
  }

  return {
    type: 'belongsTo' as FieldType,
    options,
    zodSchema: schema
  }
}

/**
 * 创建必需的 BelongsTo 关联（不允许 null）
 */
export function belongsToRequired<T = any>(
  options: Omit<BelongsToOptions, 'required' | 'nullable'>
): BaseFieldDefinition<T> {
  return belongsTo({
    ...options,
    required: true,
    nullable: false
  }) as any
}
