/**
 * Schema Component - 基础字段构建器导出
 *
 * 统一导出所有基础字段类型的构建器
 */

// 字符串类型
export {
  string,
  text,
  email,
  url,
  uuid,
  slug,
  phone
} from './string'

// 数值类型
export {
  number,
  integer,
  float,
  positiveInteger,
  nonNegativeInteger
} from './number'

// 布尔类型
export {
  boolean
} from './boolean'

// 日期时间类型
export {
  date,
  datetime,
  timestamp,
  createdAt,
  updatedAt
} from './date'

// 枚举类型
export {
  enumField,
  nativeEnum
} from './enum'

// JSON 类型
export {
  json,
  jsonObject,
  jsonArray
} from './json'

// 数组类型
export {
  array,
  stringArray,
  numberArray,
  booleanArray
} from './array'
