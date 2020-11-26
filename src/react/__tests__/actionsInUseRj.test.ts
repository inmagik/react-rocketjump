import { act, renderHook } from '@testing-library/react-hooks'
import {
  CANCEL,
  CLEAN,
  RUN,
  SUCCESS,
  UPDATE_DATA,
} from '../../core/actions/actionTypes'
import { deps } from '../../core/actions/deps'
import { isEffectAction } from '../../core/actions/effectAction'
import rj from '../../core/rj'
import { Action, Reducer } from '../../core/types'
import useRj from '../useRj'

describe('React-RocketJump useRj actions', () => {
  const makeActionObserver = (
    oldReducer: Reducer,
    arrayLog: Action[],
    types: string[]
  ) => {
    return (state: any, action: Action) => {
      if (types.indexOf(action.type) >= 0) {
        arrayLog.push(action)
      }
      oldReducer(state, action)
    }
  }

  it('should produce default actions', () => {
    const obj = rj(() => Promise.resolve([{ id: 1, name: 'admin' }]))

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    expect(actions).toHaveProperty('run')
    expect(actions).toHaveProperty('clean')
    expect(actions).toHaveProperty('cancel')
    expect(actions).toHaveProperty('updateData')
  })

  it('should produce a good run action', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    expect(actions).toHaveProperty('run')
    expect(actions).toHaveProperty('clean')
    expect(actions).toHaveProperty('cancel')
    expect(actions).toHaveProperty('updateData')

    await act(async () => {
      actions.run(1, 'a', {}, undefined)
    })

    expect(actionLog[0]).toEqual({
      type: RUN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should produce a good clean action', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [CLEAN]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    await act(async () => {
      actions.clean(1, 'a', {}, undefined)
    })

    expect(actionLog[0]).toEqual({
      type: CLEAN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should produce a good cancel action', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [CANCEL]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    await act(async () => {
      actions.cancel(1, 'a', {}, undefined)
    })

    expect(actionLog[0]).toEqual({
      type: CANCEL,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should produce a good updateData action', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [UPDATE_DATA]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    await act(async () => {
      actions.updateData({ name: 'GioVa23' })
    })

    expect(actionLog[0]).toEqual({
      type: UPDATE_DATA,
      payload: { name: 'GioVa23' },
    })
    expect(isEffectAction(actionLog[0])).toBe(false)
  })

  it('should expose builder', () => {
    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    expect(actions.run).toHaveProperty('onSuccess')
    expect(actions.run).toHaveProperty('onFailure')
    expect(actions.run).toHaveProperty('withMeta')
    expect(actions.run).toHaveProperty('run')
    expect(actions.run).toHaveProperty('asPromise')
  })

  it('should now allow direct run invocation', async () => {
    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    expect(() => actions.run.run()).toThrow()
  })

  it('should use onSuccess', async () => {
    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn()

    await act(async () => {
      actions.run.onSuccess(onSuccess).run()
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should use onFailure', async () => {
    const obj = rj({
      effect: () => Promise.reject(),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onFailure = jest.fn()

    await act(async () => {
      actions.run.onFailure(onFailure).run()
    })
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('should use plain meta data', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run.withMeta({ a: 1 }).onSuccess(onSuccess).run()
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0].meta).toEqual({ a: 1 })
  })

  it('should compose plain meta data', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run
        .withMeta({ a: 1 })
        .withMeta({ b: 2 })
        .withMeta({ a: 2, c: 3 })
        .onSuccess(onSuccess)
        .run()
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0].meta).toEqual({ a: 2, b: 2, c: 3 })
  })

  it('should use meta data transform', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run
        .withMeta({ a: 1 })
        .withMeta(() => ({}))
        .onSuccess(onSuccess)
        .run()
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0].meta).toEqual({})
  })

  it('should use meta data transform correctly', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run
        .withMeta({ a: 1 })
        .withMeta((oldMeta) => ({ b: oldMeta.a, a: 2 }))
        .onSuccess(onSuccess)
        .run()
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0].meta).toEqual({ a: 2, b: 1 })
  })

  // it('should allow action renaming', () => {
  //   const rjState = reactRj({
  //     effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
  //   })

  //   const Component = (props) => null

  //   const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
  //     fetchTodos: run,
  //     cleanTodos: clean,
  //   }))(Component)

  //   const testRenderer = TestRenderer.create(<RjComponent />)
  //   const wrapper = testRenderer.root.findByType(Component)

  //   expect(wrapper.props).toHaveProperty('fetchTodos')
  //   expect(wrapper.props).toHaveProperty('cleanTodos')
  //   expect(wrapper.props).not.toHaveProperty('run')
  //   expect(wrapper.props).not.toHaveProperty('clean')
  // })

  it('should allow action proxying', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id: number) => Promise.resolve([{ id: id + 7, name: 'admin' }]),
      actions: ({ run }) => ({
        run: (id: number) => run(id * 2),
      }),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run.onSuccess(onSuccess).run(1)
    })

    expect(actionLog[0]).toEqual({
      type: 'SUCCESS',
      meta: {},
      payload: {
        data: [{ id: 9, name: 'admin' }],
        params: [2],
      },
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('should allow action definition', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id: number) => Promise.resolve([{ id: id + 7, name: 'admin' }]),
      actions: ({ run }) => ({
        runDouble: (id: number) => run(id * 2),
      }),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    expect(actions).toHaveProperty('run')
    expect(actions).toHaveProperty('runDouble')

    await act(async () => {
      actions.runDouble.onSuccess(onSuccess).run(1)
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0]).toEqual({
      type: 'SUCCESS',
      meta: {},
      payload: {
        data: [{ id: 9, name: 'admin' }],
        params: [2],
      },
    })
  })

  it('should allow action signature change', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id: number, name) =>
        Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: (object: any) => run(object.id, object.name),
      }),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.runObject.onSuccess(onSuccess).run({ id: 1, name: 'admin' })
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0]).toEqual({
      type: 'SUCCESS',
      meta: {},
      payload: {
        data: [{ id: 8, name: 'admin' }],
        params: [1, 'admin'],
      },
    })
  })

  it('should allow meta management inside', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id: number, name) =>
        Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: (object: any) =>
          run(object.id, object.name).withMeta({ z: 1 }),
      }),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.runObject.onSuccess(onSuccess).run({ id: 1, name: 'admin' })
    })
    expect(actionLog[0]).toEqual({
      type: 'SUCCESS',
      meta: { z: 1 },
      payload: {
        data: [{ id: 8, name: 'admin' }],
        params: [1, 'admin'],
      },
    })
  })

  it('should allow meta transform inside', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id: number, name) =>
        Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: (object: any) =>
          run(object.id, object.name)
            .withMeta({ z: 1 })
            .withMeta(({ z }) => ({ x: z })),
      }),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.runObject.onSuccess(onSuccess).run({ id: 1, name: 'admin' })
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0]).toEqual({
      type: 'SUCCESS',
      meta: { x: 1 },
      payload: {
        data: [{ id: 8, name: 'admin' }],
        params: [1, 'admin'],
      },
    })
  })

  // it('should allow plain actions', async () => {
  //   const actionLog: Action[] = []

  //   const obj = rj({
  //     effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
  //     reducer: (oldReducer) =>
  //       makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
  //   })

  //   const Component = (props) => null

  //   const RjComponent = connectRj(obj, undefined, ({ run, clean }) => ({
  //     run,
  //     clean,
  //     custom: () => ({ type: 'CUSTOM' }),
  //   }))(Component)

  //   const testRenderer = TestRenderer.create(<RjComponent />)
  //   const wrapper = testRenderer.root.findByType(Component)

  //   await act(async () => {
  //     wrapper.props.custom()
  //   })

  //   expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  // })

  // it('should allow builder on plain action (without success indeed)', async () => {
  //   const actionLog = []

  //   const rjState = reactRj({
  //     effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
  //     reducer: (oldReducer) =>
  //       makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
  //   })

  //   const Component = (props) => null

  //   const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
  //     run,
  //     clean,
  //     custom: () => ({ type: 'CUSTOM' }),
  //   }))(Component)

  //   const testRenderer = TestRenderer.create(<RjComponent />)
  //   const wrapper = testRenderer.root.findByType(Component)

  //   const onSuccess = jest.fn()

  //   await act(async () => {
  //     wrapper.props.custom.onSuccess(onSuccess).run()
  //   })

  //   expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  //   expect(onSuccess).not.toHaveBeenCalled()
  // })

  it('should be able to return a Promise', async () => {
    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    await act(async () => {
      const p = actions.run.asPromise()

      expect(p).toBeInstanceOf(Promise)
    })
  })

  it('should call onSuccess even in promise mode', async () => {
    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn()
    const onFailure = jest.fn()

    await act(async () => {
      await actions.run.onSuccess(onSuccess).onFailure(onFailure).asPromise()
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFailure).toHaveBeenCalledTimes(0)
  })

  it('should call onFailure even in promise mode', async () => {
    const obj = rj({
      effect: () => Promise.reject(),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn()
    const onFailure = jest.fn()

    await act(async () => {
      await actions.run
        .onSuccess(onSuccess)
        .onFailure(onFailure)
        .asPromise()
        .catch(() => {})
    })
    expect(onFailure).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(0)
  })

  it('should resolve promises correctly', async () => {
    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onSuccess = jest.fn()

    await act(async () => {
      await actions.run.asPromise().then(onSuccess)
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should reject promises correctly', async () => {
    const obj = rj({
      effect: () => Promise.reject(),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    const onFailure = jest.fn()

    await act(async () => {
      await actions.run
        .asPromise()
        .catch(onFailure)
        .then(() => {})
    })

    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('should use meta in promise mode', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    const onSuccess = jest.fn(() => {})

    await act(async () => {
      actions.run
        .withMeta({ a: 1 })
        .withMeta(() => ({}))
        .onSuccess(onSuccess)
        .asPromise()
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(actionLog[0].meta).toEqual({})
  })

  // it('should allow promises on plain actions (even if useless)', async () => {
  //   const actionLog: Action[] = []

  //   const rjState = rj({
  //     effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
  //     reducer: (oldReducer) =>
  //       makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
  //   })

  //   const Component = (props) => null

  //   const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
  //     run,
  //     clean,
  //     custom: () => ({ type: 'CUSTOM' }),
  //   }))(Component)

  //   const testRenderer = TestRenderer.create(<RjComponent />)
  //   const wrapper = testRenderer.root.findByType(Component)

  //   await act(async () => {
  //     const p = wrapper.props.custom.asPromise()
  //     expect(p).toBeInstanceOf(Promise)
  //   })

  //   expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  // })

  it('should squash deps values from actions', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    await act(async () => {
      actions.run(
        1,
        2,
        deps.maybe(23),
        deps.maybeGet({ age: 88 }, 'age'),
        deps.withMeta(99, {}),
        deps.withAlwaysMeta({})
      )
    })

    expect(actionLog[0]).toEqual({
      type: RUN,
      payload: {
        params: [1, 2, 23, 88, 99],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should squash deps values from actions with meta', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current

    await act(async () => {
      actions.run(
        1,
        2,
        deps.maybe(23).withMeta({ giova: 33 }),
        deps.maybeGet({ age: 88 }, 'age'),
        deps.withMeta(99, { babu: 23 }),
        deps.withAlwaysMeta({ x: 'xd' })
      )
    })

    expect(actionLog[0]).toEqual({
      type: RUN,
      payload: {
        params: [1, 2, 23, 88, 99],
      },
      meta: {
        giova: 33,
        babu: 23,
        x: 'xd',
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should skip actions according to deps', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(rjState))
    const [, actions] = result.current

    await act(async () => {
      actions.run(
        1,
        2,
        deps.maybe(0).withMeta({ giova: 33 }),
        deps.maybeGet({ age: 88 }, 'age'),
        deps.withMeta(99, { babu: 23 }),
        deps.withAlwaysMeta({ x: 'xd' })
      )
    })
    expect(actionLog).toEqual([])
  })

  it('should curry builder as well', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: (oldReducer) => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const { result } = renderHook(() => useRj(obj))
    const [, actions] = result.current
    const run = actions.run
    const curriedRun = run
      .withMeta({ x: 'xd' })
      .withMeta({ babu: 23 })
      .curry(1)
      .withMeta({ giova: 33 })
      .curry(2, 23)

    await act(async () => {
      curriedRun(88, 99)
    })

    expect(actionLog[0]).toEqual({
      type: RUN,
      payload: {
        params: [1, 2, 23, 88, 99],
      },
      meta: {
        giova: 33,
        babu: 23,
        x: 'xd',
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })
})
