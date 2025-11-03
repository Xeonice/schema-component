import type { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'

// 导入 theme 的全局样式
import '@schema-component/theme/styles/globals.css'

const preview: Preview = {
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
