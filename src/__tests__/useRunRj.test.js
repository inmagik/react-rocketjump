import { renderHook, act } from '@testing-library/react-hooks'
import rj from '../rj'
import useRunRj from '../useRunRj'

describe('useRunRj', () => {
  it('should run rj on mount', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
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

  it('should run rj on mount and avoid clean when specified', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
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

  it('should mantein the same return instance while state remain the same', () => {
    const MaRjState = rj(() => {})

    const { result, rerender } = renderHook(() => useRunRj(MaRjState))

    let out = result.current

    rerender({ giova: 23 })

    expect(out).toBe(result.current)
  })
})
