import type { SchemaDefinition } from '@schema-component/schema'

/**
 * 验证错误结构
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
}

/**
 * 验证单个字段
 *
 * @param fieldName - 字段名称
 * @param value - 字段值
 * @param schema - Schema 定义
 * @returns 验证错误消息数组
 */
export function validateField(
  fieldName: string,
  value: any,
  schema: SchemaDefinition
): string[] {
  const fieldDef = schema.fields[fieldName]
  if (!fieldDef) {
    return [`字段 ${fieldName} 不存在于 schema 中`]
  }

  try {
    // 使用 Zod schema 进行验证
    fieldDef.zodSchema.parse(value)
    return []
  } catch (error: any) {
    // 处理 Zod 验证错误
    if (error?.errors && Array.isArray(error.errors)) {
      return error.errors.map((e: any) => e.message)
    }
    return [error?.message || '验证失败']
  }
}

/**
 * 验证整个表单数据
 *
 * @param data - 表单数据
 * @param schema - Schema 定义
 * @param fieldsToValidate - 要验证的字段列表(可选,默认验证所有字段)
 * @returns 验证结果
 */
export function validateForm(
  data: Record<string, any>,
  schema: SchemaDefinition,
  fieldsToValidate?: string[]
): ValidationResult {
  const errors: Record<string, string[]> = {}
  const fields = fieldsToValidate || Object.keys(schema.fields)

  for (const fieldName of fields) {
    const fieldErrors = validateField(fieldName, data[fieldName], schema)
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors
    }
  }

  // 执行 schema 级别的自定义验证
  if (schema.options.validate) {
    const schemaValidationResult = schema.options.validate(data)

    if (schemaValidationResult === false) {
      errors['_form'] = ['表单验证失败']
    } else if (typeof schemaValidationResult === 'string') {
      errors['_form'] = [schemaValidationResult]
    } else if (typeof schemaValidationResult === 'object' && schemaValidationResult !== null) {
      const { field, message } = schemaValidationResult as { field: string; message: string }
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(message)
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 检查字段是否必填
 *
 * @param fieldName - 字段名称
 * @param schema - Schema 定义
 * @returns 是否必填
 */
export function isFieldRequired(
  fieldName: string,
  schema: SchemaDefinition
): boolean {
  const fieldDef = schema.fields[fieldName]
  if (!fieldDef) {
    return false
  }

  return fieldDef.options.required ?? false
}
