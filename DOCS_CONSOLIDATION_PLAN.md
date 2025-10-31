# Documentation Consolidation Plan

**Created**: 2025-10-31
**Version**: 1.0.0
**Purpose**: Comprehensive strategy for consolidating all documentation into Storybook

---

## Executive Summary

This plan consolidates **16 markdown documents** (~350KB total) across the schema-component monorepo into a unified documentation system within Storybook. The goal is to eliminate duplication, create a single source of truth, and improve discoverability while preserving important historical context.

### Key Statistics

| Location | Total Docs | Size | Status |
|----------|-----------|------|--------|
| **Root** | 5 files | ~150KB | Mixed (2 historical, 3 planning) |
| **packages/engine** | 5 files | ~125KB | 4 migrated ✅, 1 current |
| **packages/storybook** | 6 files | ~75KB | All current |
| **Total** | **16 files** | **~350KB** | - |

---

## Document Inventory & Analysis

### Category 1: Root Level Documentation

#### 1.1 ENGINE_DESIGN.md (74KB) 📋 **MIGRATE TO STORYBOOK**

**Content**: Comprehensive engine architecture design
- Function-first design principles
- DDD architecture (Model, Repository, State, Data Access, Render layers)
- Full TypeScript code examples
- Usage patterns and best practices

**Recommendation**: **Migrate to Storybook as MDX** + **Keep as Reference**
- **Action**: Create `/packages/storybook/stories/engine/docs/Architecture.mdx`
- **Reason**: This is THE definitive engine architecture guide
- **Keep Original**: Yes - as reference for contributors
- **Transform**: Break into multiple focused MDX pages:
  - `Architecture.mdx` - Overall architecture
  - `FunctionFirstDesign.mdx` - Core design philosophy
  - `ModelLayer.mdx` - Model layer details
  - `DataAccessLayer.mdx` - HTTP/GraphQL layer
  - `StateManagement.mdx` - MobX integration
  - `RenderSystem.mdx` - Render layer overview

#### 1.2 ENGINE_STORYBOOK_MIGRATION_SUMMARY.md (7.2KB) ✅ **HISTORICAL - KEEP AS-IS**

**Content**: Summary of engine examples migration to storybook
**Created**: 2025-10-31
**Status**: Historical record of Phase 5 completion

**Recommendation**: **Keep as Historical Record**
- **Action**: None
- **Reason**: Documents a completed milestone
- **Location**: Keep in root for project history

#### 1.3 IMPLEMENTATION_PLAN.md (58KB) 📋 **KEEP AS REFERENCE + SUMMARY TO STORYBOOK**

**Content**: Detailed 8-phase implementation plan for @schema-component/engine
- Phase 1: Core infrastructure (✅ Complete)
- Phase 2-8: Detailed implementation steps
- File structures, code templates, timelines

**Recommendation**: **Keep as Project Planning Document** + **Create Summary in Storybook**
- **Action**:
  1. Keep `IMPLEMENTATION_PLAN.md` in root
  2. Create `/packages/storybook/stories/project/DevelopmentRoadmap.mdx` (summary only)
- **Reason**: Too detailed for Storybook, but useful for contributors
- **Storybook Summary**: High-level roadmap and progress tracking

#### 1.4 PHASE1_COMPLETE.md (9KB) ✅ **HISTORICAL - KEEP AS-IS**

**Content**: Phase 1 completion report
**Created**: 2025-10-30

**Recommendation**: **Keep as Historical Record**
- **Action**: None
- **Reason**: Documents a completed milestone

#### 1.5 README.md (1.9KB) ✅ **KEEP AS-IS - ENHANCE**

**Content**: Project root README with tech stack and structure
**Status**: Current and essential

**Recommendation**: **Keep and Enhance**
- **Action**: Add links to Storybook documentation
- **Enhancement**: Add "Documentation" section pointing to Storybook

---

### Category 2: Engine Package Documentation

#### 2.1 ACTION_RENDERER_DESIGN.md (29KB) ✅ **ALREADY MIGRATED - DELETE**

**Content**: Action renderer architecture (ServerAction vs ViewAction)
**Status**: Migrated to Storybook in Phase 5

