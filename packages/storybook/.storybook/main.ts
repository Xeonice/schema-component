import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: StorybookConfig = {
  // Story 文件匹配
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'
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
    options: {}
  },

  // 文档配置
  docs: {},

  // TypeScript 配置
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript'
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
