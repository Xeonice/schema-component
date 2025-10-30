/**
 * Schema Component - withOption 包装器
 *
 * 提供灵活的字段选项配置方式
 */

import type { BaseFieldDefinition, BaseFieldOptions } from '../core/types'

/**
 * 字段配置包装器
 * 允许通过链式调用配置字段选项
 */
export class FieldWithOptions<T, O extends BaseFieldOptions> {
  constructor(
    private fieldDef: BaseFieldDefinition<T>,
    private currentOptions: O
  ) {}

  /**
   * 设置字段为必填
   */
  required(message?: string): FieldWithOptions<T, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      required: true,
      errorMessages: {
        ...this.currentOptions.errorMessages,
        required: message
      }
    })
  }

  /**
   * 设置字段为可选
   */
  optional(): FieldWithOptions<T | undefined, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      required: false
    }) as any
  }

  /**
   * 设置字段可为 null
   */
  nullable(): FieldWithOptions<T | null, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      nullable: true
    }) as any
  }

  /**
   * 设置默认值
   */
  default(value: T): FieldWithOptions<T, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      default: value
    })
  }

  /**
   * 设置唯一约束
   */
  unique(): FieldWithOptions<T, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      unique: true
    })
  }

  /**
   * 设置索引
   */
  index(): FieldWithOptions<T, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      index: true
    })
  }

  /**
   * 设置描述
   */
  describe(description: string): FieldWithOptions<T, O> {
    return new FieldWithOptions(this.fieldDef, {
      ...this.currentOptions,
      description
    })
  }

  /**
   * 构建最终的字段定义
   */
  build(): BaseFieldDefinition<T> {
    // 重新构建 Zod schema 以应用新选项
    return {
      ...this.fieldDef,
      options: this.currentOptions
    }
  }

  /**
   * 获取当前选项（用于调试）
   */
  getOptions(): O {
    return this.currentOptions
  }
}

/**
 * 使用选项包装器包装字段定义
 *
 * @example
 * ```typescript
 * const nameField = withOption(field.string())
 *   .required('Name is required')
 *   .minLength(2)
 *   .maxLength(100)
 *   .build()
 * ```
 */
export function withOption<T, O extends BaseFieldOptions>(
  fieldDef: BaseFieldDefinition<T>
): FieldWithOptions<T, O> {
  return new FieldWithOptions<T, O>(fieldDef, fieldDef.options as O)
}

/**
 * 字符串字段专用包装器
 */
export class StringFieldWithOptions<T> extends FieldWithOptions<T, any> {
  /**
   * 设置最小长度
   */
  minLength(length: number, message?: string): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      minLength: length,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        minLength: message
      }
    })
  }

  /**
   * 设置最大长度
   */
  maxLength(length: number, message?: string): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      maxLength: length,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        maxLength: message
      }
    })
  }

  /**
   * 设置正则模式
   */
  pattern(regex: RegExp | string, message?: string): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      pattern: regex,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        pattern: message
      }
    })
  }

  /**
   * 启用 trim
   */
  trim(): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      trim: true
    })
  }

  /**
   * 转换为小写
   */
  lowercase(): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      lowercase: true
    })
  }

  /**
   * 转换为大写
   */
  uppercase(): StringFieldWithOptions<T> {
    return new StringFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      uppercase: true
    })
  }
}

/**
 * 数值字段专用包装器
 */
export class NumberFieldWithOptions<T> extends FieldWithOptions<T, any> {
  /**
   * 设置最小值
   */
  min(value: number, message?: string): NumberFieldWithOptions<T> {
    return new NumberFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      min: value,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        min: message
      }
    })
  }

  /**
   * 设置最大值
   */
  max(value: number, message?: string): NumberFieldWithOptions<T> {
    return new NumberFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      max: value,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        max: message
      }
    })
  }

  /**
   * 设置为正数
   */
  positive(message?: string): NumberFieldWithOptions<T> {
    return new NumberFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      positive: true,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        positive: message
      }
    })
  }

  /**
   * 设置为负数
   */
  negative(message?: string): NumberFieldWithOptions<T> {
    return new NumberFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      negative: true,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        negative: message
      }
    })
  }

  /**
   * 设置步长
   */
  step(value: number): NumberFieldWithOptions<T> {
    return new NumberFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      step: value
    })
  }
}

/**
 * 数组字段专用包装器
 */
export class ArrayFieldWithOptions<T> extends FieldWithOptions<T, any> {
  /**
   * 设置最小元素数量
   */
  minItems(count: number, message?: string): ArrayFieldWithOptions<T> {
    return new ArrayFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      minItems: count,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        minItems: message
      }
    })
  }

  /**
   * 设置最大元素数量
   */
  maxItems(count: number, message?: string): ArrayFieldWithOptions<T> {
    return new ArrayFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      maxItems: count,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        maxItems: message
      }
    })
  }

  /**
   * 设置元素唯一性
   */
  uniqueItems(message?: string): ArrayFieldWithOptions<T> {
    return new ArrayFieldWithOptions(this['fieldDef'], {
      ...this['currentOptions'],
      uniqueItems: true,
      errorMessages: {
        ...this['currentOptions'].errorMessages,
        uniqueItems: message
      }
    })
  }
}
