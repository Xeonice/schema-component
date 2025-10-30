# 变更日志 (Changelog)

本文档记录 Schema Component 设计文档的重要变更。

---

## [Unreleased] - 2025-10-30

### 🔄 Changed - 核心技术选型变更

**变更类型**: 技术栈调整

**变更说明**: 将核心验证引擎从 Valibot 更改为 Zod

#### 变更理由

1. **成熟度考量**
   - Zod 经过大规模生产环境验证
   - 社区更活跃，文档更完善
   - 长期维护和支持保障

2. **生态系统优势**
   - 与 tRPC 深度集成
   - React Hook Form 官方支持
   - Next.js、Remix 等框架广泛使用
   - 丰富的第三方工具支持

3. **开发体验**
   - 完整的 API 文档
   - 优秀的 IDE 支持
   - 清晰的错误消息
   - 学习资源丰富

4. **风险评估**
   - 降低技术风险（生产就绪）
   - 提升团队效率（熟悉度高）
   - 保障长期可维护性

#### 技术对比

| 维度 | Zod (新选择) | Valibot (原选择) |
|------|-------------|-----------------|
| 包大小 | 13.5KB | 1.37KB ⭐ |
| 性能 | 中等 | 快 (2x Zod) ⭐ |
| 生态系统 | 成熟 ✅ | 新兴 |
| 社区支持 | 非常活跃 ✅ | 活跃 |
| 生产就绪 | ✅ | ⚠️ |
| 第三方集成 | 丰富 ✅ | 较少 |
| 学习曲线 | 低 ✅ | 低 |
| 文档完善度 | 优秀 ✅ | 良好 |

**权衡**: 虽然 Valibot 在包大小和性能上有优势，但 Zod 的成熟度和生态系统对生产环境更重要。

#### 影响范围

**已更新文档**:
- ✅ `ultrathink-schema-design.md` - 核心设计文档
- ✅ `architecture-decision-records.md` - ADR-001 完全重写
- ✅ `README.md` - 导航和技术栈说明
- ✅ `SUMMARY.md` - 文档总览
- ✅ `api-reference.md` - 添加技术栈说明
- ✅ `implementation-examples.ts` - 添加技术栈注释
- ✅ `best-practices.md` - 添加技术栈说明和生态系统建议

**代码影响**:
- API 设计层保持不变（抽象层）
- 底层实现需从 Valibot 迁移到 Zod
- 所有示例代码保持兼容

**依赖变更**:
```json
{
  "dependencies": {
-   "valibot": "^0.42.0",
+   "zod": "^3.22.0",
    "@sinclair/typebox": "^0.32.0"
  }
}
```

#### 迁移指南

如果您已经基于 Valibot 版本的设计开始实现：

1. **API 层无需改动**
   - `defineSchema()`, `field.*()`, `relation.*()` 等接口保持不变
   - 类型定义保持一致

2. **底层实现迁移**
   ```typescript
   // 之前 (Valibot)
   import * as v from 'valibot'
   const schema = v.object({ name: v.string() })

   // 现在 (Zod)
   import { z } from 'zod'
   const schema = z.object({ name: z.string() })
   ```

3. **验证方法调整**
   ```typescript
   // 之前 (Valibot)
   v.parse(schema, data)

   // 现在 (Zod)
   schema.parse(data)
   schema.safeParse(data)
   ```

4. **错误处理**
   ```typescript
   // Zod 错误格式
   try {
     schema.parse(data)
   } catch (error) {
     if (error instanceof z.ZodError) {
       console.log(error.format())
       console.log(error.flatten())
     }
   }
   ```

#### 后续行动

- [ ] 更新 package.json 依赖
- [ ] 实现基于 Zod 的核心验证层
- [ ] 运行所有测试用例
- [ ] 更新集成示例
- [ ] 发布设计文档 v1.0

#### 相关链接

- [Zod 官方文档](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [ADR-001: 选择 Zod 作为核心验证引擎](./architecture-decision-records.md#adr-001-选择-zod-作为核心验证引擎)

---

## [0.0.0] - 2025-10-30

### ✨ Added - 初始设计

- 📘 创建核心设计文档 (ultrathink-schema-design.md)
- 📗 创建 API 参考手册 (api-reference.md)
- 💻 创建实现示例 (implementation-examples.ts)
- ⚡ 创建最佳实践指南 (best-practices.md)
- 🎯 创建架构决策记录 (architecture-decision-records.md)
- 📄 创建导航索引 (README.md)
- 📊 创建文档总览 (SUMMARY.md)

**技术栈**:
- Valibot (核心验证引擎) - 后改为 Zod
- TypeBox (JSON Schema 序列化)
- TypeScript (类型系统)

**核心特性**:
- 8 种基础字段类型
- 4 种关联字段类型
- 完整的类型推导系统
- withOption 配置包装
- Schema 组合与继承
- 虚拟字段与计算字段

---

## 版本说明

本项目当前处于 **设计阶段**，尚未发布正式版本。

- `[Unreleased]`: 未发布的变更
- `[0.0.0]`: 初始设计版本

---

**最后更新**: 2025-10-30
**文档版本**: 1.0.0-alpha
**状态**: 设计阶段 → 准备实现
