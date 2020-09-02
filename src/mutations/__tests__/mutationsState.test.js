import rj from '../../rj'
import useRj from '../../useRj'
import { renderHook } from '@testing-library/react-hooks'

describe('RJ mutations state', () => {
  it('should return the root state default', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState))
    expect(result.current[0]).toEqual({
      pending: false,
      data: null,
      error: null,
    })
  })

  it('should return all state when select state was given', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState, state => state))
    expect(result.current[0]).toEqual({
      root: {
        pending: false,
        data: null,
        error: null,
      },
      mutations: {
        killHumans: { giova: 23 },
      },
    })
  })

  it('should give a selector to grab the root state from select state', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const selectState = (state, { getRoot }) => getRoot(state)
    const { result } = renderHook(() => useRj(maRjState, selectState))
    expect(result.current[0]).toEqual({
      pending: false,
      data: null,
      error: null,
    })
  })

  it('should give a selector to grab mutation state', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const selectState = (state, { getMutation }) => ({
      xd: getMutation(state, 'killHumans'),
    })
    const { result } = renderHook(() => useRj(maRjState, selectState))
    expect(result.current[0]).toEqual({
      xd: { giova: 23 },
    })
  })

  it('should give a selector to grab mutation state deep', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const selectState = (state, { getMutation }) => ({
      xd: getMutation(state, 'killHumans.giova'),
    })
    const { result } = renderHook(() => useRj(maRjState, selectState))
    expect(result.current[0]).toEqual({
      xd: 23,
    })
  })
})
