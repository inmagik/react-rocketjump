import { PENDING, RUN, SUCCESS } from '../actions/actionTypes'
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
    it('Should build with selector and given actual selectors', () => {
      const obj = rj().plugins(
        rjPlugin({
          selectors: () => ({
            killHumnas: () => 'KILL HUMANS',
          }),
        })
      )
      .selectors(se => ({
        withClassy: () => se.killHumnas() + ' with classy!'
      }))
      .effect(() => Promise.resolve(9))

      expect(obj.makeSelectors().withClassy()).toBe('KILL HUMANS with classy!')
    })
  })
})
