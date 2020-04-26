module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        ...(process.env.NODE_ENV === 'test' && {
          targets: {
            node: 'current',
          },
        }),
      },
    ],
    '@babel/preset-react'
  ],
  plugins: [
    'babel-plugin-macros',
  ],
}
