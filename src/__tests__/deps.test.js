import { renderHook, act } from '@testing-library/react-hooks'
import { tap } from 'rxjs/operators'
import * as deps from '../deps'
import { RUN } from '../actionTypes'
import rj from '../rj'
import useRunRj from '../useRunRj'

describe('deps', () => {
  it('should permit maybe run of side effects based on deps', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id }) => useRunRj(MyRjState, [deps.maybe(id)]),
      {
        initialProps: {
          id: '',
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ id: 1312 })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 1312)
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
  it('should permit to all deps to be maybe values', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id, code }) => useRunRj(MyRjState, deps.allMaybe(id, code)),
      {
        initialProps: {
          id: 23,
          code: '',
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ id: 1312, code: 'Albi' })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 1312, 'Albi')
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
  it('should permit maybe null run of side effects based on deps', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id }) => useRunRj(MyRjState, [deps.maybeNull(id)]),
      {
        initialProps: {
          id: null,
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ id: '' })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, '')
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
  it('should permit to all deps to be maybe null values', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id, code }) => useRunRj(MyRjState, deps.allMaybeNull(id, code)),
      {
        initialProps: {
          id: 23,
          code: null,
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ id: 1312, code: false })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 1312, false)
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
  it('should permit maybe run of side effects based on deps and get when as get dot style', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ user }) => useRunRj(MyRjState, [deps.maybeGet(user, 'id')]),
      {
        initialProps: {
          user: null,
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ user: { id: 23 } })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 23)
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
  it('should pass meta along with value', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const actionLog = jest.fn()

    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender } = renderHook(
      ({ id }) =>
        useRunRj(MyRjState, [deps.withMeta(id, { giova: id })], false),
      {
        initialProps: {
          id: 23,
        },
      }
    )
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [23],
      },
      meta: {
        giova: 23,
      },
    })
    await act(async () => _resolves[0]('Gio Va'))
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 23)
    rerender({ id: 1312 })
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312)
    expect(actionLog).toHaveBeenNthCalledWith(2, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312],
      },
      meta: {
        giova: 1312,
      },
    })
    await act(async () => _resolves[1]('Gio Va'))
  })
  it('should pass meta along with value only when a dep change', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const actionLog = jest.fn()

    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender } = renderHook(
      ({ id, level }) =>
        useRunRj(
          MyRjState,
          [
            deps.withMeta(id, { giova: id }),
            deps.withMeta(level, { is5Dan: level === 'giova' }),
          ],
          false
        ),
      {
        initialProps: {
          id: 23,
          level: 'rinne',
        },
      }
    )
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [23, 'rinne'],
      },
      meta: {
        giova: 23,
        is5Dan: false,
      },
    })
    await act(async () => _resolves[0]('Gio Va'))
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 23, 'rinne')
    rerender({ id: 1312, level: 'rinne' })
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312, 'rinne')
    expect(actionLog).toHaveBeenNthCalledWith(2, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'rinne'],
      },
      meta: {
        giova: 1312,
      },
    })
    await act(async () => _resolves[1]('Gio Va'))
    rerender({ id: 1312, level: 'giova' })
    expect(mockApi).toHaveBeenNthCalledWith(3, 1312, 'giova')
    expect(actionLog).toHaveBeenNthCalledWith(3, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'giova'],
      },
      meta: {
        is5Dan: true,
      },
    })
    await act(async () => _resolves[2]('Gio Va'))
  })
  it('should pass maybe meta along with value only when a dep change', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const actionLog = jest.fn()

    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender } = renderHook(
      ({ id, level }) =>
        useRunRj(
          MyRjState,
          [
            deps.maybe(id).withMeta({ giova: id }),
            deps.withMeta(level, { is5Dan: level === 'giova' }),
          ],
          false
        ),
      {
        initialProps: {
          id: null,
          level: 'rinne',
        },
      }
    )
    expect(mockApi).not.toHaveBeenCalled()
    expect(actionLog).not.toHaveBeenCalled()
    rerender({ id: 23, level: 'rinne' })
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [23, 'rinne'],
      },
      meta: {
        giova: 23,
      },
    })
    expect(mockApi).toHaveBeenNthCalledWith(1, 23, 'rinne')
    await act(async () => _resolves[0]('Gio Va'))
    rerender({ id: 1312, level: 'giova' })
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312, 'giova')
    expect(actionLog).toHaveBeenNthCalledWith(2, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'giova'],
      },
      meta: {
        giova: 1312,
        is5Dan: true,
      },
    })
    await act(async () => _resolves[1]('Gio Va'))
  })
  it('should pass meta only on mount run when specified', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const actionLog = jest.fn()

    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender } = renderHook(
      ({ id, level }) =>
        useRunRj(
          MyRjState,
          [
            id,
            deps.withMeta(level, { guakamole: true }),
            deps.withMetaOnMount({ guakamole: false, giova: 23 }),
          ],
          false
        ),
      {
        initialProps: {
          id: 23,
          level: 'rinne',
        },
      }
    )
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [23, 'rinne'],
      },
      meta: {
        giova: 23,
        guakamole: false,
      },
    })
    await act(async () => _resolves[0]('Gio Va'))
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 23, 'rinne')
    rerender({ id: 1312, level: 'rinne' })
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312, 'rinne')
    expect(actionLog).toHaveBeenNthCalledWith(2, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'rinne'],
      },
      meta: {},
    })
    await act(async () => _resolves[1]('Gio Va'))
    rerender({ id: 1312, level: 'giova' })
    expect(mockApi).toHaveBeenNthCalledWith(3, 1312, 'giova')
    expect(actionLog).toHaveBeenNthCalledWith(3, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'giova'],
      },
      meta: {
        guakamole: true,
      },
    })
    await act(async () => _resolves[2]('Gio Va'))
  })
  it('should pass always meta when specified', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const actionLog = jest.fn()

    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender } = renderHook(
      ({ id, level }) =>
        useRunRj(
          MyRjState,
          [
            deps.withMeta(deps.maybe(id), { albi: 1312 }),
            deps.withMeta(level, { guakamole: true }),
            deps.withAlwaysMeta({ guakamole: false, giova: 23 }),
          ],
          false
        ),
      {
        initialProps: {
          id: 23,
          level: 'rinne',
        },
      }
    )
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [23, 'rinne'],
      },
      meta: {
        giova: 23,
        guakamole: false,
        albi: 1312,
      },
    })
    await act(async () => _resolves[0]('Gio Va'))
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 23, 'rinne')
    rerender({ id: 1312, level: 'rinne' })
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312, 'rinne')
    expect(actionLog).toHaveBeenNthCalledWith(2, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'rinne'],
      },
      meta: {
        giova: 23,
        guakamole: false,
        albi: 1312,
      },
    })
    await act(async () => _resolves[1]('Gio Va'))
    rerender({ id: 1312, level: 'giova' })
    expect(mockApi).toHaveBeenNthCalledWith(3, 1312, 'giova')
    expect(actionLog).toHaveBeenNthCalledWith(3, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'giova'],
      },
      meta: {
        giova: 23,
        guakamole: false,
      },
    })
    await act(async () => _resolves[2]('Gio Va'))
  })
  it('should permit combination of helpers', async () => {
    const actionLog = jest.fn()
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj({
      effect: mockApi,
      effectPipeline: a => a.pipe(tap(actionLog)),
    })

    const { rerender, result } = renderHook(
      ({ id, code }) =>
        useRunRj(
          MyRjState,
          deps.allMaybe(
            deps.withMeta(id, { id }),
            deps.withMeta(code, { code }),
            deps.withMetaOnMount({ n: 99 }),
            deps.withAlwaysMeta({ giova: 'isCoool' })
          )
        ),
      {
        initialProps: {
          id: 23,
          code: '',
        },
      }
    )
    // Initial state
    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
    expect(mockApi).not.toHaveBeenCalled()
    expect(actionLog).not.toHaveBeenCalled()
    // Write some shit in data
    await act(async () => {
      result.current[1].updateData('~')
    })
    expect(result.current[0]).toEqual({
      data: '~',
      pending: false,
      error: null,
    })
    rerender({ id: 1312, code: 'Albi', giova: 'isCoool' })
    // Api called \w
    expect(mockApi).toHaveBeenNthCalledWith(1, 1312, 'Albi')
    expect(actionLog).toHaveBeenNthCalledWith(1, {
      type: RUN,
      callbacks: {
        onSucess: undefined,
        onFailure: undefined,
      },
      payload: {
        params: [1312, 'Albi'],
      },
      meta: {
        id: 1312,
        code: 'Albi',
        giova: 'isCoool',
      },
    })
    // Clean not called
    expect(result.current[0]).toEqual({
      data: '~',
      pending: true,
      error: null,
    })
    // Resolve the promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Effect succeded!
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
  })
})
