import rj from '../../rj'
import useRj from '../../useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import {
  PENDING,
  SUCCESS,
  FAILURE,
  CLEAN,
  RUN,
  CANCEL,
} from '../../actionTypes'
import {
  RjDebugEvents,
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
} from '../../debugger/index'

describe('RJ Debugger', () => {
  it('should call RJ_INIT_EVENT when state is initalized', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      effect,
    })

    renderHook(() => useRj(maRjState))

    expect(mockCallback).nthCalledWith(1, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
      },
    })
  })
})
