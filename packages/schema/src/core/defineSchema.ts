/**
 * Schema Component - Schema 定义函数
 *
 * 提供核心的 defineSchema 函数用于定义数据模型
 */

import { z } from 'zod'
import type {
  SchemaDefinition,
  SchemaOptions,
  FieldDefinitions,
  BaseFieldDefinition
} from './types'
import { datetime } from '../fields/basic/date'
import { boolean } from '../fields/basic/boolean'

/**
 * 定义 Schema
 *
 * @example
 * ```typescript
 * const UserSchema = defineSchema({
 *   name: 'User',
 *   fields: {
 *     id: field.uuid({ required: true }),
 *     email: field.email({ required: true, unique: true }),
 *     name: field.string({ required: true }),
 *     age: field.integer({ min: 0 })
 *   },
 *   options: {
 *     timestamps: true,
 *     softDelete: true
 *   }
 * })
 * ```
 */
export function defineSchema<T extends FieldDefinitions>(config: {
  name: string
  fields: T
  options?: Partial<SchemaOptions>
}): SchemaDefinition<T> {
  const { name, fields, options = {} } = config

  // 合并默认选项
  const schemaOptions: SchemaOptions = {
    name,
    tableName: options.tableName ?? name.toLowerCase() + 's',
    description: options.description,
    timestamps: options.timestamps ?? false,
    softDelete: options.softDelete ?? false,
    validate: options.validate
  }

  // 构建字段映射
  let allFields = { ...fields }

  // 添加时间戳字段
  if (schemaOptions.timestamps) {
    const timestampConfig = typeof schemaOptions.timestamps === 'object'
      ? schemaOptions.timestamps
      : { createdAt: 'createdAt', updatedAt: 'updatedAt' }

    if (timestampConfig.createdAt !== false) {
      const createdAtField = timestampConfig.createdAt || 'createdAt'
      allFields = {
        ...allFields,
        [createdAtField]: datetime({
          autoCreate: true,
          required: true,
          description: 'Record creation timestamp'
        })
      } as any
    }

    if (timestampConfig.updatedAt !== false) {
      const updatedAtField = timestampConfig.updatedAt || 'updatedAt'
      allFields = {
        ...allFields,
        [updatedAtField]: datetime({
          autoUpdate: true,
          required: true,
          description: 'Record last update timestamp'
        })
      } as any
    }
  }

  // 添加软删除字段
  if (schemaOptions.softDelete) {
    const softDeleteConfig = typeof schemaOptions.softDelete === 'object'
      ? schemaOptions.softDelete
      : { field: 'deletedAt' }

    const deletedAtField = softDeleteConfig.field || 'deletedAt'
    allFields = {
      ...allFields,
      [deletedAtField]: datetime({
        nullable: true,
        description: 'Soft delete timestamp'
      })
    } as any
  }

  // 构建 Zod Schema
  const zodShape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(allFields)) {
    const field = fieldDef as BaseFieldDefinition
    zodShape[fieldName] = field.zodSchema
  }

  let zodSchema: z.ZodTypeAny = z.object(zodShape)

  // 添加自定义验证
  if (schemaOptions.validate) {
    zodSchema = zodSchema.refine(
      (data) => {
        const result = schemaOptions.validate!(data)
        if (typeof result === 'boolean') {
          return result
        }
        return true
      },
      (data) => {
        const result = schemaOptions.validate!(data)
        if (typeof result === 'string') {
          return { message: result }
        }
        if (typeof result === 'object' && result !== null && 'field' in result) {
          return {
            message: result.message,
            path: [result.field]
          }
        }
        return { message: 'Validation failed' }
      }
    )
  }

  return {
    name,
    fields: allFields as T,
    options: schemaOptions,
    zodSchema
  }
}

/**
 * 扩展已有 Schema（添加新字段）
 *
 * @example
 * ```typescript
 * const ExtendedUserSchema = extendSchema(UserSchema, {
 *   avatar: field.url(),
 *   bio: field.text()
 * })
 * ```
 */
export function extendSchema<
  T extends FieldDefinitions,
  U extends FieldDefinitions
>(
  baseSchema: SchemaDefinition<T>,
  newFields: U
): SchemaDefinition<T & U> {
  return defineSchema({
    name: baseSchema.name,
    fields: {
      ...baseSchema.fields,
      ...newFields
    } as T & U,
    options: baseSchema.options
  })
}

/**
 * 从 Schema 中选择部分字段（创建子集 Schema）
 *
 * @example
 * ```typescript
 * const UserPublicSchema = pickSchema(UserSchema, ['id', 'name', 'email'])
 * ```
 */
export function pickSchema<
  T extends FieldDefinitions,
  K extends keyof T
>(
  baseSchema: SchemaDefinition<T>,
  fields: K[]
): SchemaDefinition<Pick<T, K>> {
  const pickedFields = {} as Pick<T, K>

  for (const field of fields) {
    if (field in baseSchema.fields) {
      pickedFields[field] = baseSchema.fields[field]
    }
  }

  return defineSchema({
    name: baseSchema.name,
    fields: pickedFields,
    options: {
      ...baseSchema.options,
      timestamps: false,
      softDelete: false
    }
  })
}

/**
 * 从 Schema 中排除部分字段
 *
 * @example
 * ```typescript
 * const UserWithoutPassword = omitSchema(UserSchema, ['password'])
 * ```
 */
export function omitSchema<
  T extends FieldDefinitions,
  K extends keyof T
>(
  baseSchema: SchemaDefinition<T>,
  fields: K[]
): SchemaDefinition<Omit<T, K>> {
  const omittedFields = { ...baseSchema.fields }

  for (const field of fields) {
    delete omittedFields[field]
  }

  return defineSchema({
    name: baseSchema.name,
    fields: omittedFields as Omit<T, K>,
    options: baseSchema.options
  })
}
