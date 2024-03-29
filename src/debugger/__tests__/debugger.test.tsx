import React from 'react'
import { rj } from '../../core'
import { useRj, useRunRj, connectRj } from '../../react'
import { renderHook, act } from '@testing-library/react-hooks'
import { render, fireEvent, act as actForDom } from '@testing-library/react'
import { PENDING, SUCCESS, RUN } from '../../core/actions/actionTypes'
import { RjDebugEvents } from '../debugger'
import { RJ_DISPATCH_EVENT, RJ_INIT_EVENT, RJ_TEARDOWN_EVENT } from '../events'
import { testUtilResetEmmitersState } from '../emitterDev'
import { Action } from '../../core/types'

const OLD_ENV = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...OLD_ENV }
})

afterEach(() => {
  process.env = OLD_ENV
})

beforeEach(() => {
  jest.resetModules()
  testUtilResetEmmitersState()
})

describe('RJ Debugger', () => {
  it('should emit RJ_INIT_EVENT when state is initalized in useRj', async () => {
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
        info: {},
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { pending: false, error: null, data: null } },
      },
    })
  })
  it('should emit RJ_INIT_EVENT when state is initalized in connectRj', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const MaRjState = rj({
      effect,
    })

    let TreeWithConnect = () => {
      return <div />
    }
    const TreeWithConnectH = connectRj(MaRjState)(TreeWithConnect)
    render(<TreeWithConnectH />)

    expect(mockCallback).toBeCalledTimes(1)
    expect(mockCallback).nthCalledWith(1, {
      meta: {
        info: {
          wrappedComponentName: 'TreeWithConnect',
        },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: {
          root: {
            pending: false,
            error: null,
            data: null,
          },
        },
      },
    })
  })
  it('should emit RJ_INIT_EVENT when state is initalized in useRj and respect the order of React tree', async () => {
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
    const RjD = rj({
      effect: effectD,
      name: 'RjD',
      reducer: (r) => () => ({ giova: 23 }),
      combineReducers: {
        drago: () => 999,
      },
    })

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
        info: { name: 'RjA' },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: { name: 'RjB' },
        trackId: 1,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: { name: 'RjA' },
        trackId: 2,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: { name: 'RjC' },
        trackId: 3,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: { name: 'RjD' },
        trackId: 4,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { root: { giova: 23 }, drago: 999 },
      },
    })
  })
  it('should emit RJ_DISPATCH_EVENT when actions are dispatched in useRj', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      effect,
    })

    const { result } = renderHook(() => useRj(maRjState))

    await act(async () => {
      result.current[1].run('Giova', 23)
    })

    expect(mockCallback).toBeCalledTimes(4)
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: RUN,
          payload: {
            params: ['Giova', 23],
          },
          meta: {},
          callbacks: {
            onSuccess: undefined,
            onFailure: undefined,
          },
        },
        nextState: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { root: { pending: true, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: true, error: null, data: null } },
        action: {
          type: SUCCESS,
          payload: {
            data: 23,
            params: ['Giova', 23],
          },
          meta: {},
        },
        nextState: { root: { pending: false, error: null, data: 23 } },
      },
    })
  })
  it('should emit RJ_DISPATCH_EVENT when actions are dispatched in useRj even in events handlers', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const combineReducers = {
      gang: (state = null, action: Action) => {
        if (action.type === 'FSK') {
          return 'KARTA'
        }
        return state
      },
    }
    const actions = () => ({
      kiello: () => ({ type: 'FSK' }),
    })
    const MaRjState = rj({
      effect,
      combineReducers,
      actions,
    })

    const MaTreeWithEvents = () => {
      const { run, kiello } = useRj(MaRjState)[1]
      return (
        <div>
          <button
            onClick={() => {
              run('This die')
              run
                .onSuccess(() => {
                  kiello()
                })
                .run('Giova', 23)
            }}
          >
            Click Me
          </button>
        </div>
      )
    }

    const { getByText } = render(<MaTreeWithEvents />)
    await actForDom(async () => {
      fireEvent.click(getByText('Click Me'))
    })

    expect(mockCallback).toBeCalledTimes(7)
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: false, error: null, data: null },
          gang: null,
        },
        action: {
          type: RUN,
          payload: {
            params: ['This die'],
          },
          meta: {},
          callbacks: {
            onSuccess: undefined,
            onFailure: undefined,
          },
        },
        nextState: {
          root: { pending: false, error: null, data: null },
          gang: null,
        },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: false, error: null, data: null },
          gang: null,
        },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
        action: {
          type: RUN,
          payload: {
            params: ['Giova', 23],
          },
          meta: {},
          callbacks: {
            onSuccess: expect.any(Function),
            onFailure: undefined,
          },
        },
        nextState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
      },
    })
    expect(mockCallback).nthCalledWith(6, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: true, error: null, data: null },
          gang: null,
        },
        action: {
          type: SUCCESS,
          payload: {
            data: 23,
            params: ['Giova', 23],
          },
          meta: {},
        },
        nextState: {
          root: { pending: false, error: null, data: 23 },
          gang: null,
        },
      },
    })
    expect(mockCallback).nthCalledWith(7, {
      meta: {
        info: {},
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: {
          root: { pending: false, error: null, data: 23 },
          gang: null,
        },
        action: {
          type: 'FSK',
        },
        nextState: {
          root: { pending: false, error: null, data: 23 },
          gang: 'KARTA',
        },
      },
    })
  })
  it('should emit RJ_DISPATCH_EVENT when actions are dispatched in useRj and perist the trackId for the same useRj hook instance', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const resolvesA: any[] = []
    const effectA = () => new Promise((r) => resolvesA.push(r))
    const configA = {
      effect: effectA,
      name: 'RjA',
    }
    const RjA = rj(configA)

    const resolvesB: any[] = []
    const effectB = () => new Promise((r) => resolvesB.push(r))
    const configB = {
      effect: effectB,
      name: 'RjB',
    }
    const RjB = rj(configB)

    const resolvesC: any[] = []
    const effectC = () => new Promise((r) => resolvesC.push(r))
    const configC = {
      effect: effectC,
      name: 'RjC',
    }
    const RjC = rj(configC)

    const DeepTree = () => {
      useRunRj(RjC)
      return <div />
    }

    const MaComplexTree = () => {
      useRunRj(RjA)
      const { run } = useRj(RjB)[1]
      return (
        <div>
          <button onClick={() => run()}>Click Me</button>
          <DeepTree />
        </div>
      )
    }

    const { getByText } = render(<MaComplexTree />)

    expect(mockCallback).toBeCalledTimes(7)
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: { name: 'RjC' },
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: RUN,
          payload: {
            params: [],
          },
          meta: {},
          callbacks: {
            onSuccess: undefined,
            onFailure: undefined,
          },
        },
        nextState: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: { name: 'RjA' },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: RUN,
          payload: {
            params: [],
          },
          meta: {},
          callbacks: {
            onSuccess: undefined,
            onFailure: undefined,
          },
        },
        nextState: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(6, {
      meta: {
        info: { name: 'RjA' },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { root: { pending: true, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(7, {
      meta: {
        info: { name: 'RjC' },
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { root: { pending: true, error: null, data: null } },
      },
    })
    await actForDom(async () => resolvesC[0]('C'))
    expect(mockCallback).toBeCalledTimes(8)
    expect(mockCallback).nthCalledWith(8, {
      meta: {
        info: { name: 'RjC' },
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: true, error: null, data: null } },
        action: {
          type: SUCCESS,
          payload: { data: 'C', params: [] },
          meta: {},
        },
        nextState: { root: { pending: false, error: null, data: 'C' } },
      },
    })
    await actForDom(async () => resolvesA[0]('A'))
    expect(mockCallback).toBeCalledTimes(9)
    expect(mockCallback).nthCalledWith(9, {
      meta: {
        info: { name: 'RjA' },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: true, error: null, data: null } },
        action: {
          type: SUCCESS,
          payload: { data: 'A', params: [] },
          meta: {},
        },
        nextState: { root: { pending: false, error: null, data: 'A' } },
      },
    })
    await actForDom(async () => fireEvent.click(getByText('Click Me')))
    expect(mockCallback).toBeCalledTimes(11)
    expect(mockCallback).nthCalledWith(10, {
      meta: {
        info: { name: 'RjB' },
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: RUN,
          payload: {
            params: [],
          },
          meta: {},
          callbacks: {
            onSuccess: undefined,
            onFailure: undefined,
          },
        },
        nextState: { root: { pending: false, error: null, data: null } },
      },
    })
    expect(mockCallback).nthCalledWith(11, {
      meta: {
        info: { name: 'RjB' },
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: false, error: null, data: null } },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { root: { pending: true, error: null, data: null } },
      },
    })
    await actForDom(async () => resolvesB[0]('B'))
    expect(mockCallback).toBeCalledTimes(12)
    expect(mockCallback).nthCalledWith(12, {
      meta: {
        info: { name: 'RjB' },
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { root: { pending: true, error: null, data: null } },
        action: {
          type: SUCCESS,
          payload: { data: 'B', params: [] },
          meta: {},
        },
        nextState: { root: { pending: false, error: null, data: 'B' } },
      },
    })
  })
  it('should emit RJ_TEARDOWN_EVENT when useRj umount', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      name: 'Dragooooo',
      effect,
    })

    const { unmount } = renderHook(() => useRj(maRjState))
    unmount()
    expect(mockCallback).toBeCalledTimes(2)
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: { name: 'Dragooooo' },
        trackId: 0,
      },
      type: RJ_TEARDOWN_EVENT,
      payload: {},
    })

    expect(mockCallback).toBeCalledTimes(2)
  })
  it("should don't emit in PRODUCTION", async () => {
    process.env.NODE_ENV = 'production'
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      name: 'Lina',
      effect,
    })

    const { result } = renderHook(() => useRj(maRjState))
    expect(mockCallback).toBeCalledTimes(0)
    await act(async () => {
      result.current[1].run()
    })
    expect(mockCallback).toBeCalledTimes(0)
  })
})
