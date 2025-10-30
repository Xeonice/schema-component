import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// 展示如何使用 Schema 的关联字段类型
// 关联字段支持：One-to-One, One-to-Many, Many-to-One, Many-to-Many
// 实际使用时，您需要从 @schema-component/schema 导入真实的 API

interface RelationFieldDemoProps {
  fieldType: 'o2o' | 'o2m' | 'm2o' | 'm2m'
  fieldOptions: Record<string, any>
  description: string
  example: string
}

const RelationFieldDemo: React.FC<RelationFieldDemoProps> = ({
  fieldType,
  fieldOptions,
  description,
  example
}) => {
  const typeLabels = {
    o2o: 'One-to-One (一对一)',
    o2m: 'One-to-Many (一对多)',
    m2o: 'Many-to-One (多对一)',
    m2m: 'Many-to-Many (多对多)'
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>
        <code>{typeLabels[fieldType]}</code>
      </h3>
      <p style={{ color: '#6b7280' }}>{description}</p>

      <div style={{ marginTop: '16px' }}>
        <h4>字段配置:</h4>
        <pre style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
          {JSON.stringify(fieldOptions, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4>使用示例:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
          {example}
        </pre>
      </div>

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
        <strong>💡 提示：</strong>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
          {fieldType === 'o2o' && '一对一关系适合扩展信息，如用户和用户档案。'}
          {fieldType === 'o2m' && '一对多关系适合层级结构，如用户和文章。'}
          {fieldType === 'm2o' && '多对一关系是一对多的反向关系，如文章和作者。'}
          {fieldType === 'm2m' && '多对多关系需要中间表，如学生和课程。'}
        </p>
      </div>
    </div>
  )
}

const meta: Meta<typeof RelationFieldDemo> = {
  title: 'Schema/Relation Fields',
  component: RelationFieldDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
展示 Schema Component 的关联字段类型及其使用方法。

## 关联字段类型

Schema Component 支持 4 种关联关系：

- **One-to-One (o2o)**: 一对一关系
- **One-to-Many (o2m)**: 一对多关系
- **Many-to-One (m2o)**: 多对一关系
- **Many-to-Many (m2m)**: 多对多关系

每种关系类型都有自己的配置选项和使用场景。
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof RelationFieldDemo>

// One-to-One 一对一关系
export const OneToOne: Story = {
  args: {
    fieldType: 'o2o',
    fieldOptions: {
      target: 'UserProfile',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      required: false
    },
    description: '一对一关系：一个用户对应一个用户档案。适合存储扩展信息。',
    example: `// 用户 Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  profile: field.o2o({
    target: 'UserProfile',
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  })
})

// 用户档案 Schema
const UserProfileSchema = defineSchema('UserProfile', {
  id: field.uuid({ primary: true }),
  userId: field.uuid({ required: true }),
  bio: field.text(),
  avatar: field.string()
})`
  }
}

// One-to-Many 一对多关系
export const OneToMany: Story = {
  args: {
    fieldType: 'o2m',
    fieldOptions: {
      target: 'Post',
      foreignKey: 'authorId',
      onDelete: 'CASCADE',
      eager: false
    },
    description: '一对多关系：一个用户可以有多篇文章。适合层级结构。',
    example: `// 用户 Schema
const UserSchema = defineSchema('User', {
  id: field.uuid({ primary: true }),
  username: field.string({ required: true }),
  posts: field.o2m({
    target: 'Post',
    foreignKey: 'authorId',
    onDelete: 'CASCADE'
  })
})

// 文章 Schema
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  authorId: field.uuid({ required: true }),
  content: field.text()
})`
  }
}

// Many-to-One 多对一关系
export const ManyToOne: Story = {
  args: {
    fieldType: 'm2o',
    fieldOptions: {
      target: 'User',
      foreignKey: 'authorId',
      onDelete: 'SET NULL',
      eager: true
    },
    description: '多对一关系：多篇文章属于同一个作者。是一对多的反向关系。',
    example: `// 文章 Schema
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  authorId: field.uuid({ required: true }),
  author: field.m2o({
    target: 'User',
    foreignKey: 'authorId',
    eager: true
  }),
  content: field.text()
})

// 使用示例
const post = await Post.findOne({
  where: { id: postId },
  include: ['author']  // 自动加载作者信息
})`
  }
}

// Many-to-Many 多对多关系
export const ManyToMany: Story = {
  args: {
    fieldType: 'm2m',
    fieldOptions: {
      target: 'Course',
      through: 'StudentCourse',
      foreignKey: 'studentId',
      otherKey: 'courseId',
      onDelete: 'CASCADE'
    },
    description: '多对多关系：学生可以选修多门课程，课程也可以被多个学生选修。需要中间表。',
    example: `// 学生 Schema
const StudentSchema = defineSchema('Student', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  courses: field.m2m({
    target: 'Course',
    through: 'StudentCourse',
    foreignKey: 'studentId',
    otherKey: 'courseId'
  })
})

// 课程 Schema
const CourseSchema = defineSchema('Course', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  students: field.m2m({
    target: 'Student',
    through: 'StudentCourse',
    foreignKey: 'courseId',
    otherKey: 'studentId'
  })
})

// 中间表 Schema
const StudentCourseSchema = defineSchema('StudentCourse', {
  id: field.uuid({ primary: true }),
  studentId: field.uuid({ required: true }),
  courseId: field.uuid({ required: true }),
  enrolledAt: field.timestamp({ autoCreate: true })
})`
  }
}

// 自引用关系（Self-referencing）
export const SelfReferencing: Story = {
  args: {
    fieldType: 'o2m',
    fieldOptions: {
      target: 'Category',
      foreignKey: 'parentId',
      onDelete: 'CASCADE',
      selfRef: true
    },
    description: '自引用关系：用于树形结构，如分类的父子关系。',
    example: `// 分类 Schema（树形结构）
const CategorySchema = defineSchema('Category', {
  id: field.uuid({ primary: true }),
  name: field.string({ required: true }),
  parentId: field.uuid({ nullable: true }),

  // 父分类（Many-to-One）
  parent: field.m2o({
    target: 'Category',
    foreignKey: 'parentId',
    selfRef: true
  }),

  // 子分类（One-to-Many）
  children: field.o2m({
    target: 'Category',
    foreignKey: 'parentId',
    selfRef: true
  })
})

// 使用示例
const rootCategories = await Category.findMany({
  where: { parentId: null },
  include: {
    children: {
      include: ['children']  // 递归加载
    }
  }
})`
  }
}

// 级联删除配置
export const CascadeOptions: Story = {
  args: {
    fieldType: 'o2m',
    fieldOptions: {
      target: 'Comment',
      foreignKey: 'postId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    description: '级联操作配置：控制关联数据的删除和更新行为。',
    example: `// 级联删除选项
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  comments: field.o2m({
    target: 'Comment',
    foreignKey: 'postId',
    // 级联删除选项：
    // - CASCADE: 删除父记录时，删除所有子记录
    // - SET NULL: 删除父记录时，将外键设为 NULL
    // - RESTRICT: 如果有子记录，禁止删除父记录
    // - NO ACTION: 不做任何操作（数据库默认行为）
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
})

// 删除文章时，所有评论也会被删除
await Post.delete({ id: postId })`
  }
}

// 预加载（Eager Loading）
export const EagerLoading: Story = {
  args: {
    fieldType: 'm2o',
    fieldOptions: {
      target: 'Author',
      foreignKey: 'authorId',
      eager: true,
      select: ['id', 'name', 'email']
    },
    description: '预加载配置：控制关联数据的加载策略，提升查询性能。',
    example: `// 预加载配置
const PostSchema = defineSchema('Post', {
  id: field.uuid({ primary: true }),
  title: field.string({ required: true }),
  authorId: field.uuid({ required: true }),
  author: field.m2o({
    target: 'Author',
    foreignKey: 'authorId',
    // eager: true 表示查询时自动加载关联数据
    eager: true,
    // 可以指定只加载特定字段
    select: ['id', 'name', 'email']
  })
})

// 查询时自动包含作者信息
const posts = await Post.findMany()
// posts[0].author 已经加载

// 也可以手动控制
const postsWithoutAuthor = await Post.findMany({
  include: false  // 覆盖 eager 设置
})`
  }
}
