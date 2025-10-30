/**
 * Schema Component - HasMany 关联字段构建器
 *
 * 实现 One-to-Many 关联关系
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  HasManyOptions,
  FieldType
} from '../../core/types'

/**
 * 创建 HasMany 关联字段 (One-to-Many)
 *
 * @example
 * ```typescript
 * // 用户拥有多篇文章
 * const User = defineSchema({
 *   name: 'User',
 *   fields: {
 *     posts: hasMany({
 *       target: 'Post',
 *       foreignKey: 'authorId',
 *       orderBy: { field: 'createdAt', order: 'DESC' }
 *     })
 *   }
 * })
 * ```
 */
export function hasMany<T = any>(
  options: HasManyOptions
): BaseFieldDefinition<T[]> {
  if (!options.target) {
    throw new Error('HasMany relation must specify target schema')
  }
  if (!options.foreignKey) {
    throw new Error('HasMany relation must specify foreignKey')
  }

  // HasMany 关联返回数组
  // 在运行时会返回关联对象的数组
  // 在验证层面，这是一个虚拟字段，不存储在数据库中
  let schema: z.ZodTypeAny = z.array(z.any())

  // 处理可选性（HasMany 通常是可选的，因为可能没有关联记录）
  if (!options.required) {
    schema = schema.optional()
  }

  // HasMany 默认返回空数组而不是 null
  schema = schema.default([])

  return {
    type: 'hasMany' as FieldType,
    options,
    zodSchema: schema
  }
}
