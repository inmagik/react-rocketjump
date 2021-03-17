import { INIT } from '../actions/actionTypes'
import rj from '../rj'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('React-RocketJump computeState', () => {
  it('should compute root state default', () => {
    const obj = rj({
      composeReducer: (state) => ({
        ...state,
        giova: 23,
      }),
      effect: () => Promise.resolve(99),
    })

    const state = obj.reducer(undefined, { type: INIT })
    const selectors = obj.makeSelectors()
    const computedState = obj.computeState(state, selectors)
    expect(computedState).toEqual({
      giova: 23,
      data: null,
      pending: false,
      error: null,
    })
  })
  it('should compute state accordining to computed config', () => {
    const obj = rj({
      composeReducer: (state) => ({
        ...state,
        giova: 23,
      }),
      selectors: () => ({
        getGG: (s) => s.root.giova,
        ohh: (s) => s.gang,
      }),
      combineReducers: {
        gang: (s = 'HELLO') => s,
      },
      computed: {
        rinne: 'ohh',
        aspetta: 'isLoading',
        drago: 'getGG',
      },
      effect: () => Promise.resolve(99),
    })

    const state = obj.reducer(undefined, { type: INIT })
    const selectors = obj.makeSelectors()
    const computedState = obj.computeState(state, selectors)
    expect(computedState).toEqual({
      rinne: 'HELLO',
      aspetta: false,
      drago: 23,
    })
  })
  it('should compute state accordining to computed config ... and handle inline selector computed', () => {
    const obj = rj({
      composeReducer: (state) => ({
        ...state,
        giova: 23,
      }),
      selectors: () => ({
        getGG: (s) => s.root.giova,
        ohh: (s) => s.gang,
      }),
      combineReducers: {
        gang: (s = 'HELLO') => s,
      },
      computed: {
        rinne: (s) => s.gang,
        aspetta: 'isLoading',
        drago: (s) => s.root.giova,
      },
      effect: () => Promise.resolve(99),
    })

    const state = obj.reducer(undefined, { type: INIT })
    const selectors = obj.makeSelectors()
    const computedState = obj.computeState(state, selectors)
    expect(computedState).toEqual({
      rinne: 'HELLO',
      aspetta: false,
      drago: 23,
    })
  })

  it('should get angry when misconfigured computed', async () => {
    expect(() => {
      const obj = rj({
        mutations: {
          socio: {
            effect: () => Promise.resolve(23),
            updater: (s) => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: 'FFFxxxxxGANG!',
        },
      })
      const state = obj.reducer(undefined, { type: INIT })
      const selectors = obj.makeSelectors()
      obj.computeState(state, selectors)
    }).toThrow(/^\[react-rocketjump\].+\[FFFxxxxxGANG!\]/)
  })

  it('should get angry (shortly in production) when misconfigured computed', async () => {
    process.env.NODE_ENV = 'production'
    expect(() => {
      const obj = rj({
        mutations: {
          socio: {
            effect: () => Promise.resolve(23),
            updater: (s) => s,
          },
        },
        effect: () => Promise.resolve('U.u'),
        computed: {
          skinny: 'frodo',
        },
      })
      const state = obj.reducer(undefined, { type: INIT })
      const selectors = obj.makeSelectors()
      obj.computeState(state, selectors)
    }).toThrow(/^\[react-rocketjump\] @computed error.$/)
  })
})