**Recommendation**: **DELETE**
- **Action**: Remove `packages/engine/ACTION_RENDERER_DESIGN.md`
- **Reason**: Content now in `stories/engine/docs/ActionRendererDesign.mdx`
- **Confirmation**: Check ENGINE_STORYBOOK_MIGRATION_SUMMARY.md confirms migration

#### 2.2 RENDER_ARCHITECTURE.md (29KB) ✅ **ALREADY MIGRATED - DELETE**

**Content**: Overall render layer architecture
**Status**: Migrated to Storybook

**Recommendation**: **DELETE**
- **Action**: Remove `packages/engine/RENDER_ARCHITECTURE.md`
- **Reason**: Content now in `stories/engine/docs/RenderArchitecture.mdx`

#### 2.3 RENDER_DESIGN.md (40KB) ✅ **ALREADY MIGRATED - DELETE**

**Content**: Detailed render system design (DataRenderer, ViewRenderer, ActionRenderer)
**Status**: Migrated to Storybook

**Recommendation**: **DELETE**
- **Action**: Remove `packages/engine/RENDER_DESIGN.md`
- **Reason**: Content now in `stories/engine/docs/RenderDesign.mdx`

#### 2.4 RENDER_LAYER_DESIGN.md (25KB) ✅ **ALREADY MIGRATED - DELETE**

**Content**: Render layer complete design
**Status**: Migrated to Storybook

**Recommendation**: **DELETE**
- **Action**: Remove `packages/engine/RENDER_LAYER_DESIGN.md`
- **Reason**: Content now in `stories/engine/docs/RenderLayerDesign.mdx`

#### 2.5 README.md (1.6KB) ✅ **KEEP AS-IS - ENHANCE**

**Content**: Engine package README
**Status**: Current

**Recommendation**: **Keep and Enhance**
- **Action**: Add links to Storybook documentation
- **Enhancement**: Add "For detailed documentation, see Storybook"

---

### Category 3: Storybook Package Documentation

All Storybook docs are current and properly organized. No changes needed.

#### 3.1 DESIGN.md (24KB) ✅ **KEEP AS-IS**
**Purpose**: Comprehensive Storybook package design
**Status**: Current and essential for Storybook development

#### 3.2 PHASE2-SCHEMA-COMPLETE.md (8.6KB) ✅ **KEEP AS-IS**
**Purpose**: Phase 2 completion report
**Status**: Recent milestone documentation

#### 3.3 README.md (3.9KB) ✅ **KEEP AS-IS**
**Purpose**: Storybook package README
**Status**: Current user-facing documentation

#### 3.4 SUMMARY.md (15KB) ✅ **KEEP AS-IS**
**Purpose**: Storybook package creation summary
**Status**: Historical record with current information

#### 3.5 UPGRADE-NOTES.md (3.4KB) ✅ **KEEP AS-IS**
**Purpose**: Storybook v9 upgrade notes
**Status**: Current technical documentation

#### 3.6 UPGRADE-TO-V9.md (8.9KB) ✅ **KEEP AS-IS**
**Purpose**: Detailed v8.6 upgrade guide
**Status**: Current technical documentation

---

## Consolidation Strategy

### Phase 1: Immediate Actions (Week 1)

#### 1.1 Delete Migrated Engine Docs ✅ HIGH PRIORITY

```bash
cd packages/engine
rm ACTION_RENDERER_DESIGN.md
rm RENDER_ARCHITECTURE.md
rm RENDER_DESIGN.md
rm RENDER_LAYER_DESIGN.md
```

**Impact**: Eliminates 123KB of duplicate content

#### 1.2 Create Engine Architecture in Storybook

**New MDX Structure**:
```
packages/storybook/stories/engine/docs/
├── Architecture/
│   ├── Overview.mdx                  # High-level architecture
│   ├── FunctionFirstDesign.mdx       # Core philosophy
│   ├── LayeredArchitecture.mdx       # 5-layer design
│   └── DesignPrinciples.mdx          # DDD principles
│
├── CoreLayers/
│   ├── ModelLayer.mdx                # defineModel, BaseModel
│   ├── RepositoryLayer.mdx           # Data access coordination
│   ├── StateLayer.mdx                # MobX state management
│   └── DataAccessLayer.mdx           # HTTP/GraphQL/WebSocket
│
└── RenderSystem/
    ├── RenderArchitecture.mdx        # ✅ Already exists
    ├── RenderDesign.mdx              # ✅ Already exists
    ├── RenderLayerDesign.mdx         # ✅ Already exists
    └── ActionRendererDesign.mdx      # ✅ Already exists
```

