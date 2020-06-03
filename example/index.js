import './index.css'
import ReactDOM from 'react-dom'
import React from 'react'
import rjLogger from 'react-rocketjump/logger'
import App from './App'
// import { rj } from 'react-rocketjump'

// Disable the debugger code at all
// rj.flags.debugger = false

rjLogger()

ReactDOM.unstable_createRoot(document.getElementById('root')).render(<App />)
