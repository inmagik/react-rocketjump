import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import fs from 'fs'
import pkg from './package.json'

const extensions = ['.ts', '.tsx', '.js', '.jsx']
const plugins = fs.readdirSync('src/plugins').filter((item) => item[0] !== '.')

const vendors = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
]

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id) => pattern.test(id)
}

export default ['esm', 'cjs'].map((format) => ({
  input: {
    index: 'src/index.ts',
    logger: 'src/logger/index.ts',
    ...plugins.reduce(
      (all, plugin) => ({
        ...all,
        [`plugins/${plugin}/index`]: `src/plugins/${plugin}/index.ts`,
      }),
      {}
    ),
  },
  output: [
    {
      dir: 'lib',
      entryFileNames: '[name].[format].js',
      chunkFileNames: '[name].[format].js',
      exports: 'named',
      format,
    },
  ],
  external: makeExternalPredicate(vendors),
  plugins: [
    resolve({ extensions }),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      extensions,
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: format === 'esm',
            // NOTE: Sometimes js world is a pain
            // see: https://github.com/babel/babel/issues/10261
            version: pkg['dependencies']['@babel/runtime'],
          },
        ],
      ],
    }),
  ],
}))
