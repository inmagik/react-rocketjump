import rj from '../../rj'
import useRj from '../../useRj'
import { SUCCESS, FAILURE, PENDING } from '../../actionTypes'
import { renderHook, act } from '@testing-library/react-hooks'

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
    const resolvesA = []
    const effectKill = jest.fn(() => new Promise(r => resolvesA.push(r)))
    const effectAlbi = jest.fn().mockResolvedValue(1312)

    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: effectKill,
          updater: s => s,
          reducer: (state = { pending: false }, { type }) => {
            if (type === PENDING) {
              return { ...state, pending: true }
            }
            if (type === SUCCESS || type === FAILURE) {
              return { ...state, pending: false }
            }
            return state
          },
        },
        fuckBitches: {
          effect: effectAlbi,
          updater: s => s,
          reducer: (state = { albi: null }, action) => {
            if (action.type === SUCCESS) {
              return { albi: action.payload.data }
            }
            return state
          },
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
        kill: '@mutation.killHumans',
        albi: '@mutation.fuckBitches.albi',
        fumello: 'getData',
        magik: 'getMagik',
      },
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
      albi: null,
      kill: { pending: false },
    })

    await act(async () => {
      result.current[1].killHumans()
    })

    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
      albi: null,
      kill: { pending: true },
    })

    await act(async () => {
      resolvesA[0]()
    })

    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
      albi: null,
      kill: { pending: false },
    })

    await act(async () => {
      result.current[1].fuckBitches()
    })

    expect(result.current[0]).toEqual({
      fumello: null,
      magik: 1312,
      albi: 1312,
      kill: { pending: false },
    })
  })
})
