import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// 展示 Schema 的验证功能
// 使用 Zod 作为核心验证引擎，提供强大的类型验证和错误处理
// 实际使用时，您需要从 @schema-component/schema 导入真实的 API

interface ValidationDemoProps {
  validationType: string
  fieldDefinition: string
  testCases: Array<{
    input: any
    valid: boolean
    error?: string
  }>
  description: string
}

const ValidationDemo: React.FC<ValidationDemoProps> = ({
  validationType,
  fieldDefinition,
  testCases,
  description
}) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>
        <code>{validationType}</code>
      </h3>
      <p style={{ color: '#6b7280' }}>{description}</p>

      <div style={{ marginTop: '16px' }}>
        <h4>字段定义:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px'
        }}>
          {fieldDefinition}
        </pre>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4>验证测试:</h4>
        {testCases.map((testCase, index) => (
          <div
            key={index}
            style={{
              marginBottom: '8px',
              padding: '12px',
              backgroundColor: testCase.valid ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${testCase.valid ? '#86efac' : '#fca5a5'}`,
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>
                {testCase.valid ? '✅' : '❌'}
              </span>
              <code style={{ flex: 1 }}>
                {JSON.stringify(testCase.input)}
              </code>
            </div>
            {!testCase.valid && testCase.error && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>
                错误: {testCase.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const meta: Meta<typeof ValidationDemo> = {
  title: 'Schema/Validation',
  component: ValidationDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
展示 Schema Component 的验证功能。

## 验证系统

基于 Zod 构建的强大验证系统，提供：

- 🔍 **类型验证**: 自动进行类型检查
- ✅ **规则验证**: 支持丰富的验证规则
- 🎯 **自定义验证**: 支持自定义验证逻辑
- 🌐 **国际化**: 支持自定义错误消息
- ⚡ **高性能**: 优化的验证引擎
- 🔗 **组合验证**: 支持 AND/OR/NOT 逻辑组合

## 验证类型

- 基础类型验证（字符串、数字、布尔等）
- 格式验证（邮箱、URL、UUID 等）
- 范围验证（长度、大小、日期范围等）
- 正则表达式验证
- 自定义验证函数
- 跨字段验证
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ValidationDemo>

// 字符串长度验证
export const StringLength: Story = {
  args: {
    validationType: '字符串长度验证',
    fieldDefinition: `const username = field.string({
  minLength: 3,
  maxLength: 20,
  required: true,
  errorMessages: {
    minLength: '用户名至少3个字符',
    maxLength: '用户名最多20个字符',
    required: '用户名不能为空'
  }
})`,
    testCases: [
      { input: 'ab', valid: false, error: '用户名至少3个字符' },
      { input: 'abc', valid: true },
      { input: 'validusername', valid: true },
      { input: 'thisusernameistoolong', valid: false, error: '用户名最多20个字符' },
      { input: '', valid: false, error: '用户名不能为空' }
    ],
    description: '验证字符串的长度范围，确保输入符合预期长度。'
  }
}

// 邮箱格式验证
export const EmailFormat: Story = {
  args: {
    validationType: '邮箱格式验证',
    fieldDefinition: `const email = field.email({
  required: true,
  lowercase: true,
  unique: true,
  errorMessages: {
    invalid: '请输入有效的邮箱地址',
    required: '邮箱不能为空',
    unique: '该邮箱已被注册'
  }
})`,
    testCases: [
      { input: 'user@example.com', valid: true },
      { input: 'User@Example.COM', valid: true },
      { input: 'invalid.email', valid: false, error: '请输入有效的邮箱地址' },
      { input: '@example.com', valid: false, error: '请输入有效的邮箱地址' },
      { input: 'user@', valid: false, error: '请输入有效的邮箱地址' }
    ],
    description: '验证邮箱地址格式，支持自动转换为小写和唯一性检查。'
  }
}

// 数字范围验证
export const NumberRange: Story = {
  args: {
    validationType: '数字范围验证',
    fieldDefinition: `const age = field.integer({
  min: 0,
  max: 150,
  required: true,
  errorMessages: {
    min: '年龄不能为负数',
    max: '年龄不能超过150岁',
    required: '年龄不能为空',
    type: '年龄必须是整数'
  }
})`,
    testCases: [
      { input: -1, valid: false, error: '年龄不能为负数' },
      { input: 0, valid: true },
      { input: 25, valid: true },
      { input: 150, valid: true },
      { input: 151, valid: false, error: '年龄不能超过150岁' },
      { input: 25.5, valid: false, error: '年龄必须是整数' }
    ],
    description: '验证数字的范围，确保数值在合理区间内。'
  }
}

// 正则表达式验证
export const RegexPattern: Story = {
  args: {
    validationType: '正则表达式验证',
    fieldDefinition: `const phoneNumber = field.string({
  pattern: /^1[3-9]\\d{9}$/,
  required: true,
  errorMessages: {
    pattern: '请输入有效的中国大陆手机号码',
    required: '手机号码不能为空'
  }
})`,
    testCases: [
      { input: '13812345678', valid: true },
      { input: '19987654321', valid: true },
      { input: '12345678901', valid: false, error: '请输入有效的中国大陆手机号码' },
      { input: '1381234567', valid: false, error: '请输入有效的中国大陆手机号码' },
      { input: 'abcdefghijk', valid: false, error: '请输入有效的中国大陆手机号码' }
    ],
    description: '使用正则表达式进行自定义格式验证，如手机号码、身份证号等。'
  }
}

// 枚举值验证
export const EnumValues: Story = {
  args: {
    validationType: '枚举值验证',
    fieldDefinition: `const status = field.enum({
  values: ['pending', 'active', 'inactive', 'deleted'],
  required: true,
  default: 'pending',
  errorMessages: {
    invalid: '状态值必须是: pending, active, inactive, deleted 之一',
    required: '状态不能为空'
  }
})`,
    testCases: [
      { input: 'pending', valid: true },
      { input: 'active', valid: true },
      { input: 'invalid', valid: false, error: '状态值必须是: pending, active, inactive, deleted 之一' },
      { input: 'Active', valid: false, error: '状态值必须是: pending, active, inactive, deleted 之一' },
      { input: '', valid: false, error: '状态不能为空' }
    ],
    description: '限制字段值为预定义的枚举列表，确保数据一致性。'
  }
}

// 自定义验证函数
export const CustomValidation: Story = {
  args: {
    validationType: '自定义验证函数',
    fieldDefinition: `const password = field.string({
  minLength: 8,
  required: true,
  custom: (value) => {
    // 至少包含一个大写字母、一个小写字母和一个数字
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return '密码必须包含大写字母、小写字母和数字'
    }
    return true
  }
})`,
    testCases: [
      { input: 'Password123', valid: true },
      { input: 'password123', valid: false, error: '密码必须包含大写字母、小写字母和数字' },
      { input: 'PASSWORD123', valid: false, error: '密码必须包含大写字母、小写字母和数字' },
      { input: 'PasswordABC', valid: false, error: '密码必须包含大写字母、小写字母和数字' },
      { input: 'Pass1', valid: false, error: '密码至少8个字符' }
    ],
    description: '使用自定义函数实现复杂的验证逻辑，如密码强度检查。'
  }
}

// 日期范围验证
export const DateRange: Story = {
  args: {
    validationType: '日期范围验证',
    fieldDefinition: `const birthDate = field.date({
  min: new Date('1900-01-01'),
  max: new Date(),  // 不能晚于今天
  required: true,
  errorMessages: {
    min: '出生日期不能早于1900年',
    max: '出生日期不能晚于今天',
    required: '出生日期不能为空'
  }
})`,
    testCases: [
      { input: '2000-01-01', valid: true },
      { input: '1899-12-31', valid: false, error: '出生日期不能早于1900年' },
      { input: new Date().toISOString().split('T')[0], valid: true },
      { input: '2099-01-01', valid: false, error: '出生日期不能晚于今天' }
    ],
    description: '验证日期范围，确保日期在合理的时间区间内。'
  }
}

// 数组验证
export const ArrayValidation: Story = {
  args: {
    validationType: '数组验证',
    fieldDefinition: `const tags = field.array({
  items: field.string({ minLength: 2, maxLength: 20 }),
  minItems: 1,
  maxItems: 5,
  unique: true,
  required: true,
  errorMessages: {
    minItems: '至少需要1个标签',
    maxItems: '最多只能有5个标签',
    unique: '标签不能重复',
    required: '标签不能为空'
  }
})`,
    testCases: [
      { input: ['react', 'typescript'], valid: true },
      { input: [], valid: false, error: '至少需要1个标签' },
      { input: ['a'], valid: false, error: '标签长度至少2个字符' },
      { input: ['react', 'vue', 'angular', 'svelte', 'solid', 'preact'], valid: false, error: '最多只能有5个标签' },
      { input: ['react', 'react'], valid: false, error: '标签不能重复' }
    ],
    description: '验证数组的元素类型、数量和唯一性。'
  }
}

// 跨字段验证
export const CrossFieldValidation: Story = {
  args: {
    validationType: '跨字段验证',
    fieldDefinition: `const UserSchema = defineSchema('User', {
  password: field.string({ minLength: 8, required: true }),
  confirmPassword: field.string({ required: true })
}, {
  validate: (data) => {
    if (data.password !== data.confirmPassword) {
      return {
        field: 'confirmPassword',
        message: '两次输入的密码不一致'
      }
    }
    return true
  }
})`,
    testCases: [
      { input: { password: 'Password123', confirmPassword: 'Password123' }, valid: true },
      { input: { password: 'Password123', confirmPassword: 'Password456' }, valid: false, error: '两次输入的密码不一致' },
      { input: { password: 'Pass', confirmPassword: 'Pass' }, valid: false, error: '密码至少8个字符' }
    ],
    description: '验证多个字段之间的关系，如密码确认、日期范围等。'
  }
}

// 条件验证
export const ConditionalValidation: Story = {
  args: {
    validationType: '条件验证',
    fieldDefinition: `const UserSchema = defineSchema('User', {
  accountType: field.enum({
    values: ['personal', 'business'],
    required: true
  }),
  companyName: field.string({
    required: false,
    requiredIf: (data) => data.accountType === 'business',
    errorMessages: {
      requiredIf: '企业账户必须填写公司名称'
    }
  }),
  taxId: field.string({
    required: false,
    requiredIf: (data) => data.accountType === 'business'
  })
})`,
    testCases: [
      { input: { accountType: 'personal' }, valid: true },
      { input: { accountType: 'business', companyName: 'ACME Corp', taxId: '123456' }, valid: true },
      { input: { accountType: 'business' }, valid: false, error: '企业账户必须填写公司名称' },
      { input: { accountType: 'business', companyName: 'ACME Corp' }, valid: false, error: '企业账户必须填写税号' }
    ],
    description: '根据其他字段的值动态调整验证规则。'
  }
}

// 异步验证
export const AsyncValidation: Story = {
  args: {
    validationType: '异步验证',
    fieldDefinition: `const username = field.string({
  required: true,
  unique: true,
  asyncValidate: async (value) => {
    // 模拟 API 调用检查用户名是否已存在
    const exists = await checkUsernameExists(value)
    if (exists) {
      return '该用户名已被占用'
    }
    return true
  }
})`,
    testCases: [
      { input: 'newuser', valid: true },
      { input: 'admin', valid: false, error: '该用户名已被占用' },
      { input: 'existinguser', valid: false, error: '该用户名已被占用' }
    ],
    description: '支持异步验证，如检查数据库中的唯一性、调用外部 API 等。'
  }
}

// 组合验证（AND/OR）
export const CombinedValidation: Story = {
  args: {
    validationType: '组合验证逻辑',
    fieldDefinition: `const contactField = field.string({
  required: true,
  // 必须是邮箱或手机号之一
  or: [
    { type: 'email' },
    { pattern: /^1[3-9]\\d{9}$/ }
  ],
  errorMessages: {
    or: '请输入有效的邮箱地址或手机号码'
  }
})

// 或者使用 AND 组合
const securePassword = field.string({
  required: true,
  and: [
    { minLength: 8 },
    { pattern: /[A-Z]/ },
    { pattern: /[a-z]/ },
    { pattern: /[0-9]/ },
    { pattern: /[!@#$%^&*]/ }
  ],
  errorMessages: {
    and: '密码必须至少8位，包含大小写字母、数字和特殊字符'
  }
})`,
    testCases: [
      { input: 'user@example.com', valid: true },
      { input: '13812345678', valid: true },
      { input: 'invalid', valid: false, error: '请输入有效的邮箱地址或手机号码' },
      { input: '12345', valid: false, error: '请输入有效的邮箱地址或手机号码' }
    ],
    description: '使用 AND/OR 逻辑组合多个验证规则，实现复杂的验证场景。'
  }
}
