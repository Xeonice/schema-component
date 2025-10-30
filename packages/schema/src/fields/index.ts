/**
 * Schema Component - 字段构建器统一导出
 *
 * 导出所有字段类型的构建器
 */

// 导出基础字段
export * from './basic'

// 导出关联字段
export * from './relation'

// 导入所有字段构建器
import {
  string,
  text,
  email,
  url,
  uuid,
  slug,
  phone
} from './basic/string'

import {
  number,
  integer,
  float,
  positiveInteger,
  nonNegativeInteger
} from './basic/number'

import { boolean } from './basic/boolean'

import {
  date,
  datetime,
  timestamp,
  createdAt,
  updatedAt
} from './basic/date'

import {
  enumField,
  nativeEnum
} from './basic/enum'

import {
  json,
  jsonObject,
  jsonArray
} from './basic/json'

import {
  array,
  stringArray,
  numberArray,
  booleanArray
} from './basic/array'

import {
  belongsTo,
  belongsToRequired
} from './relation/belongsTo'

import { hasMany } from './relation/hasMany'

import { manyToMany } from './relation/manyToMany'

/**
 * 字段构建器命名空间
 * 提供统一的 field.xxx() API
 */
export const field = {
  // 基础字符串类型
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
  enum: enumField,
  nativeEnum,

  // JSON 类型
  json,
  jsonObject,
  jsonArray,

  // 数组类型
  array,
  stringArray,
  numberArray,
  booleanArray,

  // 关联类型
  belongsTo,
  belongsToRequired,
  hasMany,
  manyToMany
}
