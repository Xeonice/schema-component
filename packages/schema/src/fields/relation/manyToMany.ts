/**
 * Schema Component - ManyToMany 关联字段构建器
 *
 * 实现 Many-to-Many 关联关系
 */

import { z } from 'zod'
import type {
  BaseFieldDefinition,
  ManyToManyOptions,
  FieldType
} from '../../core/types'

/**
 * 创建 ManyToMany 关联字段
 *
 * @example
 * ```typescript
 * // 文章有多个标签，标签也属于多篇文章
 * const Post = defineSchema({
 *   name: 'Post',
 *   fields: {
 *     tags: manyToMany({
 *       target: 'Tag',
 *       through: 'PostTags',
 *       foreignKey: 'postId',
 *       otherKey: 'tagId'
 *     })
 *   }
 * })
 * ```
 */
export function manyToMany<T = any>(
  options: ManyToManyOptions
): BaseFieldDefinition<T[]> {
  if (!options.target) {
    throw new Error('ManyToMany relation must specify target schema')
  }
  if (!options.through) {
    throw new Error('ManyToMany relation must specify through table')
  }
  if (!options.foreignKey) {
    throw new Error('ManyToMany relation must specify foreignKey')
  }
  if (!options.otherKey) {
    throw new Error('ManyToMany relation must specify otherKey')
  }

  // ManyToMany 关联返回数组
  // 在运行时会通过中间表查询关联对象
  // 在验证层面，这是一个虚拟字段
  let schema: z.ZodTypeAny = z.array(z.any())

  // 处理可选性（ManyToMany 通常是可选的）
  if (!options.required) {
    schema = schema.optional()
  }

  // ManyToMany 默认返回空数组而不是 null
  schema = schema.default([])

  return {
    type: 'manyToMany' as FieldType,
    options,
    zodSchema: schema
  }
}
