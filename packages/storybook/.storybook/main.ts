import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import path from 'path'

const config: StorybookConfig = {
  // Story 文件匹配
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../docs/**/*.mdx'
  ],

  // 插件配置
  addons: [
    '@storybook/addon-essentials',      // 必备插件集合
    '@storybook/addon-interactions',     // 交互测试
    '@storybook/addon-links',            // Story 链接
    '@storybook/addon-a11y',             // 无障碍检查
    '@storybook/addon-themes',           // 主题切换
    'storybook-dark-mode',               // 暗黑模式
    '@storybook/addon-storysource'       // 源码展示
  ],

  // 框架配置
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '../vite.config.ts'
      }
    }
  },

  // 文档配置
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  },

  // TypeScript 配置
  typescript: {
    check: true,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        // 过滤掉 node_modules 中的 props
        return prop.parent
          ? !/node_modules/.test(prop.parent.fileName)
          : true
      }
    }
  },

  // Vite 配置定制
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@schema-component/schema': path.resolve(__dirname, '../../schema/src'),
          '@schema-component/engine': path.resolve(__dirname, '../../engine/src'),
          '@schema-component/theme': path.resolve(__dirname, '../../theme/src'),
          '@': path.resolve(__dirname, '../src')
        }
      },
      define: {
        'process.env': {}
      }
    })
  },

  // 静态文件目录
  staticDirs: ['../public']
}

export default config
