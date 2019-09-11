import rj from '../../rj'
import useRj from '../../useRj'
import { renderHook } from '@testing-library/react-hooks'

describe('RJ mutations computed', () => {
  it('should work as expected without break ... for now', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: () => {},
          reducer: () => ({ giova: 23 }),
        },
      },
      selectors: () => ({
        getMagik: s => s.magik,
      }),
      composeReducer: (state, action) => ({
        magik: 1312,
        ...state,
      }),
      effect: () => Promise.resolve(1312),
      computed: {
        fumello: 'getData',
        magik: 'getMagik',
      },
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
    })
  })

  it('should support @mutation computed', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: () => {},
          reducer: () => ({ giova: 23 }),
        },
        fuckBitches: {
          effect: () => {},
          updater: () => {},
          reducer: () => ({ albi: 1312 }),
        },
      },
      selectors: () => ({
        getMagik: s => s.magik,
      }),
      composeReducer: (state, action) => ({
        magik: 1312,
        ...state,
      }),
      effect: () => Promise.resolve(1312),
      computed: {
        ggg: '@mutation.killHumans',
        albi: '@mutation.fuckBitches.albi',
        fumello: 'getData',
        magik: 'getMagik',
      },
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
      albi: 1312,
      ggg: { giova: 23 },
    })
  })
})
