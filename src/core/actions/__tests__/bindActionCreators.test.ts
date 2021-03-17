import bindActionCreators from '../bindActionCreators'
import { deps } from '../deps'
import { makeEffectAction } from '../effectAction'

const fakeDispatcher = () => {
  return jest.fn((action) => {
    if (action.callbacks.onSuccess) {
      action.callbacks.onSuccess()
    }
    if (action.callbacks.onFailure) {
      action.callbacks.onFailure()
    }
  })
}

describe('rocketjump action builder', () => {
  it('should build', () => {
    const dispatch = fakeDispatcher()
    const hello = jest.fn((...args) => makeEffectAction('Hello', args))

    const actions = bindActionCreators(
      {
        hello,
      },
      dispatch
    )

    const success = jest.fn()
    const failure = jest.fn()

    actions.hello.onSuccess(success).run('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(success).toHaveBeenCalledTimes(1)
    expect(failure).toHaveBeenCalledTimes(0)
    success.mockClear()

    actions.hello.onFailure(failure).run('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)
    success.mockClear()

    actions.hello.withMeta({ n: 23 }).run('Giova')
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['Giova'],
      },
      meta: {
        n: 23,
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should support deps', () => {
    const dispatch = fakeDispatcher()
    const hello = jest.fn((...args) => makeEffectAction('Hello', args))

    const actions = bindActionCreators(
      {
        hello,
      },
      dispatch
    )

    actions.hello.onSuccess(() => {}).run('Giova', deps.maybe(false))

    expect(hello).not.toHaveBeenCalled()

    actions.hello(
      'Giova',
      deps.withAlwaysMeta({ n: 23 }),
      deps.withMeta(false, { giu: 23 }),
      deps.withMetaOnMount({ dre: 99 }),
      deps.maybeGet({ giova: 23 }, 'giova')
    )
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['Giova', false, 23],
      },
      meta: {
        n: 23,
        giu: 23,
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should curry', () => {
    const dispatch = fakeDispatcher()
    const hello = jest.fn((...args) => makeEffectAction('Hello', args))

    const actions = bindActionCreators(
      {
        hello,
      },
      dispatch
    )

    const success = jest.fn()

    actions.hello.onSuccess(success).run('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(success).toHaveBeenCalledTimes(1)
    success.mockClear()

    const curriedHello = actions.hello.onSuccess(success).curry('x')
    curriedHello('Giova')
    expect(hello).toHaveBeenLastCalledWith('x', 'Giova')
    expect(success).toHaveBeenCalledTimes(1)

    success.mockClear()
    curriedHello.onSuccess(success).onSuccess(success).run('Giova')
    expect(hello).toHaveBeenLastCalledWith('x', 'Giova')
    expect(success).toHaveBeenCalledTimes(2)

    success.mockClear()
    actions.hello.onSuccess(success)
    const curriedHelloX = actions.hello.curry('x')
    actions.hello.onSuccess(success)
    curriedHelloX('Giova')
    expect(success).toHaveBeenCalledTimes(0)

    success.mockClear()
    const builderA = actions.hello.onSuccess(() => {})
    const curriedHelloY = builderA.curry('x')
    builderA.onSuccess(success)
    curriedHelloY('Giova')
    expect(success).toHaveBeenCalledTimes(0)

    success.mockClear()
    const curriedHello2 = curriedHello.onSuccess(success).curry(23)
    curriedHello2('Giova', 'xatu')
    expect(hello).toHaveBeenLastCalledWith('x', 23, 'Giova', 'xatu')
    expect(success).toHaveBeenCalledTimes(2)

    success.mockClear()
    const builderB = curriedHello2.onSuccess(success)
    const curriedHello3 = builderB.curry(99)
    curriedHello3('Giova', 'xatu')
    expect(hello).toHaveBeenLastCalledWith('x', 23, 99, 'Giova', 'xatu')
    expect(success).toHaveBeenCalledTimes(3)

    curriedHello('Giova')
    expect(hello).toHaveBeenLastCalledWith('x', 'Giova')

    success.mockClear()
    const failure = jest.fn()
    const curriedFailHello = actions.hello.onFailure(failure).curry('x')
    curriedFailHello(23)
    expect(hello).toHaveBeenLastCalledWith('x', 23)
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)

    success.mockClear()
    failure.mockClear()
    const curriedFailHello2 = curriedFailHello
      .onSuccess(success)
      .onFailure(failure)
      .curry('y')
    curriedFailHello2.onFailure(failure).onFailure(failure).run(777)
    expect(hello).toHaveBeenLastCalledWith('x', 'y', 777)
    expect(failure).toHaveBeenCalledTimes(3)
    expect(success).toHaveBeenCalledTimes(1)

    success.mockClear()
    failure.mockClear()
    const curriedMetaHello = curriedFailHello.withMeta({ k: 99 }).curry()
    curriedMetaHello('O.o')
    expect(hello).toHaveBeenLastCalledWith('x', 'O.o')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['x', 'O.o'],
      },
      meta: {
        k: 99,
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: expect.any(Function),
      },
    })

    success.mockClear()
    failure.mockClear()
    const curriedMetaHello2 = curriedMetaHello
      .onSuccess(success)
      .withMeta({ gang: 20900 })
      .curry(99)
    curriedMetaHello2
      .withMeta((meta: any) => ({ ...meta, k: meta.k + 1 }))
      .run('O.o')
    expect(hello).toHaveBeenLastCalledWith('x', 99, 'O.o')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['x', 99, 'O.o'],
      },
      meta: {
        k: 100,
        gang: 20900,
      },
      callbacks: {
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      },
    })
  })

  it('should build as promise', () => {
    const dispatch = fakeDispatcher()
    const hello = jest.fn((...args) => makeEffectAction('Hello', args))

    const actions = bindActionCreators(
      {
        hello,
      },
      dispatch
    )

    const success = jest.fn()
    const failure = jest.fn()

    actions.hello.onSuccess(success).asPromise('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(success).toHaveBeenCalledTimes(1)
    expect(failure).toHaveBeenCalledTimes(0)
    success.mockClear()

    actions.hello.onFailure(failure).asPromise('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)
    success.mockClear()

    actions.hello.withMeta({ n: 23 }).run('Giova')
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['Giova'],
      },
      meta: {
        n: 23,
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should curry as promise', () => {
    const dispatch = fakeDispatcher()
    const hello = jest.fn((...args) => makeEffectAction('Hello', args))

    const actions = bindActionCreators(
      {
        hello,
      },
      dispatch
    )

    const success = jest.fn()

    actions.hello.onSuccess(success).asPromise('Giova')

    expect(hello).toHaveBeenLastCalledWith('Giova')
    expect(success).toHaveBeenCalledTimes(1)
    success.mockClear()

    const curriedHello = actions.hello.onSuccess(success).curry('x')

    success.mockClear()
    curriedHello.onSuccess(success).onSuccess(success).asPromise('Giova')
    expect(hello).toHaveBeenLastCalledWith('x', 'Giova')
    expect(success).toHaveBeenCalledTimes(2)

    success.mockClear()
    const builderA = actions.hello.onSuccess(() => {})
    const curriedHelloY = builderA.curry('x')
    builderA.onSuccess(success)
    curriedHelloY.asPromise('Giova')
    expect(success).toHaveBeenCalledTimes(0)

    success.mockClear()
    const curriedHello2 = curriedHello.onSuccess(success).curry(23)
    curriedHello2.asPromise('Giova', 'xatu')
    expect(hello).toHaveBeenLastCalledWith('x', 23, 'Giova', 'xatu')
    expect(success).toHaveBeenCalledTimes(2)

    success.mockClear()
    const builderB = curriedHello2.onSuccess(success)
    const curriedHello3 = builderB.curry(99)
    curriedHello3.asPromise('Giova', 'xatu')
    expect(hello).toHaveBeenLastCalledWith('x', 23, 99, 'Giova', 'xatu')
    expect(success).toHaveBeenCalledTimes(3)

    success.mockClear()
    const failure = jest.fn()
    const curriedFailHello = actions.hello.onFailure(failure).curry('x')
    curriedFailHello.asPromise(23)
    expect(hello).toHaveBeenLastCalledWith('x', 23)
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)

    success.mockClear()
    failure.mockClear()
    const curriedFailHello2 = curriedFailHello
      .onSuccess(success)
      .onFailure(failure)
      .curry('y')
    curriedFailHello2.onFailure(failure).onFailure(failure).asPromise(777)
    expect(hello).toHaveBeenLastCalledWith('x', 'y', 777)
    expect(failure).toHaveBeenCalledTimes(3)
    expect(success).toHaveBeenCalledTimes(1)

    success.mockClear()
    failure.mockClear()
    const curriedMetaHello = curriedFailHello.withMeta({ k: 99 }).curry()
    curriedMetaHello.asPromise('O.o')
    expect(hello).toHaveBeenLastCalledWith('x', 'O.o')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(0)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['x', 'O.o'],
      },
      meta: {
        k: 99,
      },
      callbacks: {
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      },
    })

    success.mockClear()
    failure.mockClear()
    const curriedMetaHello2 = curriedMetaHello
      .onSuccess(success)
      .withMeta({ gang: 20900 })
      .curry(99)
    curriedMetaHello2
      .withMeta((meta: any) => ({ ...meta, k: meta.k + 1 }))
      .asPromise('O.o')
    expect(hello).toHaveBeenLastCalledWith('x', 99, 'O.o')
    expect(failure).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'Hello',
      payload: {
        params: ['x', 99, 'O.o'],
      },
      meta: {
        k: 100,
        gang: 20900,
      },
      callbacks: {
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      },
    })
  })
})
