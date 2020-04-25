import babel from 'rollup-plugin-babel'
import fs from 'fs'
import pkg from './package.json'

const plugins = fs
  .readdirSync('src/plugins')
  .filter(item => item[0] !== '.')

const vendors = []
  // Make all external dependencies to be exclude from rollup
  .concat(
    Object.keys(pkg.dependencies),
    Object.keys(pkg.peerDependencies),
    'rxjs/operators',
    'rxjs/ajax',
    'rocketjump-core/utils',
  )

export default ['esm', 'cjs'].map(format => ({
  input: {
    'index': 'src/index.js',
    'logger': 'src/logger/index.js',
    ...plugins.reduce((all, plugin) => ({
      ...all,
      [`plugins/${plugin}/index`]: `src/plugins/${plugin}/index.js`
    }), {})
  },
  output: [
    {
      dir: 'lib',
      entryFileNames: '[name].[format].js',
      exports: 'named',
      format
    }
  ],
  external: vendors,
  plugins: [babel({ exclude: 'node_modules/**' })],
}))
