import { RJ_DISPATCH_EVENT, RJ_INIT_EVENT, RJ_TEARDOWN_EVENT } from './events'
import { AllRjEventsSubject } from './debugger'

let RjDebugEventEmitter

if (process.env.NODE_ENV !== 'production') {
  let trackIdUniq = 0
  RjDebugEventEmitter = {
    getTrackId: () => {
      const trackId = trackIdUniq
      trackIdUniq++
      return trackId
    },
    onStateInitialized: (trackId, info, state) => {
      AllRjEventsSubject.next({
        type: RJ_INIT_EVENT,
        trackId,
        payload: { state, info },
      })
    },
    onActionDispatched: (trackId, info, action, prevState, nextState) => {
      AllRjEventsSubject.next({
        type: RJ_DISPATCH_EVENT,
        trackId,
        payload: { action, prevState, nextState, info },
      })
    },
    onTeardown: (trackId, info) => {
      AllRjEventsSubject.next({
        type: RJ_TEARDOWN_EVENT,
        trackId,
        payload: { info },
      })
    },
  }
} else {
  RjDebugEventEmitter = {
    getTrackId: () => {},
    onStateInitialized: () => {},
    onActionDispatched: () => {},
    onTeardown: () => {},
  }
}

export { RjDebugEventEmitter }
