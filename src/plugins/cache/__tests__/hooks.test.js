import React, { Suspense } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import rj from '../../../rj'
import rjCache, {
  useRunRjCache,
  clearInMemoryStore,
  usePrefetchRj,
} from '../index'

beforeEach(() => {
  clearInMemoryStore()
})

describe('useRunRjCache', () => {
  it('should fill the rj state with cache and honored the cache options', async () => {
    const effect = jest.fn(a => Promise.resolve({ effectData: a }))
    const maRjState = rj(
      rjCache({
        ns: 'gang',
        size: 2,
      }),
      {
        effect,
      }
    )

    function Wrapper({ children }) {
      return <Suspense fallback={<div>loading</div>}>{children}</Suspense>
    }

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ name }) => useRunRjCache(maRjState, [name]),
      {
        wrapper: Wrapper,
        initialProps: { name: 'GioVa' },
      }
    )

    expect(effect).toHaveBeenCalledTimes(1)

    // Suspends
    expect(result.current).toBe(null)
    await waitForNextUpdate()

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Rinne' })
    })
    expect(effect).toHaveBeenCalledTimes(2)

    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'GioVa' })
    })
    expect(effect).toHaveBeenCalledTimes(2)

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Albi' })
    })
    expect(effect).toHaveBeenCalledTimes(3)

    expect(result.current[0]).toEqual({
      data: { effectData: 'Albi' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Rinne' })
    })
    expect(effect).toHaveBeenCalledTimes(4)

    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: false,
      error: null,
    })
  })

  it('should skip the cache when cache option is false', async () => {
    const effect = jest.fn(a => Promise.resolve({ effectData: a }))
    const maRjState = rj(
      rjCache({
        ns: 'gang',
        size: 10,
      }),
      {
        effect,
      }
    )

    function Wrapper({ children }) {
      return <Suspense fallback={<div>loading</div>}>{children}</Suspense>
    }

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ name, cache }) =>
        useRunRjCache(maRjState, [name], {
          cache,
        }),
      {
        wrapper: Wrapper,
        initialProps: { name: 'GioVa', cache: true },
      }
    )

    expect(effect).toHaveBeenCalledTimes(1)

    // Suspends
    expect(result.current).toBe(null)
    await waitForNextUpdate()

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Rinne', cache: true })
    })
    expect(effect).toHaveBeenCalledTimes(2)

    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'GioVa', cache: false })
    })
    expect(effect).toHaveBeenCalledTimes(3)

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })
  })

  it('should avoid suspense when suspense option is false', async () => {
    const effect = jest.fn(a => Promise.resolve({ effectData: a }))
    const maRjState = rj(
      rjCache({
        ns: 'gang',
        size: 10,
      }),
      {
        effect,
      }
    )

    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ name }) =>
        useRunRjCache(maRjState, [name], {
          suspense: false,
        }),
      {
        initialProps: { name: 'GioVa' },
      }
    )

    expect(effect).toHaveBeenCalledTimes(1)

    expect(result.current[0]).toEqual({
      data: null,
      pending: true,
      error: null,
    })

    await waitForNextUpdate()

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Rinne' })
    })
    expect(effect).toHaveBeenCalledTimes(2)

    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: false,
      error: null,
    })
  })

  it('should suspends on new effect when suspendOnNewEffect option is true', async () => {
    const _resolves = []
    const effect = jest.fn(
      a =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const maRjState = rj(
      rjCache({
        ns: 'gang',
        size: 10,
      }),
      {
        effect,
      }
    )

    function Wrapper({ children }) {
      return <Suspense fallback={<div>loading</div>}>{children}</Suspense>
    }

    const _throws = []
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ name, suspendOnNewEffect }) => {
        try {
          return useRunRjCache(maRjState, [name], {
            suspendOnNewEffect,
          })
        } catch (err) {
          _throws.push(err)
          throw err
        }
      },
      {
        initialProps: { name: 'GioVa', suspendOnNewEffect: true },
        wrapper: Wrapper,
      }
    )

    expect(effect).toHaveBeenCalledTimes(1)
    expect(result.current).toBe(null)

    _resolves[0]({ effectData: 'GioVa' })
    expect(_throws.length).toBe(1)

    await waitForNextUpdate()

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'Rinne', suspendOnNewEffect: true })
    })
    expect(effect).toHaveBeenCalledTimes(2)
    expect(_throws.length).toBe(2)

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })

    _resolves[1]({ effectData: 'Rinne' })
    expect(_throws[1]).resolves.toEqual({
      effectData: 'Rinne',
    })
    await waitForNextUpdate()

    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: false,
      error: null,
    })

    await act(async () => {
      await rerender({ name: 'BaBu', suspendOnNewEffect: false })
    })
    expect(effect).toHaveBeenCalledTimes(3)
    expect(_throws.length).toBe(2)
    expect(result.current[0]).toEqual({
      data: { effectData: 'Rinne' },
      pending: true,
      error: null,
    })
    await act(async () => {
      _resolves[2]({ effectData: 'Babu' })
    })
    expect(result.current[0]).toEqual({
      data: { effectData: 'Babu' },
      pending: false,
      error: null,
    })
  })
})

describe('usePrefetchRj', () => {
  it('should prefetch an rj with given params', async () => {
    const _resolves = []
    const effect = jest.fn(
      a =>
        new Promise(resolve => {
          _resolves.push(() => resolve({ effectData: a }))
        })
    )
    const maRjState = rj(
      rjCache({
        ns: 'gang',
        size: 2,
      }),
      {
        effect,
      }
    )

    function Wrapper({ children }) {
      return <Suspense fallback={<div>loading</div>}>{children}</Suspense>
    }

    const { result: resultP } = renderHook(() => usePrefetchRj(maRjState), {
      wrapper: Wrapper,
    })
    const prefetch = resultP.current

    prefetch(['GioVa'])
    expect(effect).toHaveBeenCalledTimes(1)
    prefetch(['GioVa'])
    expect(effect).toHaveBeenCalledTimes(1)

    const { result, waitForNextUpdate } = renderHook(
      ({ name }) => useRunRjCache(maRjState, [name]),
      {
        wrapper: Wrapper,
        initialProps: { name: 'GioVa' },
      }
    )

    expect(effect).toHaveBeenCalledTimes(1)

    // Suspends
    expect(result.current).toBe(null)
    _resolves[0]()
    await waitForNextUpdate()

    expect(effect).toHaveBeenCalledTimes(1)

    expect(result.current[0]).toEqual({
      data: { effectData: 'GioVa' },
      pending: false,
      error: null,
    })
  })
})
