import { renderHook, act } from '@testing-library/react-hooks'
import rj from '../rj'
import useRunRj from '../useRunRj'

describe('useRunRj', () => {
  it('should run rj on mount', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise((resolve) => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id }) => useRunRj(MyRjState, [id]),
      {
        initialProps: { id: 23 },
      }
    )

    // Pending effect
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    expect(mockApi).toHaveBeenNthCalledWith(1, 23)
    rerender({ id: 1312 })
    // Api called \w new argument
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312)

    // Resolve the first promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Rj correct ignore this and still in pending
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })

    // Resolve the second promise and ok!
    await act(async () => _resolves[1]('Gio Va'))
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
    rerender({ id: 777 })
    expect(mockApi).toHaveBeenNthCalledWith(3, 777)
    // Clean up
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    await act(async () => _resolves[2]('Al Bi'))
    expect(result.current[0]).toEqual({
      data: 'Al Bi',
      pending: false,
      error: null,
    })
  })

  it('should run rj in respect of deps', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise((resolve) => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id, roles, agency }) => useRunRj(MyRjState, [id, roles, agency]),
      {
        initialProps: {
          id: 23,
          roles: ['king', 'boss', ['party', 'rulez']],
          agency: {
            name: 'INMAGIK',
            people: ['mauro', 'giova'],
          },
        },
      }
    )

    // Pending effect
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    expect(mockApi).toHaveBeenNthCalledWith(
      1,
      // Call \w deps
      23,
      ['king', 'boss', ['party', 'rulez']],
      {
        name: 'INMAGIK',
        people: ['mauro', 'giova'],
      }
    )
    rerender({
      id: 1312,
      roles: ['useless', 'boy'],
      agency: ['INMAGIK', 'evilcorp'],
    })
    // Api called \w new argument
    expect(mockApi).toHaveBeenNthCalledWith(
      2,
      // Call \w deps
      1312,
      ['useless', 'boy'],
      ['INMAGIK', 'evilcorp']
    )
    // Resolve the first promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Rj correct ignore this and still in pending
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    // Resolve the second promise and ok!
    await act(async () => _resolves[1]('Gio Va'))
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
    rerender({ id: 777 })
    expect(mockApi).toHaveBeenNthCalledWith(3, 777, undefined, undefined)
    // Clean up
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    await act(async () => _resolves[2]('Al Bi'))
    expect(result.current[0]).toEqual({
      data: 'Al Bi',
      pending: false,
      error: null,
    })
  })

  it('should run rj on mount and avoid clean when specified', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise((resolve) => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj(mockApi)

    const { rerender, result } = renderHook(
      ({ id }) => useRunRj(MyRjState, [id], false),
      {
        initialProps: { id: 23 },
      }
    )

    // Pending effect
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })
    expect(mockApi).toHaveBeenNthCalledWith(1, 23)
    rerender({ id: 1312 })
    // Api called \w new argument
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312)

    // Resolve the first promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Rj correct ignore this and still in pending
    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })

    // Resolve the second promise and ok!
    await act(async () => _resolves[1]('Gio Va'))
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: false,
      error: null,
    })
    rerender({ id: 777 })
    expect(mockApi).toHaveBeenNthCalledWith(3, 777)
    // Not clean up, but still pending
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      pending: true,
      error: null,
    })
    await act(async () => _resolves[2]('Al Bi'))
    expect(result.current[0]).toEqual({
      data: 'Al Bi',
      pending: false,
      error: null,
    })
  })

  it('should mantein the same return instance while state remain the same', async () => {
    let _resolves
    const MaRjState = rj(
      () =>
        new Promise((resolve) => {
          _resolves = resolve
        })
    )

    const { result, rerender } = renderHook(() => useRunRj(MaRjState))

    await act(async () => _resolves('BaBu'))

    let out = result.current

    await act(async () => {
      rerender({ giova: 23 })
    })

    expect(out).toBe(result.current)
  })
})
