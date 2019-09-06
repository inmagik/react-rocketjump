import React from 'react'
import rj from '../../rj'
import useRj from '../../useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { render, fireEvent, waitForElement } from '@testing-library/react'
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
import { testUtilResetEmmitersState } from '../../debugger/emitter'

beforeEach(() => {
  testUtilResetEmmitersState()
})

describe('RJ Debugger', () => {
  it('should call RJ_INIT_EVENT when state is initalized', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      effect,
    })

    renderHook(() => useRj(maRjState))

    expect(mockCallback).toBeCalledTimes(1)
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
  it('should handle deep state tree and call RJ_INIT_EVENT according to tree order', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effectA = () => Promise.resolve(23)
    const RjA = rj({
      effect: effectA,
      name: 'RjA',
    })
    const effectB = () => Promise.resolve(23)
    const RjB = rj({
      effect: effectB,
      name: 'RjB',
    })
    const effectC = () => Promise.resolve(23)
    const RjC = rj({
      effect: effectC,
      name: 'RjC',
    })
    const effectD = () => Promise.resolve(23)
    const configD = {
      effect: effectD,
      name: 'RjD',
      reducer: r => () => ({ giova: 23 }),
    }
    const RjD = rj(configD)

    const Deep1 = () => {
      useRj(RjB)
      useRj(RjA)
      return <div />
    }

    const Deep2 = () => {
      useRj(RjC)
      return (
        <div>
          <Deep3 />
        </div>
      )
    }

    const Deep3 = () => {
      useRj(RjD)
      return <div />
    }

    const ManyRjsTree = () => {
      useRj(RjA)
      return (
        <div>
          <Deep1 />
          <Deep2 />
        </div>
      )
    }
    render(<ManyRjsTree />)
    expect(mockCallback).toBeCalledTimes(5)
    expect(mockCallback).nthCalledWith(1, {
      meta: {
        info: { effect: effectA, name: 'RjA' },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: { effect: effectB, name: 'RjB' },
        trackId: 1,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: { effect: effectA, name: 'RjA' },
        trackId: 2,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: { effect: effectC, name: 'RjC' },
        trackId: 3,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: configD,
        trackId: 4,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { giova: 23 },
      },
    })
  })
})
