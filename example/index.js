import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
import { rj } from 'react-rocketjump'
import rjLogger from 'react-rocketjump/logger'
import App from './App'

rj.flags.debugger = false

rjLogger()

ReactDOM.render(<App />, document.getElementById('root'))
