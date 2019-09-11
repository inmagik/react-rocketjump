import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
import rjLogger from 'react-rocketjump/logger'
import App from './App'

rjLogger()

ReactDOM.render(<App />, document.getElementById('root'))
