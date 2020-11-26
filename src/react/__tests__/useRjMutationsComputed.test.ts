import rj from '../../core/rj'
import useRj from '../useRj'
import { SUCCESS, FAILURE, PENDING } from '../../core/actions/actionTypes'
import { renderHook, act } from '@testing-library/react-hooks'
import { Action } from '../../core/types'

describe('RJ mutations computed', () => {
  it('should introduce mutations state when a reducer on mutation is defined', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(1312),
          updater: () => {},
          reducer: () => ({ giova: 23 }),
        },
      },
      selectors: ({ getRoot }) => ({
        getMagik: (s) => getRoot(s).magik,
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

  it('should selecte mutations state ussing functions', async () => {
    const resolvesA: any[] = []
    const effectKill = jest.fn(() => new Promise((r) => resolvesA.push(r)))
    const effectAlbi = jest.fn().mockResolvedValue(1312)

    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: effectKill,
          updater: (s) => s,
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
          updater: (s) => s,
          reducer: (state = { albi: null }, action) => {
            if (action.type === SUCCESS) {
              // TODO: Fix this shit mutations action of redcuer
              // should be an intersection.....
              return { albi: (action as Action).payload.data }
            }
            return state
          },
        },
      },
      selectors: ({ getRoot }) => ({
        getMagik: (s) => getRoot(s).magik,
      }),
      composeReducer: (state, action) => ({
        magik: 1312,
        ...state,
      }),
      effect: () => Promise.resolve(1312),
      computed: {
        kill: s => s.mutations.killHumans,
        albi: s => s.mutations.fuckBitches.albi,
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

  it('should get angry when misconfigured mutation computed', async () => {
    expect(() => {
      const MaRjState = rj({
        mutations: {
          socio: {
            effect: () => Promise.resolve(23),
            updater: (s) => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: '@___@____mutation.skinny.fulminatoDiMercurio',
        },
      })
      const { result } = renderHook(() => useRj(MaRjState))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { skinny } = result.current[0]
    }).toThrow(/\[react-rocketjump\]/)
  })

  it('should get angry when use a bad computed selector', async () => {
    const MaRjState = rj({
      mutations: {
        socio23: {
          effect: () => Promise.resolve(23),
          reducer: () => null,
          updater: (s) => s,
        },
        socio: {
          effect: () => Promise.resolve(23),
          updater: (s) => s,
        },
      },
      effect: () => Promise.resolve('U.u'),
      computed: {
        skinny: '@mutation.socio23',
        giova: 'killTheMountains',
      },
    })
    expect(() => {
      const { result } = renderHook(() => useRj(MaRjState))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { skinny } = result.current[0]
    }).toThrow(/\[react-rocketjump\]/)
  })
})
