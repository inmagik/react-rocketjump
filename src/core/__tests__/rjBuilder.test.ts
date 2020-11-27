import { CANCEL, INIT, PENDING, RUN, SUCCESS } from '../actions/actionTypes'
import bindActionCreators from '../actions/bindActionCreators'
import rj from '../rj'
import rjPlugin from '../rjPlugin'
import { createTestRjEffectDispatcher } from '../testUtils'
import { EffectFn } from '../types'

describe('Rj Builder', () => {
  describe('Name', () => {
    it('Shold name your crafted rj object', () => {
      const obj = rj().effect({
        name: 'Bubba',
        effect: () => Promise.resolve(88),
      })
      expect(obj.name).toBe('Bubba')
    })
  })

  describe('Effect', () => {
    it('Should build with effect', async () => {
      const mockEffect = jest.fn().mockResolvedValue(88)

      const obj = rj().effect(mockEffect)

      const mockCb = jest.fn()

      const dispatch = createTestRjEffectDispatcher(obj, mockCb)
      const actions = bindActionCreators(obj.actionCreators, dispatch)
      actions.run(1, 2, 3)

      expect(mockEffect).toHaveBeenNthCalledWith(1, 1, 2, 3)

      expect(mockCb).toHaveBeenNthCalledWith(1, {
        type: RUN,
        meta: {},
        payload: {
          params: [1, 2, 3],
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
      expect(mockCb).toHaveBeenNthCalledWith(2, {
        type: PENDING,
        meta: {},
      })

      await mockEffect.mock.results[0].value

      expect(mockCb).toHaveBeenNthCalledWith(3, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [1, 2, 3],
          data: 88,
        },
      })
    })
    it('Should build with effectCaller', async () => {
      const mockEffect = jest.fn().mockResolvedValue(30)

      const mockEffectCaller = jest.fn((fn: EffectFn, a: number) => {
        return (fn(a + 2) as Promise<number>).then((r) => r * 2)
      })

      const obj = rj().effect({
        effectCaller: mockEffectCaller,
        effect: mockEffect,
      })

      const mockCb = jest.fn()

      const dispatch = createTestRjEffectDispatcher(obj, mockCb)
      const actions = bindActionCreators(obj.actionCreators, dispatch)
      actions.run(18)

      expect(mockEffect).toHaveBeenNthCalledWith(1, 20)
      expect(mockEffectCaller).toHaveBeenNthCalledWith(1, mockEffect, 18)

      expect(mockCb).toHaveBeenNthCalledWith(1, {
        type: RUN,
        meta: {},
        payload: {
          params: [18],
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
      expect(mockCb).toHaveBeenNthCalledWith(2, {
        type: PENDING,
        meta: {},
      })

      await mockEffect.mock.results[0].value

      expect(mockCb).toHaveBeenNthCalledWith(3, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [18],
          data: 60,
        },
      })
    })
  })

  describe('Selectors', () => {
    it('Should build with selectors and given actual selectors', () => {
      const obj = rj()
        .plugins(
          rjPlugin({
            selectors: () => ({
              killHumnas: () => 'KILL HUMANS',
            }),
          })
        )
        .selectors((se) => ({
          withClassy: () => se.killHumnas() + ' with classy!',
        }))
        .effect(() => Promise.resolve(9))

      expect(obj.makeSelectors().withClassy()).toBe('KILL HUMANS with classy!')
    })
    it('Shuld build with selctors and have acess to ALL state event the mutations state', () => {
      const obj = rj()
        .plugins(
          rjPlugin({
            combineReducers: {
              drago: () => ({ bros: ['Skaffo'] }),
            },
          }),
          rjPlugin({
            combineReducers: {
              dragoVerde: () => ({ sis: ['Maddy'] }),
            },
          })
        )
        .composeReducer((state, action) => ({
          ...state,
          sure: { for: 'For Sure' },
        }))
        .mutations({
          muta: {
            effect: () => Promise.resolve(88),
            updater: (s) => s,
            reducer: () => [1, 2, 3, 4],
          },
        })
        .selectors((se) => ({
          notSoSimple2Infer: (state) =>
            state.drago.bros.concat(state.dragoVerde.sis).join(',') +
            ' ' +
            state.mutations.muta.join(',') +
            ' Chiama il contatto ' +
            state.root.sure.for.toLowerCase(),
        }))
        .effect(() => Promise.resolve(88))

      const state = obj.reducer(undefined, { type: INIT })
      expect(obj.makeSelectors().notSoSimple2Infer(state)).toBe(
        'Skaffo,Maddy 1,2,3,4 Chiama il contatto for sure'
      )
    })
  })

  describe('Reducer', () => {
    it('Should build with reducer and composeReducer', () => {
      const obj = rj()
        .reducer((r) => (state: { x: number } = { x: 0 }, action) => {
          if (action.type === 'X') {
            return {
              x: state.x + 1,
            }
          }
          return {
            x: state.x,
          }
        })
        .composeReducer((state, action) => {
          if (action.type === 'Y') {
            return {
              x: state.x + 10,
            }
          }
          return state
        })
        .effect(() => Promise.resolve(88))

      let state: { root: { x: number } }
      state = obj.reducer(undefined, { type: INIT })

      expect(state.root).toEqual({
        x: 0,
      })

      state = obj.reducer(state, { type: 'X' })
      expect(state.root).toEqual({
        x: 1,
      })
      state = obj.reducer(state, { type: 'Y' })
      expect(state.root).toEqual({
        x: 11,
      })
    })
    it('Should build with combineReducers', () => {
      const obj = rj()
        .combineReducers({
          un: (state = 'UN', action) => state,
          dos: (state: string = 'dos', action) => state.toUpperCase(),
        })
        .combineReducers({
          // NOTE: For now you must help ts with type hints....
          tres: (state: string = 'x', action): string => {
            if (action.type === CANCEL) {
              return '*CLEANED*'
            }
            return 'TRES'
          },
        })
        .reducer((r) => () => null)
        .effect(() => Promise.resolve(88))

      let state: { un: string; dos: string; tres: string; root: null }
      state = obj.reducer(undefined, { type: INIT })

      expect(state).toEqual({
        root: null,
        un: 'UN',
        dos: 'DOS',
        tres: 'TRES',
      })

      state = obj.reducer(state, obj.actionCreators.clean())

      expect(state).toEqual({
        root: null,
        un: 'UN',
        dos: 'DOS',
        tres: 'TRES',
      })
    })
  })

  describe('Actions', () => {
    it('Should build with actions', () => {
      const obj = rj()
        .actions(() => ({
          drago: (s: string) => ({ type: 'DRAGO', say: s }),
        }))
        .actions((a) => ({
          drgonNero: () => a.drago('Bella Drago'),
        }))
        .effect(() => Promise.resolve(88))

      expect(obj.actionCreators.drago('Bu')).toEqual({
        type: 'DRAGO',
        say: 'Bu',
      })

      expect(obj.actionCreators.drgonNero()).toEqual({
        type: 'DRAGO',
        say: 'Bella Drago',
      })
    })
  })

  describe('Computed', () => {
    it('Should build with computed', () => {
      const obj = rj()
        .plugins(
          rjPlugin({
            reducer: (r) => (state) => ({ xd: 'Giova Says' }),
            selectors: () => ({
              killHumnas: () => 'KILL HUMANS',
            }),
          })
        )
        .selectors((se) => ({
          sayGoodBey: (state) => state.root.xd + ' Good Bye',
          withClassy: () => se.killHumnas() + ' with classy!',
        }))
        .computed({
          hat3: (s) => s.root.xd + ' Fuck The World!',
          drag0: 'sayGoodBey',
          arg0: 'withClassy',
        })
        .effect(() => Promise.resolve(99))

      const state = obj.reducer(undefined, { type: INIT })
      const computedState = obj.computeState(state, obj.makeSelectors())
      expect(computedState).toEqual({
        hat3: 'Giova Says Fuck The World!',
        drag0: 'Giova Says Good Bye',
        arg0: 'KILL HUMANS with classy!',
      })
    })
  })
})
