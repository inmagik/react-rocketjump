import { RJ_DISPATCH_EVENT, RJ_INIT_EVENT, RJ_TEARDOWN_EVENT } from './events'
import { AllRjEventsSubject } from './debugger'

class RjDebugEventEmitter {
  constructor(trackId, info) {
    this.trackId = trackId
    this.info = info
  }

  emit(type, payload = {}) {
    if (process.env.NODE_ENV !== 'production') {
      AllRjEventsSubject.next({
        type,
        meta: { trackId: this.trackId, info: this.info },
        payload,
      })
    }
  }

  onStateInitialized(state) {
    this.emit(RJ_INIT_EVENT, { state })
  }

  onActionDispatched(action, prevState, nextState) {
    this.emit(RJ_DISPATCH_EVENT, { action, prevState, nextState })
  }

  onTeardown() {
    this.emit(RJ_TEARDOWN_EVENT)
  }
}

let trackIdUniq = 0
export default function createEmitter(info) {
  const emitter = new RjDebugEventEmitter(trackIdUniq, info)
  if (process.env.NODE_ENV !== 'production') {
    trackIdUniq++
  }
  return emitter
}
