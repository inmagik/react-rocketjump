import { useCallback } from 'react'
import { act } from 'react-dom/test-utils'
import { renderHook } from '@testing-library/react-hooks'
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

  it('should get angry when the run action is removed', () => {
    const mockApi = jest.fn().mockResolvedValue(23)
    const MyRjState = rj(mockApi)

    const { result } = renderHook(() =>
      useRunRj(MyRjState, [], true, undefined, ({ run, clean }) => ({
        // ... ignore run and clean ...
      }))
    )
    expect(result.error.message).toEqual(
      expect.stringContaining('[react-rocketjump]')
    )
  })

  it('should get angry when the clean action is removed and shouldCleanOnNewEffect is true', async () => {
    const mockApi = jest.fn(() => new Promise(() => {}))
    const MyRjState = rj(mockApi)

    const hook1 = renderHook(() =>
      useRunRj(MyRjState, [], true, undefined, ({ run, clean }) => ({
        // ... ignore clean ...
        run,
      }))
    )
    expect(hook1.result.error.message).toEqual(
      expect.stringContaining('[react-rocketjump]')
    )

    const mapActions = ({ run }) => ({ run })
    const hook2 = renderHook(() =>
      useRunRj(MyRjState, [], false, undefined, mapActions)
    )
    // console.log(hook2.result)
    expect(hook2.result.error).toBeUndefined()
  })
})
