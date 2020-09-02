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

  it('should get angry when misconfigured mutation computed', async () => {
    expect(() => {
      const MaRjState = rj({
        mutations: {
          socio: {
            effect: () => Promise.resolve(23),
            updater: s => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: '@mutation.skinny.fulminatoDiMercurio',
        },
      })
      const { result } = renderHook(() => useRj(MaRjState))
      // eslint-disable-next-line no-unused-vars
      const { skinny } = result.current[0]
    }).toThrow(/\[rocketjump\]/)
  })

  it('should get angry when miss mutation key of computed', async () => {
    expect(() => {
      rj({
        mutations: {
          socio: {
            effect: () => Promise.resolve(23),
            reducer: (s = {}) => s,
            updater: s => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: '@mutation.skinny.fulminatoDiMercurio.xd',
        },
      })
    }).toThrow(/\[react-rocketjump\]/)
  })

  it('should get angry when use a mutation key of computed with no state', async () => {
    expect(() => {
      rj({
        mutations: {
          socio23: {
            effect: () => Promise.resolve(23),
            reducer: () => null,
            updater: s => s,
          },
          socio: {
            effect: () => Promise.resolve(23),
            updater: s => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: '@mutation.socio',
        },
      })
    }).toThrow(/\[react-rocketjump\]/)
  })

  it('should get angry when use a bad computed selector', async () => {
    const MaRjState = rj({
      mutations: {
        socio23: {
          effect: () => Promise.resolve(23),
          reducer: () => null,
          updater: s => s,
        },
        socio: {
          effect: () => Promise.resolve(23),
          updater: s => s,
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
      // eslint-disable-next-line no-unused-vars
      const { skinny } = result.current[0]
    }).toThrow(/\[react-rocketjump\]/)
  })
})
