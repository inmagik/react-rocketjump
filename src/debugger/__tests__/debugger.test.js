import React from 'react'
import rj from '../../rj'
import useRj from '../../useRj'
import useRunRj from '../../useRunRj'
import connectRj from '../../connectRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { render, fireEvent, act as actForDom } from '@testing-library/react'
import { PENDING, SUCCESS, RUN } from '../../actionTypes'
import {
  RjDebugEvents,
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
} from '../../debugger/index'
import { testUtilResetEmmitersState } from '../../debugger/emitter'

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
        info: { effect },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
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
    TreeWithConnect = connectRj(MaRjState)(TreeWithConnect)
    render(<TreeWithConnect />)

    expect(mockCallback).toBeCalledTimes(1)
    expect(mockCallback).nthCalledWith(1, {
      meta: {
        info: {
          effect,
          wrappedComponentName: 'TreeWithConnect',
        },
        trackId: 0,
      },
      type: RJ_INIT_EVENT,
      payload: {
        state: { pending: false, error: null, data: null },
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
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
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
        nextState: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: SUCCESS,
          payload: {
            data: 23,
            params: ['Giova', 23],
          },
          meta: {},
        },
        nextState: { pending: false, error: null, data: 23 },
      },
    })
  })
  it('should emit RJ_DISPATCH_EVENT when actions are dispatched in useRj even in events handlers', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const MaRjState = rj({
      effect,
    })

    const MaTreeWithEvents = () => {
      const { run } = useRj(MaRjState)[1]
      return (
        <div>
          <button
            onClick={() => {
              run('This die')
              run('Giova', 23)
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

    expect(mockCallback).toBeCalledTimes(6)
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
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
        nextState: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(3, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(4, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
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
        nextState: { pending: true, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(6, {
      meta: {
        info: { effect },
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: SUCCESS,
          payload: {
            data: 23,
            params: ['Giova', 23],
          },
          meta: {},
        },
        nextState: { pending: false, error: null, data: 23 },
      },
    })
  })
  it('should emit RJ_DISPATCH_EVENT when actions are dispatched in useRj and perist the trackId for the same useRj hook instance', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const resolvesA = []
    const effectA = () => new Promise(r => resolvesA.push(r))
    const configA = {
      effect: effectA,
      name: 'RjA',
    }
    const RjA = rj(configA)

    const resolvesB = []
    const effectB = () => new Promise(r => resolvesB.push(r))
    const configB = {
      effect: effectB,
      name: 'RjB',
    }
    const RjB = rj(configB)

    const resolvesC = []
    const effectC = () => new Promise(r => resolvesC.push(r))
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
        info: configC,
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
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
        nextState: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(5, {
      meta: {
        info: configA,
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
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
        nextState: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(6, {
      meta: {
        info: configA,
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(7, {
      meta: {
        info: configC,
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    await actForDom(async () => resolvesC[0]('C'))
    expect(mockCallback).toBeCalledTimes(8)
    expect(mockCallback).nthCalledWith(8, {
      meta: {
        info: configC,
        trackId: 2,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: SUCCESS,
          payload: { data: 'C', params: [] },
          meta: {},
        },
        nextState: { pending: false, error: null, data: 'C' },
      },
    })
    await actForDom(async () => resolvesA[0]('A'))
    expect(mockCallback).toBeCalledTimes(9)
    expect(mockCallback).nthCalledWith(9, {
      meta: {
        info: configA,
        trackId: 0,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: SUCCESS,
          payload: { data: 'A', params: [] },
          meta: {},
        },
        nextState: { pending: false, error: null, data: 'A' },
      },
    })
    await actForDom(async () => fireEvent.click(getByText('Click Me')))
    expect(mockCallback).toBeCalledTimes(11)
    expect(mockCallback).nthCalledWith(10, {
      meta: {
        info: configB,
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
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
        nextState: { pending: false, error: null, data: null },
      },
    })
    expect(mockCallback).nthCalledWith(11, {
      meta: {
        info: configB,
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: false, error: null, data: null },
        action: {
          type: PENDING,
          meta: {},
        },
        nextState: { pending: true, error: null, data: null },
      },
    })
    await actForDom(async () => resolvesB[0]('B'))
    expect(mockCallback).toBeCalledTimes(12)
    expect(mockCallback).nthCalledWith(12, {
      meta: {
        info: configB,
        trackId: 1,
      },
      type: RJ_DISPATCH_EVENT,
      payload: {
        prevState: { pending: true, error: null, data: null },
        action: {
          type: SUCCESS,
          payload: { data: 'B', params: [] },
          meta: {},
        },
        nextState: { pending: false, error: null, data: 'B' },
      },
    })
  })
  it('should emit RJ_TEARDOWN_EVENT when useRj umount', async () => {
    const mockCallback = jest.fn()
    RjDebugEvents.subscribe(mockCallback)

    const effect = () => Promise.resolve(23)
    const maRjState = rj({
      effect,
    })

    const { unmount } = renderHook(() => useRj(maRjState))
    unmount()
    expect(mockCallback).toBeCalledTimes(2)
    expect(mockCallback).nthCalledWith(2, {
      meta: {
        info: { effect },
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
