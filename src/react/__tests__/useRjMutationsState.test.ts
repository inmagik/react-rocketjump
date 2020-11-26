import { rj } from '../..'
import useRj from '../useRj'
import { renderHook } from '@testing-library/react-hooks'
import { INIT } from '../../core/actions/actionTypes'

describe('useRj mutations state', () => {
  it('should return the root state default', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
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
          updater: (s) => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState, (state) => state))
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
          updater: (s) => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getRoot }) => getRoot(state))
    )
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
          updater: (s) => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getMutations }) => ({
        xd: getMutations(state).killHumans,
      }))
    )
    expect(result.current[0]).toEqual({
      xd: { giova: 23 },
    })
  })

  it('should give a selector to grab mutations state deep', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getMutations }) => ({
        xd: getMutations(state).killHumans.giova,
      }))
    )
    expect(result.current[0]).toEqual({
      xd: 23,
    })
  })

  it('should be able to auto namespace selectors', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const state = maRjState.reducer(undefined, { type: INIT })
    const selectors = maRjState.makeSelectors()
    expect(selectors.getData(state)).toBe(null)
    expect(selectors.isLoading(state)).toBe(false)
  })

  it('should be able to combing mutations state into one computed ... GANG', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
          reducer: (state = { pending: true }, action) => state,
        },
        buyMoney: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
          reducer: (state = { pending: false }, action) => state,
        },
      },
      effect: () => Promise.resolve(1312),
      selectors: ({ getMutations }) => ({
        isBusy: (state) => {
          return (
            getMutations(state).killHumans.pending ||
            getMutations(state).buyMoney.pending
          )
        },
      }),
      computed: {
        buying:  s => s.mutations.buyMoney.pending,
        killing: s => s.mutations.killHumans.pending,
        busy: 'isBusy',
      },
    })

    const { result } = renderHook(() => useRj(maRjState))
    expect(result.current[0]).toEqual({
      buying: false,
      killing: true,
      busy: true,
    })
  })
})
