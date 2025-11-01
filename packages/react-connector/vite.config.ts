import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SchemaComponentReactConnector',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'mobx', 'mobx-react-lite'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          mobx: 'mobx',
          'mobx-react-lite': 'mobx-react-lite',
        },
      },
    },
  },
})