import { renderHook, act } from '@testing-library/react-hooks'
import * as deps from '../deps'
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
})
