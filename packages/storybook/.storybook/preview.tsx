import type { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import { ThemeProvider, initializeTheme } from '@schema-component/theme'
import { RenderContextProvider, registerReactComponent } from '@schema-component/react-connector'
import { createEngineContext, type RenderContext } from '@schema-component/engine'
import React from 'react'

// 导入统一的模型注册函数
import { registerDemoModels } from '../stories/models'

// 导入 theme 的全局样式
// 通过 main.cjs 中的正则 alias 精确匹配到 theme/dist/style.css
import '@schema-component/theme/style.css'

// 初始化 Theme 渲染器到 Engine
initializeTheme(registerReactComponent)

// 创建 EngineContext 实例
const engineContext = createEngineContext({
  debug: true
})

// 统一注册所有演示模型
registerDemoModels(engineContext)

// 使用 EngineContext 创建全局 RenderContext
// RenderContext 不包含 modelName，支持同时渲染多个不同 Model 的 View
const renderContext: RenderContext = engineContext.createRenderContext()

const preview: Preview = {
  // 全局装饰器 - 使用 ThemeProvider 和 RenderContextProvider 包裹所有 stories
  decorators: [
    (Story) => (
      <ThemeProvider>
        <RenderContextProvider engineContext={renderContext}>
          <Story />
        </RenderContextProvider>
      </ThemeProvider>
    ),
  ],

  // 全局参数
  parameters: {
    // 操作配置
    actions: {
      argTypesRegex: '^on[A-Z].*'
    },

    // 控件配置
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      },
      expanded: true,
      sort: 'requiredFirst'
    },

    // 文档配置
    docs: {
      theme: themes.light,
      toc: {
        title: 'Table of Contents',
        headingSelector: 'h2, h3'
      }
    },

    // 视口配置
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px'
          }
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px'
          }
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px'
          }
        },
        wide: {
          name: 'Wide',
          styles: {
            width: '1920px',
            height: '1080px'
          }
        }
      }
    },

    // 背景配置
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#1a1a1a'
        },
        {
          name: 'gray',
          value: '#f5f5f5'
        }
      ]
    },

    // 布局
    layout: 'padded',

    // 选项
    options: {
      storySort: {
        order: [
          'Introduction',
          'Getting Started',
          'Schema',
          ['Overview', 'Basic Fields', 'Relation Fields', 'Validation', 'Type Inference'],
          'Engine',
          ['Overview', 'Rendering', 'Data Binding', 'Lifecycle'],
          'Theme',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Components'],
          'Examples',
          '*'
        ]
      }
    }
  },

  // 全局类型
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'circlehollow' },
          { value: 'dark', title: 'Dark', icon: 'circle' }
        ],
        dynamicTitle: true
      }
    }
  }
}

export default preview
