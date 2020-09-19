import babel from 'rollup-plugin-babel'
import fs from 'fs'
import pkg from './package.json'

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
    index: 'src/index.js',
    logger: 'src/logger/index.js',
    ...plugins.reduce(
      (all, plugin) => ({
        ...all,
        [`plugins/${plugin}/index`]: `src/plugins/${plugin}/index.js`,
      }),
      {}
    ),
  },
  output: [
    {
      dir: 'lib',
      entryFileNames: '[name].[format].js',
      exports: 'named',
      format,
    },
  ],
  external: makeExternalPredicate(vendors),
  plugins: [
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: format === 'esm',
          },
        ],
      ],
    }),
  ],
}))