**Content Source**: Extract from `ENGINE_DESIGN.md`
**Estimated Work**: 2-3 days

#### 1.3 Enhance Root README.md

Add documentation section:

```markdown
## Documentation

Complete documentation is available in our Storybook:

- **Live Documentation**: [Storybook (link when deployed)]
- **Local Development**: `pnpm storybook`

### Quick Links
- [Architecture Guide](packages/storybook/stories/engine/docs/Architecture.mdx)
- [Schema System](packages/storybook/stories/schema/Overview.mdx)
- [Getting Started](packages/storybook/stories/GettingStarted.mdx)

### Project Planning
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [Phase 1 Complete](PHASE1_COMPLETE.md) - Core infrastructure milestone
```

---

### Phase 2: Content Migration (Week 2-3)

#### 2.1 Migrate ENGINE_DESIGN.md Content

**Task**: Break down 74KB into focused MDX pages

**Mapping**:

| Section in ENGINE_DESIGN.md | New MDX Location | Estimated Pages |
|------------------------------|------------------|-----------------|
| Overview + Design Principles | `Architecture/Overview.mdx` | 1 page |
| Function-First Design | `Architecture/FunctionFirstDesign.mdx` | 1 page |
| Model Layer | `CoreLayers/ModelLayer.mdx` | 3 pages |
| Repository Layer | `CoreLayers/RepositoryLayer.mdx` | 2 pages |
| State Layer (MobX) | `CoreLayers/StateLayer.mdx` | 2 pages |
| Data Access Layer | `CoreLayers/DataAccessLayer.mdx` | 3 pages |
| Event System | `CoreLayers/EventSystem.mdx` | 1 page |
| DI Container | `CoreLayers/DIContainer.mdx` | 1 page |
| Usage Examples | Integrated into each page | - |

**Work Estimate**: 16-20 hours

#### 2.2 Create Development Roadmap in Storybook

**New File**: `packages/storybook/stories/project/DevelopmentRoadmap.mdx`

**Content** (Summary from IMPLEMENTATION_PLAN.md):
- High-level phase overview
- Current progress
- Completed milestones
- Upcoming features
- Link to full IMPLEMENTATION_PLAN.md for details

**Work Estimate**: 4 hours

---

### Phase 3: Organization & Navigation (Week 3)

#### 3.1 Storybook Structure (Updated)

```
packages/storybook/stories/
├── Introduction.mdx                   # ✅ Exists
├── GettingStarted.mdx                 # ✅ Exists
│
├── project/                           # 🆕 NEW CATEGORY
│   ├── Overview.mdx                   # Project overview
│   ├── DevelopmentRoadmap.mdx         # High-level roadmap
│   └── Contributing.mdx               # How to contribute
│
├── schema/                            # ✅ Exists (37 examples)
│   ├── Overview.mdx
│   ├── BasicFields.stories.tsx
│   ├── RelationFields.stories.tsx
│   ├── Validation.stories.tsx
│   └── TypeInference.stories.tsx
│
├── engine/                            # ✅ Exists + 🆕 EXPAND
│   ├── Overview.mdx                   # ✅ Exists
│   ├── GettingStarted.stories.tsx     # ✅ Exists
│   │
│   ├── docs/                          # 🆕 DOCUMENTATION SECTION
│   │   ├── Architecture/              # 🆕 From ENGINE_DESIGN.md
│   │   │   ├── Overview.mdx
│   │   │   ├── FunctionFirstDesign.mdx
│   │   │   ├── LayeredArchitecture.mdx
│   │   │   └── DesignPrinciples.mdx
│   │   │
│   │   ├── CoreLayers/                # 🆕 From ENGINE_DESIGN.md
│   │   │   ├── ModelLayer.mdx
│   │   │   ├── RepositoryLayer.mdx
│   │   │   ├── StateLayer.mdx
│   │   │   └── DataAccessLayer.mdx
│   │   │
│   │   └── RenderSystem/              # ✅ Already migrated
│   │       ├── RenderArchitecture.mdx
│   │       ├── RenderDesign.mdx
│   │       ├── RenderLayerDesign.mdx
│   │       └── ActionRendererDesign.mdx
│   │
│   └── [other existing stories]       # ✅ 108 examples
│
└── [theme/, examples/]                # Future expansion
```

