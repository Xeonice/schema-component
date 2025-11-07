#!/usr/bin/env node
/**
 * scripts/check-dependencies.js
 *
 * 检查包依赖是否符合分层架构原则
 * 规则：theme → react-connector → engine → schema
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 定义分层规则
const LAYERS = {
  schema: {
    level: 0,
    allowedDeps: [],
    description: 'Schema layer - no internal dependencies'
  },
  engine: {
    level: 1,
    allowedDeps: ['schema'],
    description: 'Engine layer - can only depend on schema'
  },
  'react-connector': {
    level: 2,
    allowedDeps: ['engine'],
    description: 'React-Connector layer - can only depend on engine'
  },
  theme: {
    level: 3,
    allowedDeps: ['schema', 'engine', 'react-connector'],
    description: 'Theme layer - can depend on schema, engine, react-connector'
  }
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(color, ...args) {
  console.log(color, ...args, colors.reset)
}

// 检查单个包的依赖
function checkPackage(packageName) {
  const pkgPath = path.join(__dirname, '../packages', packageName, 'package.json')

  if (!fs.existsSync(pkgPath)) {
    log(colors.yellow, `⚠️  Package ${packageName} not found`)
    return { passed: true, warnings: [`Package not found: ${pkgPath}`], errors: [] }
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const layer = LAYERS[packageName]

  if (!layer) {
    log(colors.yellow, `⚠️  ${packageName} is not in layer definition, skipping`)
    return { passed: true, warnings: [`Not in layer definition`], errors: [] }
  }

  // 获取所有内部依赖
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  }

  const internalDeps = Object.keys(allDeps)
    .filter(dep => dep.startsWith('@schema-component/'))
    .map(dep => dep.replace('@schema-component/', ''))

  // 检查是否有违规依赖
  const violations = internalDeps.filter(dep => !layer.allowedDeps.includes(dep))
  const warnings = []
  const errors = []

  if (violations.length > 0) {
    violations.forEach(dep => {
      const depLevel = LAYERS[dep]?.level
      const currentLevel = layer.level

      if (depLevel !== undefined && depLevel > currentLevel) {
        errors.push({
          type: 'reverse-dependency',
          message: `${packageName} depends on ${dep} (reverse dependency - ${dep} is at level ${depLevel}, ${packageName} is at level ${currentLevel})`
        })
      } else {
        errors.push({
          type: 'not-allowed',
          message: `${packageName} depends on ${dep} (not allowed by layer rules)`
        })
      }
    })
  }

  // 检查源代码中的导入
  const srcPath = path.join(__dirname, '../packages', packageName, 'src')
  if (fs.existsSync(srcPath)) {
    const codeViolations = checkSourceImports(packageName, srcPath, layer)
    errors.push(...codeViolations.errors)
    warnings.push(...codeViolations.warnings)
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors,
    internalDeps
  }
}

// 检查源代码中的导入
function checkSourceImports(packageName, srcPath, layer) {
  const errors = []
  const warnings = []

  try {
    // 查找所有 TypeScript 文件
    const findCmd = process.platform === 'win32'
      ? `dir /s /b "${srcPath}\\*.ts" "${srcPath}\\*.tsx"`
      : `find "${srcPath}" -name "*.ts" -o -name "*.tsx"`

    const output = execSync(findCmd, { encoding: 'utf-8' })
    const files = output.trim().split('\n').filter(Boolean)

    files.forEach(file => {
      if (!fs.existsSync(file)) return

      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // 跳过注释行
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
          return
        }

        // 匹配 import 语句（实际的导入，不是注释中的）
        const match = line.match(/^\s*import\s+.*from\s+['"]@schema-component\/([^'"]+)['"]/)
        if (match) {
          const importedPackage = match[1]

          if (!layer.allowedDeps.includes(importedPackage)) {
            const relativePath = path.relative(
              path.join(__dirname, '..'),
              file
            )
            errors.push({
              type: 'source-import',
              message: `${relativePath}:${index + 1} imports @schema-component/${importedPackage} (not allowed)`
            })
          }
        }
      })
    })
  } catch (error) {
    warnings.push({
      type: 'check-failed',
      message: `Could not check source imports: ${error.message}`
    })
  }

  return { errors, warnings }
}

// 生成依赖关系图 (Mermaid)
function generateDependencyGraph() {
  const graph = ['```mermaid', 'graph TD']
  const packages = Object.keys(LAYERS)

  // 定义节点样式
  graph.push('  classDef level0 fill:#e1f5e1,stroke:#4caf50,stroke-width:2px')
  graph.push('  classDef level1 fill:#e3f2fd,stroke:#2196f3,stroke-width:2px')
  graph.push('  classDef level2 fill:#fff3e0,stroke:#ff9800,stroke-width:2px')
  graph.push('  classDef level3 fill:#fce4ec,stroke:#e91e63,stroke-width:2px')
  graph.push('')

  // 添加节点
  packages.forEach(pkg => {
    const layer = LAYERS[pkg]
    graph.push(`  ${pkg}["${pkg}<br/>(Level ${layer.level})"]:::level${layer.level}`)
  })

  graph.push('')

  // 添加边
  packages.forEach(pkg => {
    const layer = LAYERS[pkg]
    layer.allowedDeps.forEach(dep => {
      graph.push(`  ${pkg} -->|depends on| ${dep}`)
    })
  })

  graph.push('```')
  return graph.join('\n')
}

// 生成文本报告
function generateTextReport(results) {
  const lines = []

  lines.push('')
  lines.push('═'.repeat(80))
  lines.push('                    DEPENDENCY CHECK REPORT')
  lines.push('═'.repeat(80))
  lines.push('')

  const packages = Object.keys(LAYERS)
  let totalErrors = 0
  let totalWarnings = 0

  packages.forEach(pkg => {
    const layer = LAYERS[pkg]
    const result = results[pkg]
    const status = result.passed ? '✅ PASS' : '❌ FAIL'

    lines.push(`${status}  ${pkg.padEnd(20)} (Level ${layer.level})`)
    lines.push(`     ${layer.description}`)

    if (result.internalDeps.length > 0) {
      lines.push(`     Dependencies: ${result.internalDeps.join(', ')}`)
    } else {
      lines.push(`     Dependencies: (none)`)
    }

    if (result.errors.length > 0) {
      totalErrors += result.errors.length
      lines.push(`     Errors: ${result.errors.length}`)
      result.errors.forEach(error => {
        lines.push(`       ✗ ${error.message}`)
      })
    }

    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length
      lines.push(`     Warnings: ${result.warnings.length}`)
      result.warnings.forEach(warning => {
        lines.push(`       ⚠ ${warning.message || warning}`)
      })
    }

    lines.push('')
  })

  lines.push('─'.repeat(80))
  lines.push(`Total Errors: ${totalErrors}`)
  lines.push(`Total Warnings: ${totalWarnings}`)
  lines.push('═'.repeat(80))

  return lines.join('\n')
}

// 主函数
function main() {
  console.log('')
  log(colors.cyan + colors.bold, '🔍 Checking Package Dependencies...')
  console.log('')
  log(colors.cyan, 'Layer Architecture: theme → react-connector → engine → schema')
  console.log('')

  const packages = Object.keys(LAYERS)
  const results = {}
  let hasErrors = false
  let hasWarnings = false

  // 检查每个包
  packages.forEach(pkg => {
    log(colors.blue, `\nChecking ${pkg}...`)
    const result = checkPackage(pkg)
    results[pkg] = result

    if (result.passed) {
      log(colors.green, `✅ ${pkg}: All dependencies are valid`)
      if (result.internalDeps.length > 0) {
        log(colors.cyan, `   Dependencies: ${result.internalDeps.join(', ')}`)
      } else {
        log(colors.cyan, `   No internal dependencies`)
      }
    } else {
      log(colors.red, `❌ ${pkg}: Has invalid dependencies`)
      hasErrors = true
    }

    // 显示错误
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        log(colors.red, `   ✗ ${error.message}`)
      })
    }

    // 显示警告
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        log(colors.yellow, `   ⚠ ${warning.message || warning}`)
      })
      hasWarnings = true
    }
  })

  // 生成依赖关系图
  log(colors.cyan, '\n\n📈 Dependency Graph\n')
  console.log(generateDependencyGraph())

  // 生成文本报告
  const report = generateTextReport(results)
  console.log(report)

  // 保存报告到文件
  try {
    const reportPath = path.join(__dirname, '../dependency-report.txt')
    fs.writeFileSync(reportPath, report)
    log(colors.cyan, `\n📄 Report saved to: ${reportPath}`)
  } catch (error) {
    log(colors.yellow, `\n⚠️  Could not save report: ${error.message}`)
  }

  // 最终结果
  console.log('\n' + '═'.repeat(80))
  if (hasErrors) {
    log(colors.red + colors.bold, '\n❌ DEPENDENCY CHECK FAILED!')
    log(colors.red, 'Please fix the dependency violations above.')
    log(colors.cyan, '\nRefer to DEPENDENCY_ANALYSIS.md for the architecture rules.')
    process.exit(1)
  } else if (hasWarnings) {
    log(colors.yellow + colors.bold, '\n⚠️  Dependency check passed with warnings.')
    log(colors.yellow, 'Please review the warnings above.')
    process.exit(0)
  } else {
    log(colors.green + colors.bold, '\n✅ ALL PACKAGE DEPENDENCIES ARE VALID!')
    log(colors.green, 'The layer architecture is correctly maintained.')
    process.exit(0)
  }
}

// 如果直接运行
if (require.main === module) {
  main()
}

module.exports = {
  checkPackage,
  LAYERS,
  generateDependencyGraph
}
