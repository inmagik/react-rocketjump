import { DebugEmitter, DebugInfo } from './types'
import createDevEmitter from './emitterDev'

let createEmitter: (info: DebugInfo) => DebugEmitter

if (process.env.NODE_ENV === 'production') {
  // Noop emitter
  createEmitter = () => null as any
} else {
  // Dev emitter
  createEmitter = createDevEmitter
}

export default createEmitter