#### 3.2 Navigation Updates

**Storybook Sidebar Organization**:
```
📘 Introduction
📘 Getting Started

📂 Project
  📄 Overview
  📄 Development Roadmap
  📄 Contributing

📂 Schema (37 examples)
  📄 Overview
  🎨 Basic Fields
  🎨 Relation Fields
  🎨 Validation
  🎨 Type Inference

📂 Engine (108 examples)
  📄 Overview
  📂 Architecture
    📄 Overview
    📄 Function-First Design
    📄 Layered Architecture
    📄 Design Principles
  📂 Core Layers
    📄 Model Layer
    📄 Repository Layer
    📄 State Layer
    📄 Data Access Layer
  📂 Render System
    📄 Render Architecture
    📄 Render Design
    📄 Render Layer Design
    📄 Action Renderer Design
  📂 Examples
    🎨 [108 interactive examples]
```

---

## File Disposition Matrix

### 🔴 DELETE (4 files - 123KB)

| File | Reason | Confirmation |
|------|--------|--------------|
| `packages/engine/ACTION_RENDERER_DESIGN.md` | Migrated to Storybook ✅ | Check Storybook stories |
| `packages/engine/RENDER_ARCHITECTURE.md` | Migrated to Storybook ✅ | Check Storybook stories |
| `packages/engine/RENDER_DESIGN.md` | Migrated to Storybook ✅ | Check Storybook stories |
| `packages/engine/RENDER_LAYER_DESIGN.md` | Migrated to Storybook ✅ | Check Storybook stories |

### 🟢 KEEP AS-IS (8 files - 50KB)

| File | Category | Purpose |
|------|----------|---------|
| `README.md` (root) | Entry Point | Project overview |
| `PHASE1_COMPLETE.md` (root) | Historical | Milestone record |
| `ENGINE_STORYBOOK_MIGRATION_SUMMARY.md` (root) | Historical | Phase 5 record |
| `packages/engine/README.md` | Entry Point | Package overview |
| `packages/storybook/DESIGN.md` | Reference | Storybook design |
| `packages/storybook/PHASE2-SCHEMA-COMPLETE.md` | Historical | Milestone record |
| `packages/storybook/README.md` | Entry Point | Package overview |
| `packages/storybook/SUMMARY.md` | Reference | Package summary |

### 🟡 ENHANCE (2 files)

| File | Enhancement |
|------|-------------|
| `README.md` (root) | Add documentation section linking to Storybook |
| `packages/engine/README.md` | Add Storybook documentation links |

### 📋 MIGRATE TO STORYBOOK (2 files - 132KB)

| File | Target Location | Work |
|------|----------------|------|
| `ENGINE_DESIGN.md` | `stories/engine/docs/Architecture/*` + `CoreLayers/*` | Break into 10-15 MDX pages |
| `IMPLEMENTATION_PLAN.md` | `stories/project/DevelopmentRoadmap.mdx` (summary) | Extract key milestones |

### ✅ KEEP AS REFERENCE (2 files)

| File | Reason |
|------|--------|
| `ENGINE_DESIGN.md` | After migration, keep as contributor reference |
| `IMPLEMENTATION_PLAN.md` | Too detailed for Storybook, essential for planning |

---

## Expected Outcomes

### After Consolidation

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Docs** | 16 files | 12 files | -25% |
| **Duplicate Content** | ~123KB | 0KB | -100% |
| **Storybook MDX Pages** | 12 | 27 | +125% |
| **Single Source of Truth** | No | Yes ✅ | - |
| **Documentation Coverage** | 70% | 95% | +25% |

### Benefits

1. **Discoverability** ⬆️
   - All documentation in one place (Storybook)
   - Searchable, navigable, interactive
   - Consistent structure

