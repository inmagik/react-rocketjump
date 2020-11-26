import {
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
  RJ_ERROR_EVENT,
} from './events'
import { AllRjEventsSubject } from './debugger'
import { DebugEventsTypes, DebugInfo } from './types'
import { Action } from '../core/types'

class RjDebugEventEmitter {
  trackId: number
  info: DebugInfo

  constructor(trackId: number, info: DebugInfo) {
    this.trackId = trackId
    this.info = info
  }

  emit(type: DebugEventsTypes, payload: any) {
    AllRjEventsSubject.next({
      type,
      meta: { trackId: this.trackId, info: this.info },
      payload,
    })
  }

  onStateInitialized(state: any) {
    this.emit(RJ_INIT_EVENT, { state })
  }

  onActionDispatched(action: Action, prevState: any, nextState: any) {
    this.emit(RJ_DISPATCH_EVENT, { action, prevState, nextState })
  }

  onError(error: any) {
    this.emit(RJ_ERROR_EVENT, error)
  }

  onTeardown() {
    this.emit(RJ_TEARDOWN_EVENT, {})
  }
}

let trackIdUniq = 0
export default function createEmitter(info: DebugInfo) {
  const emitter = new RjDebugEventEmitter(trackIdUniq, info)
  trackIdUniq++
  return emitter
}

// Test utils to reset the trackIdUniq
export function testUtilResetEmmitersState() {
  trackIdUniq = 0
}
