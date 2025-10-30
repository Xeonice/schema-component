/**
 * Schema Component - 主入口
 *
 * 统一导出所有 Schema 系统的功能
 */

// ============================================================================
// 核心类型定义
// ============================================================================
export type {
  // 字段类型枚举
  FieldType,

  // 基础选项接口
  BaseFieldOptions,
  StringFieldOptions,
  NumberFieldOptions,
  BooleanFieldOptions,
  DateFieldOptions,
  EnumFieldOptions,
  JSONFieldOptions,
  ArrayFieldOptions,

  // 关联选项接口
  BelongsToOptions,
  HasManyOptions,
  ManyToManyOptions,

  // 字段定义接口
  BaseFieldDefinition,
  FieldDefinitions,

  // Schema 定义接口
  SchemaOptions,
  SchemaDefinition,

  // 类型推导辅助类型
  InferFieldType,
  InferSchemaType,
  Infer,
  InferInput,

  // 工具类型
  Optional,
  RequiredFields,
  OptionalFields,
  CreateType,
  UpdateType,
  QueryType
} from './core/types'

// ============================================================================
// Schema 定义函数
// ============================================================================
export {
  defineSchema,
  extendSchema,
  pickSchema,
  omitSchema
} from './core/defineSchema'

// ============================================================================
// 基础字段构建器
// ============================================================================
export {
  // 字符串类型
  string,
  text,
  email,
  url,
  uuid,
  slug,
  phone,

  // 数值类型
  number,
  integer,
  float,
  positiveInteger,
  nonNegativeInteger,

  // 布尔类型
  boolean,

  // 日期时间类型
  date,
  datetime,
  timestamp,
  createdAt,
  updatedAt,

  // 枚举类型
  enumField,
  nativeEnum,

  // JSON 类型
  json,
  jsonObject,
  jsonArray,

  // 数组类型
  array,
  stringArray,
  numberArray,
  booleanArray
} from './fields/basic'

// ============================================================================
// 关联字段构建器
// ============================================================================
export {
  belongsTo,
  belongsToRequired,
  hasMany,
  manyToMany
} from './fields/relation'

// ============================================================================
// 字段命名空间（统一 API）
// ============================================================================
export { field } from './fields'

// ============================================================================
// withOption 包装器
// ============================================================================
export {
  withOption,
  FieldWithOptions,
  StringFieldWithOptions,
  NumberFieldWithOptions,
  ArrayFieldWithOptions
} from './options/withOption'

// ============================================================================
// 类型推导工具
// ============================================================================
export type {
  InferSchemaType as InferSchema,
  InferInputType,
  InferOutputType,
  InferCreateType,
  InferUpdateType,
  InferQueryType,
  RequiredFieldsOf,
  OptionalFieldsOf,
  PickSchemaFields,
  OmitSchemaFields
} from './utils/typeInference'

export {
  validateSchema,
  parseSchema,
  validatePartial,
  validateRequired,
  getSchemaFieldNames,
  hasSchemaField,
  getFieldType,
  getFieldOptions,
  cloneSchema,
  mergeSchemas
} from './utils/typeInference'

// ============================================================================
// 默认导出（方便导入）
// ============================================================================
import { defineSchema } from './core/defineSchema'
import { field } from './fields'
import { withOption } from './options/withOption'

export const version = '0.0.0'

export default {
  version,
  defineSchema,
  field,
  withOption
}