2. **Maintainability** ⬆️
   - No duplicate content to update
   - Single source of truth
   - Version controlled with code

3. **Developer Experience** ⬆️
   - Interactive examples with documentation
   - Live code playground
   - Visual representation

4. **Clarity** ⬆️
   - Clear separation: Storybook (docs) vs Root (planning/history)
   - Focused MDX pages vs monolithic markdown files
   - Better information architecture

---

## Implementation Timeline

### Week 1: Cleanup & Foundation
- **Day 1-2**: Delete 4 migrated engine docs ✅
- **Day 3-4**: Enhance root README with doc links
- **Day 5**: Create project/ category structure in Storybook

### Week 2-3: Content Migration
- **Days 1-5**: Migrate ENGINE_DESIGN.md content (10-15 MDX pages)
- **Days 6-7**: Create DevelopmentRoadmap.mdx summary
- **Days 8-10**: Review, polish, add cross-links

### Week 4: Validation & Polish
- **Day 1-2**: Test all Storybook links and navigation
- **Day 3**: Update all package READMEs with Storybook links
- **Day 4**: Create migration completion report
- **Day 5**: Deploy updated Storybook

**Total Effort**: ~80-100 hours (2-2.5 weeks full-time)

---

## Risk Assessment

### Low Risk ✅
- Deleting migrated docs (confirmed in ENGINE_STORYBOOK_MIGRATION_SUMMARY.md)
- Enhancing READMEs (additive only)
- Creating new Storybook pages (doesn't affect existing)

### Medium Risk ⚠️
- Breaking ENGINE_DESIGN.md into multiple pages (ensure no content loss)
- Navigation restructuring (may confuse existing users temporarily)

### Mitigation Strategies
1. **Backup**: Git commit before any deletions
2. **Validation**: Cross-reference all content before deletion
3. **Incremental**: Deploy changes incrementally, not all at once
4. **Communication**: Update team on new documentation structure

---

## Success Metrics

### Quantitative
- [ ] Zero duplicate content between /root, /engine, /storybook
- [ ] 100% of engine architecture documented in Storybook
- [ ] <20 files in documentation inventory (from 16)
- [ ] 95%+ documentation coverage in Storybook

### Qualitative
- [ ] New contributors can find docs easily
- [ ] All architectural decisions documented
- [ ] Clear separation: docs (Storybook) vs planning (root)
- [ ] Positive feedback from team

---

## Future Considerations

### Post-Consolidation
1. **Versioning**: Consider version-specific documentation
2. **Search**: Implement full-text search in Storybook
3. **i18n**: Plan for multi-language support
4. **Video**: Add video tutorials for complex topics
5. **API Playground**: Interactive API testing in Storybook

### Maintenance
1. **Documentation Reviews**: Quarterly review cycle
2. **Link Checking**: Automated link validation
3. **Content Freshness**: Flag outdated content
4. **User Feedback**: Collect feedback on documentation quality

---

## Appendix: Quick Reference

### Files to Delete (Immediate Action)
```bash
packages/engine/ACTION_RENDERER_DESIGN.md
packages/engine/RENDER_ARCHITECTURE.md
packages/engine/RENDER_DESIGN.md
packages/engine/RENDER_LAYER_DESIGN.md
```

### Files to Keep (No Changes)
```
README.md (root)
PHASE1_COMPLETE.md
ENGINE_STORYBOOK_MIGRATION_SUMMARY.md
packages/engine/README.md
packages/storybook/DESIGN.md
packages/storybook/PHASE2-SCHEMA-COMPLETE.md
packages/storybook/README.md
packages/storybook/SUMMARY.md
packages/storybook/UPGRADE-NOTES.md
packages/storybook/UPGRADE-TO-V9.md
```

### Files to Migrate (Extract to Storybook)
```
ENGINE_DESIGN.md → stories/engine/docs/Architecture/* + CoreLayers/*
IMPLEMENTATION_PLAN.md → stories/project/DevelopmentRoadmap.mdx (summary)
```

### Files to Enhance (Add Links)
```
README.md (root) → Add documentation section
packages/engine/README.md → Add Storybook links
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-31
**Status**: Ready for Implementation
**Approved By**: [Pending]
