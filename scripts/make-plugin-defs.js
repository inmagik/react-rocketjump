const fs = require('fs')
const rimraf = require('rimraf')

const plugins = fs.readdirSync('src/plugins').filter(item => item[0] !== '.')

rimraf.sync('plugins')

fs.mkdirSync('plugins')

plugins.forEach(plugin => {
  fs.mkdirSync('plugins/' + plugin)
  fs.writeFileSync(
    'plugins/' + plugin + '/package.json',
    JSON.stringify(
      {
        name: 'react-rocketjump/plugins/' + plugin,
        private: true,
        main: '../../lib/plugins/' + plugin + '/index.cjs.js',
        module: '../../lib/plugins/' + plugin + '/index.es.js',
      },
      null,
      2
    )
  )
})
