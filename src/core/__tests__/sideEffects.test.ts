import {
  RUN,
  CANCEL,
  CLEAN,
  FAILURE,
  PENDING,
  SUCCESS,
} from '../actions/actionTypes'
import rj from '../rj'
import { createTestRJSubscription } from '../testUtils'
import rjPlugin from '../rjPlugin'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators'
import takeEffectsHanlders, {
  TAKE_EFFECT_LATEST,
  TAKE_EFFECT_EVERY,
  TAKE_EFFECT_EXHAUST,
  TAKE_EFFECT_CONCAT_LATEST,
  TAKE_EFFECT_GROUP_BY,
  TAKE_EFFECT_GROUP_BY_EXHAUST,
  TAKE_EFFECT_GROUP_BY_CONCAT_LATEST,
} from '../effect/takeEffects'
import bindActionCreators from '../actions/bindActionCreators'
import { makeEffectAction } from '../actions/effectAction'
import { EffectAction, EffectCallerFn, HookEffectAction } from '../types'
import { forkJoin, from, Observable } from 'rxjs'

jest.useFakeTimers()

describe('RJ side effect model', () => {
  describe('Base take effect', () => {
    it('should run an async api and dispatch PENDING and SUCCESS actions when resolved', (done) => {
      const mockApiResult = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: mockApiResult,
          },
        })

        done()
      })
    })

    it('should support using rxEffects as function as valid take effects', (done) => {
      const mockApiResult = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: takeEffectsHanlders[TAKE_EFFECT_LATEST],
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: mockApiResult,
          },
        })

        done()
      })
    })

    it('should be cancelable', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(1312)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: CANCEL,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: CANCEL,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        done()
      })
    })

    it('should run an async api and dispatch LOADING and FAILURE actions when rejected', (done) => {
      const mockBadApi = jest.fn(() => Promise.reject('Something bad happened'))
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockBadApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      mockBadApi.mock.results[0].value.catch(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: FAILURE,
          meta: {},
          payload: 'Something bad happened',
        })

        done()
      })
    })

    it('should pass params to api function', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(1)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [1, 'a', {}, undefined] },
        meta: {},
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockApi).toBeCalledWith(1, 'a', {}, undefined)

        done()
      })
    })

    it('should dispatch meta along with actions', (done) => {
      const mockApiResult = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: { a: 1, b: 2 },
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: { a: 1, b: 2 },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: { a: 1, b: 2 },
        })

        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: { a: 1, b: 2 },
          payload: {
            params: [],
            data: mockApiResult,
          },
        })

        done()
      })
    })

    it('should dispatch meta along with actions also when reject', (done) => {
      const mockBadApi = jest.fn(() => Promise.reject('Something bad happened'))
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockBadApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: { a: 1, b: 2 },
        callbacks: {},
      })

      mockBadApi.mock.results[0].value.catch(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: { a: 1, b: 2 },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: { a: 1, b: 2 },
        })

        expect(mockCallback).nthCalledWith(3, {
          type: FAILURE,
          meta: { a: 1, b: 2 },
          payload: 'Something bad happened',
        })

        done()
      })
    })

    it('can unload a side effect', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(1)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: CLEAN,
          meta: {},
          payload: {
            params: [],
          },
          callbacks: {},
        })

        done()
      })
    })

    it('call provided takeEffect when function is given', async () => {
      const mockApi = jest.fn().mockResolvedValue(1312)
      const customMockTakeEffect = jest
        .fn()
        .mockImplementation((actionObservable, stateObservable, { effect }) =>
          forkJoin({
            drago: from(effect()),
            drago2x: from(effect()),
          }).pipe(
            map((result) => ({
              type: '2X',
              payload: result,
            }))
          )
        )

      const RjObject = rj({
        effect: mockApi,
        takeEffect: customMockTakeEffect,
      })

      const mockSub = jest.fn()
      const subject = createTestRJSubscription(RjObject, mockSub)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      expect(customMockTakeEffect).toHaveBeenCalledTimes(1)
      expect(customMockTakeEffect).toHaveBeenNthCalledWith(
        1,
        expect.any(Observable),
        expect.any(Observable),
        {
          effect: mockApi,
          getEffectCaller: expect.any(Function),
          prefix: '',
        }
      )

      expect(mockApi).toHaveBeenCalledTimes(2)
      await mockApi.mock.results[0].value
      await mockApi.mock.results[1].value

      expect(mockSub).toHaveBeenNthCalledWith(1, {
        type: '2X',
        payload: {
          drago: 1312,
          drago2x: 1312,
        },
      })
    })

    it('emit successCallback along action when SUCCESS is produced', async () => {
      const mockCallback = jest.fn()
      const mockApiResult = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      const onSuccess = () => {}

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: onSuccess,
        },
      })

      await mockApi.mock.results[0].value

      expect(mockCallback).nthCalledWith(3, {
        type: SUCCESS,
        payload: { data: mockApiResult, params: [] },
        meta: {},
        successCallback: onSuccess,
      })
    })

    it('emit failureCallback along action when FAILURE is produced', async () => {
      const mockCallback = jest.fn()
      const mockApi = jest.fn().mockRejectedValueOnce('Fuck')

      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      const onFailure = () => {}

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {
          onFailure: onFailure,
        },
      })

      try {
        await mockApi.mock.results[0].value
      } catch {}

      expect(mockCallback).nthCalledWith(3, {
        type: FAILURE,
        payload: 'Fuck',
        meta: {},
        failureCallback: onFailure,
      })
    })

    it('should ignore non standard actions', () => {
      const mockApi = jest.fn()

      const mockCallback = jest.fn()

      const RjObject = rj({
        actions: () => ({
          zz: (...params) => makeEffectAction('ZZ_TOP', params),
          zzGang: (...params) => makeEffectAction('ZZ_TOP_GANG', params),
        }),
        effect: mockApi,
      })

      const { actionCreators } = RjObject
      const subject = createTestRJSubscription(RjObject, mockCallback)
      const dispatch = (action: any) => subject.next(action)
      const actions = bindActionCreators(actionCreators, dispatch)

      actions.zz()
      actions.zzGang()

      expect(mockCallback).toBeCalledTimes(0)
    })

    it('should throw proper errors', async () => {
      const badApi = () =>
        new Promise((resolve) => {
          const a = {} as any
          resolve(a.b.c)
        })

      const error = await new Promise((resolve) => {
        const mockCallback = jest.fn()
        const mockError = jest.fn((err) => {
          resolve(err)
        })

        const RjObject = rj({
          effect: badApi,
        })
        const subject = createTestRJSubscription(
          RjObject,
          mockCallback,
          mockError
        )

        subject.next({
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })
      })

      expect(error).toBeInstanceOf(Error)
    })

    it('gets angry if unknown takeEffect in provided', () => {
      const mockApi = jest.fn(() => Promise.resolve(99))

      const RjObject = rj({
        effect: mockApi,
        takeEffect: 'blabla' as any,
      })

      expect(() => createTestRJSubscription(RjObject)).toThrow()
    })
  })

  describe('takeEffect latest', () => {
    it('takes only the last side effect as default', (done) => {
      const mockApi = jest
        .fn()
        .mockResolvedValueOnce('Alice')
        .mockResolvedValueOnce('Bob')
      const mockCallback = jest.fn()
      const RjObject = rj({
        effect: mockApi,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // At this point all the side effect fn are called
      expect(mockApi).toBeCalledTimes(2)

      mockApi.mock.results[1].value.then(() => {
        expect(mockCallback).toBeCalledTimes(5)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(5, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Bob',
          },
        })

        done()
      })
    })
  })

  describe('takeEffect every', () => {
    it('takes every side effect when specified', (done) => {
      const mockApi = jest
        .fn()
        .mockResolvedValueOnce('Alice')
        .mockResolvedValueOnce('Bob')

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EVERY,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // At this point all the side effect fn are called
      expect(mockApi).toBeCalledTimes(2)

      mockApi.mock.results[1].value.then(() => {
        expect(mockCallback).toBeCalledTimes(6)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(5, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Alice',
          },
        })

        expect(mockCallback).nthCalledWith(6, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Bob',
          },
        })

        done()
      })
    })

    it('takes every side effect and dispatch succees in order of completation', (done) => {
      const resolves: any[] = []
      const mockApi = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gio Va'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Ma Ik'))
            })
        )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EVERY,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // At this point all the side effect fn are called
      expect(mockApi).toBeCalledTimes(2)

      // Resolve the second promise
      resolves[1]()
      // ... then resolve the first promise
      resolves[0]()

      mockApi.mock.results[1].value.then(() => {
        expect(mockCallback).toBeCalledTimes(6)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(5, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Ma Ik',
          },
        })

        expect(mockCallback).nthCalledWith(6, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Gio Va',
          },
        })

        done()
      })
    })

    it('can unload a every side effect', (done) => {
      const mockApi = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(23)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: 'every',
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['GioVa'] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: CLEAN,
        payload: { params: [] },
        callbacks: {},
        meta: {},
      })

      mockApi.mock.results[1].value.then(() => {
        expect(mockCallback).toBeCalledTimes(5)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: ['GioVa'] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(5, {
          type: CLEAN,
          meta: {},
          callbacks: {},
          payload: {
            params: [],
          },
        })

        subject.next({
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        mockApi.mock.results[1].value.then(() => {
          expect(mockCallback).toBeCalledTimes(8)

          expect(mockCallback).nthCalledWith(6, {
            type: RUN,
            payload: { params: [] },
            meta: {},
            callbacks: {},
          })

          expect(mockCallback).nthCalledWith(7, {
            type: PENDING,
            meta: {},
          })

          expect(mockCallback).nthCalledWith(8, {
            type: SUCCESS,
            meta: {},
            payload: {
              params: [],
              data: 23,
            },
          })

          done()
        })
      })
    })
  })

  describe('takeEffect exhaust', () => {
    it('takes exhaust side effect when specified', (done) => {
      const resolves: any[] = []
      const mockApi = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gio Va'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Ma Ik'))
            })
        )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EXHAUST,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // Should ignore
      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // At this point only the first side effect function should be caled
      expect(mockApi).toBeCalledTimes(1)

      // Resolve the first
      resolves[0]()

      mockApi.mock.results[0].value.then(() => {
        // At this point the side effect fn still called once
        expect(mockApi).toBeCalledTimes(1)
        subject.next({
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })
        // At this point finally should be called twice
        expect(mockApi).toBeCalledTimes(2)
        // Resolve the second
        resolves[1]()
        mockApi.mock.results[1].value.then(() => {
          expect(mockCallback).nthCalledWith(1, {
            type: RUN,
            payload: { params: [] },
            meta: {},
            callbacks: {},
          })

          expect(mockCallback).nthCalledWith(2, {
            type: PENDING,
            meta: {},
          })

          expect(mockCallback).nthCalledWith(3, {
            type: SUCCESS,
            meta: {},
            payload: {
              params: [],
              data: 'Gio Va',
            },
          })

          expect(mockCallback).nthCalledWith(4, {
            type: RUN,
            payload: { params: [] },
            meta: {},
            callbacks: {},
          })

          expect(mockCallback).nthCalledWith(5, {
            type: PENDING,
            meta: {},
          })

          expect(mockCallback).nthCalledWith(6, {
            type: SUCCESS,
            meta: {},
            payload: {
              params: [],
              data: 'Ma Ik',
            },
          })

          done()
        })
      })
    })

    it('should not ignore cancel and clean in exhaust side effect', () => {
      const mockApi = jest.fn()
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EXHAUST,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      subject.next({
        type: CANCEL,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      expect(mockCallback).toBeCalledTimes(2)
      expect(mockCallback).nthCalledWith(1, {
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      expect(mockCallback).nthCalledWith(2, {
        type: CANCEL,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
    })

    it('can unload a exhaust side effect', (done) => {
      const mockApi = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(23)
      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EXHAUST,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['GioVa'] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(1)

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: CLEAN,
          meta: {},
          payload: {
            params: [],
          },
          callbacks: {},
        })
        subject.next({
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })
        subject.next({
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        mockApi.mock.results[1].value.then(() => {
          expect(mockCallback).toBeCalledTimes(6)

          expect(mockCallback).nthCalledWith(4, {
            type: RUN,
            payload: { params: [] },
            meta: {},
            callbacks: {},
          })

          expect(mockCallback).nthCalledWith(5, {
            type: PENDING,
            meta: {},
          })

          expect(mockCallback).nthCalledWith(6, {
            type: SUCCESS,
            meta: {},
            payload: {
              params: [],
              data: 23,
            },
          })

          done()
        })
      })
    })
  })

  describe('takeEffect concatLatest', () => {
    it('takes concat latest side effect when specified', async () => {
      const resolves: any[] = []
      const mockApi = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gio Va'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Maddy'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Ma Ik'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Drako'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gang'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Yess'))
            })
        )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_CONCAT_LATEST,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      // Ingnored ...
      subject.next({
        type: RUN,
        payload: { params: [2] },
        meta: {},
        callbacks: {},
      })

      // enqueue
      subject.next({
        type: RUN,
        payload: { params: [3] },
        meta: {},
        callbacks: {},
      })

      // At this point only the first side effect function should be caled
      expect(mockApi).toBeCalledTimes(1)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      resolves[0]()

      await mockApi.mock.results[0].value

      expect(mockApi).toBeCalledTimes(2)

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(3, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [1],
          data: 'Gio Va',
        },
      })

      expect(mockCallback).nthCalledWith(4, {
        type: RUN,
        payload: { params: [3] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(5, {
        type: PENDING,
        meta: {},
      })

      resolves[1]()
      await mockApi.mock.results[1].value

      expect(mockCallback).nthCalledWith(6, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [3],
          data: 'Maddy',
        },
      })

      expect(mockApi).toBeCalledTimes(2)
      expect(mockCallback).toBeCalledTimes(6)

      subject.next({
        type: RUN,
        payload: { params: [4] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(7, {
        type: RUN,
        payload: { params: [4] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(3)

      subject.next({
        type: CANCEL,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(8, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(9, {
        type: CANCEL,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      resolves[2]()
      await mockApi.mock.results[2].value

      expect(mockCallback).toBeCalledTimes(9)

      subject.next({
        type: RUN,
        payload: { params: [5] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(4)

      expect(mockCallback).nthCalledWith(10, {
        type: RUN,
        payload: { params: [5] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(11, {
        type: PENDING,
        meta: {},
      })

      resolves[3]()
      await mockApi.mock.results[3].value

      expect(mockCallback).nthCalledWith(12, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [5],
          data: 'Drako',
        },
      })

      subject.next({
        type: RUN,
        payload: { params: [6] },
        meta: {},
        callbacks: {},
      })
      subject.next({
        type: RUN,
        payload: { params: [7] },
        meta: {},
        callbacks: {},
      })
      subject.next({
        type: RUN,
        payload: { params: [8] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(5)
      expect(mockCallback).nthCalledWith(13, {
        type: RUN,
        payload: { params: [6] },
        meta: {},
        callbacks: {},
      })

      resolves[4]()
      await mockApi.mock.results[4].value

      expect(mockApi).toBeCalledTimes(6)

      expect(mockCallback).nthCalledWith(14, {
        type: PENDING,
        meta: {},
      })
      expect(mockCallback).nthCalledWith(15, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [6],
          data: 'Gang',
        },
      })
      expect(mockCallback).toBeCalledTimes(17)
      expect(mockCallback).nthCalledWith(16, {
        type: RUN,
        payload: { params: [8] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(17, {
        type: PENDING,
        meta: {},
      })
      subject.next({
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      expect(mockCallback).nthCalledWith(18, {
        type: CLEAN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })
      expect(mockCallback).toBeCalledTimes(18)
    })

    it('takes concat latest side effect when specified ... and never miss a run', async () => {
      const resolves: any[] = []
      const mockApi = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gio Va'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Maddy'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Ma Ik'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Drako'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gang'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Yess'))
            })
        )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_CONCAT_LATEST,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      // Ingnored ...
      subject.next({
        type: RUN,
        payload: { params: [2] },
        meta: {},
        callbacks: {},
      })

      // enqueue
      subject.next({
        type: RUN,
        payload: { params: [3] },
        meta: {},
        callbacks: {},
      })

      // At this point only the first side effect function should be caled
      expect(mockApi).toBeCalledTimes(1)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      resolves[0]()

      await mockApi.mock.results[0].value

      expect(mockApi).toBeCalledTimes(2)

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(3, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [1],
          data: 'Gio Va',
        },
      })

      expect(mockCallback).nthCalledWith(4, {
        type: RUN,
        payload: { params: [3] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(5, {
        type: PENDING,
        meta: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['???'] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: [4] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(2)

      resolves[1]()
      await mockApi.mock.results[1].value

      expect(mockCallback).nthCalledWith(6, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [3],
          data: 'Maddy',
        },
      })

      expect(mockApi).toBeCalledTimes(3)

      expect(mockCallback).nthCalledWith(7, {
        type: RUN,
        payload: { params: [4] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(8, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).toBeCalledTimes(8)

      resolves[2]()
      await mockApi.mock.results[2].value

      expect(mockCallback).nthCalledWith(9, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [4],
          data: 'Ma Ik',
        },
      })
    })
  })

  describe('takeEffect groupBy', () => {
    it('take latest side effect group by when specified', (done) => {
      const counterByName = {} as Record<string, any>

      const mockApi = jest.fn(
        (name) =>
          new Promise((resolve) => {
            counterByName[name] = (counterByName[name] || 0) + 1
            resolve(`${name} is cool ${counterByName[name]}`)
          })
      )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: [TAKE_EFFECT_GROUP_BY, (action) => action.meta.name],
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: ['Alice'] },
        meta: { name: 'Alice' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Bob'] },
        meta: { name: 'Bob' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Alice'] },
        meta: { name: 'Alice' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Eve'] },
        meta: { name: 'Eve' },
        callbacks: {},
      })

      mockApi.mock.results[3].value.then(() => {
        expect(mockCallback).toBeCalledTimes(11)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: ['Alice'] },
          meta: { name: 'Alice' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: { name: 'Alice' },
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: ['Bob'] },
          meta: { name: 'Bob' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: { name: 'Bob' },
        })

        expect(mockCallback).nthCalledWith(5, {
          type: RUN,
          payload: { params: ['Alice'] },
          meta: { name: 'Alice' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(6, {
          type: PENDING,
          meta: { name: 'Alice' },
        })

        expect(mockCallback).nthCalledWith(7, {
          type: RUN,
          payload: { params: ['Eve'] },
          meta: { name: 'Eve' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(8, {
          type: PENDING,
          meta: { name: 'Eve' },
        })

        expect(mockCallback).nthCalledWith(9, {
          type: SUCCESS,
          meta: { name: 'Bob' },
          payload: {
            params: ['Bob'],
            data: 'Bob is cool 1',
          },
        })

        expect(mockCallback).nthCalledWith(10, {
          type: SUCCESS,
          meta: { name: 'Alice' },
          payload: {
            params: ['Alice'],
            data: 'Alice is cool 2',
          },
        })

        expect(mockCallback).nthCalledWith(11, {
          type: SUCCESS,
          meta: { name: 'Eve' },
          payload: {
            params: ['Eve'],
            data: 'Eve is cool 1',
          },
        })

        done()
      })
    })

    it('gets angry if no groupBy function is injected', () => {
      const counterByName = {} as Record<string, any>

      const mockApi = jest.fn(
        (name) =>
          new Promise((resolve) => {
            counterByName[name] = (counterByName[name] || 0) + 1
            resolve(`${name} is cool ${counterByName[name]}`)
          })
      )

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_GROUP_BY as any,
      })

      expect(() => createTestRJSubscription(RjObject)).toThrow()
    })
  })

  describe('takeEffect groupByExhaust', () => {
    it('take exahust side effect group by when specified', (done) => {
      const counterByName = {} as Record<string, any>

      const mockApi = jest.fn(
        (name) =>
          new Promise((resolve) => {
            counterByName[name] = (counterByName[name] || 0) + 1
            resolve(`${name} is cool ${counterByName[name]}`)
          })
      )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: [
          TAKE_EFFECT_GROUP_BY_EXHAUST,
          (action) => action.meta.name,
        ],
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: ['Alice'] },
        meta: { name: 'Alice' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Bob'] },
        meta: { name: 'Bob' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Alice'] },
        meta: { name: 'Alice' },
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: ['Eve'] },
        meta: { name: 'Eve' },
        callbacks: {},
      })

      mockApi.mock.results[2].value.then(() => {
        expect(mockCallback).toBeCalledTimes(9)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: ['Alice'] },
          meta: { name: 'Alice' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: { name: 'Alice' },
        })

        expect(mockCallback).nthCalledWith(3, {
          type: RUN,
          payload: { params: ['Bob'] },
          meta: { name: 'Bob' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(4, {
          type: PENDING,
          meta: { name: 'Bob' },
        })

        expect(mockCallback).nthCalledWith(5, {
          type: RUN,
          payload: { params: ['Eve'] },
          meta: { name: 'Eve' },
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(6, {
          type: PENDING,
          meta: { name: 'Eve' },
        })

        expect(mockCallback).nthCalledWith(7, {
          type: SUCCESS,
          meta: { name: 'Alice' },
          payload: {
            params: ['Alice'],
            data: 'Alice is cool 1',
          },
        })

        expect(mockCallback).nthCalledWith(8, {
          type: SUCCESS,
          meta: { name: 'Bob' },
          payload: {
            params: ['Bob'],
            data: 'Bob is cool 1',
          },
        })

        expect(mockCallback).nthCalledWith(9, {
          type: SUCCESS,
          meta: { name: 'Eve' },
          payload: {
            params: ['Eve'],
            data: 'Eve is cool 1',
          },
        })

        done()
      })
    })

    it('gets angry if no groupByExhaust function is injected', () => {
      const counterByName = {} as Record<string, any>

      const mockApi = jest.fn(
        (name) =>
          new Promise((resolve) => {
            counterByName[name] = (counterByName[name] || 0) + 1
            resolve(`${name} is cool ${counterByName[name]}`)
          })
      )

      const RjObject = rj({
        effect: mockApi,
        takeEffect: TAKE_EFFECT_GROUP_BY_EXHAUST as any,
      })

      expect(() => createTestRJSubscription(RjObject)).toThrow()
    })
  })

  describe('takeEffect groupByConcatLatest', () => {
    it('takes concat latest group by side effect when specified', async () => {
      const resolves: any[] = []
      const mockApi = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gio Va'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Maddy'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Ma Ik'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Drako'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Gang'))
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolves.push(() => resolve('Yess'))
            })
        )

      const mockCallback = jest.fn()

      const RjObject = rj({
        effect: mockApi,
        takeEffect: [
          TAKE_EFFECT_GROUP_BY_CONCAT_LATEST,
          (a) => a.payload.params[0],
        ],
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      // runned
      subject.next({
        type: RUN,
        payload: { params: [3, 'X'] },
        meta: {},
        callbacks: {},
      })

      // enqueue
      subject.next({
        type: RUN,
        payload: { params: [3, 'Y'] },
        meta: {},
        callbacks: {},
      })

      expect(mockApi).toBeCalledTimes(2)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [1] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(3, {
        type: RUN,
        payload: { params: [3, 'X'] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(4, {
        type: PENDING,
        meta: {},
      })

      resolves[0]()

      await mockApi.mock.results[0].value

      expect(mockCallback).nthCalledWith(5, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [1],
          data: 'Gio Va',
        },
      })

      resolves[1]()

      await mockApi.mock.results[1].value

      expect(mockApi).toBeCalledTimes(3)

      expect(mockCallback).nthCalledWith(6, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [3, 'X'],
          data: 'Maddy',
        },
      })

      expect(mockCallback).nthCalledWith(7, {
        type: RUN,
        payload: { params: [3, 'Y'] },
        meta: {},
        callbacks: {},
      })

      expect(mockCallback).nthCalledWith(8, {
        type: PENDING,
        meta: {},
      })

      resolves[2]()

      await mockApi.mock.results[2].value

      expect(mockCallback).nthCalledWith(9, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [3, 'Y'],
          data: 'Ma Ik',
        },
      })

      expect(mockCallback).toHaveBeenCalledTimes(9)
    })
  })

  describe('effectCaller', () => {
    it('should apply effect caller recursive', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(['GioVa'])
      const mockCallback = jest.fn()

      const callerA = jest.fn((fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Skaffo'))
      })
      const callerB: EffectCallerFn = (fn, ...args: any) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Vegas'))
      }

      const RjObject = rj(
        rjPlugin({ effectCaller: callerA }),
        rjPlugin({ effectCaller: callerB }),
        {
          effect: mockApi,
        }
      )

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      callerA.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: ['GioVa', 'Vegas', 'Skaffo'],
          },
        })

        done()
      })
    })

    it('should inject effect caller in given placeholder position', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(['GioVa'])
      const mockCallback = jest.fn()

      const callerA = jest.fn((fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Skaffo'))
      })
      const callerB: EffectCallerFn = (fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Albi'))
      }
      const callerC: EffectCallerFn = (fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Vegas'))
      }

      const RjObject = rj(
        rjPlugin({ effectCaller: callerA }),
        rjPlugin({ effectCaller: 'configured' }),
        rjPlugin({ effectCaller: callerC }),
        {
          effect: mockApi,
        }
      )

      const subject = createTestRJSubscription(RjObject, mockCallback)

      const action: HookEffectAction = {
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      }
      Object.defineProperty(action, '__rjEffectRef', {
        value: {
          current: {
            effectCaller: callerB,
          },
        },
      })
      subject.next(action)

      callerA.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)
        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })
        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })
        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: ['GioVa', 'Vegas', 'Albi', 'Skaffo'],
          },
        })
        done()
      })
    })

    it('should still support old rj.configured() syntax', (done) => {
      const mockApi = jest.fn().mockResolvedValueOnce(['GioVa'])
      const mockCallback = jest.fn()

      const callerA = jest.fn((fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Skaffo'))
      })
      const callerB: EffectCallerFn = (fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Albi'))
      }
      const callerC: EffectCallerFn = (fn, ...args) => {
        return (fn(...args) as Promise<any>).then((a) => a.concat('Vegas'))
      }

      const RjObject = rj(
        rjPlugin({ effectCaller: callerA }),
        rjPlugin({ effectCaller: rj.configured() }),
        rjPlugin({ effectCaller: callerC }),
        {
          effect: mockApi,
        }
      )

      const subject = createTestRJSubscription(RjObject, mockCallback)

      const action: HookEffectAction = {
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      }
      Object.defineProperty(action, '__rjEffectRef', {
        value: {
          current: {
            effectCaller: callerB,
          },
        },
      })
      subject.next(action)

      callerA.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)
        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })
        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })
        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: ['GioVa', 'Vegas', 'Albi', 'Skaffo'],
          },
        })
        done()
      })
    })
  })

  describe('effectPipeline', () => {
    it('can pipeling effect with rx', (done) => {
      const mockApi = jest
        .fn()
        .mockResolvedValueOnce('Alice')
        .mockResolvedValueOnce('Bob')

      const mockCallback = jest.fn()

      const rjWithDebouce = rjPlugin({
        effectPipeline: (action$) =>
          action$.pipe(debounceTime(200), distinctUntilChanged()),
      })
      const RjObject = rj(rjWithDebouce, {
        effect: mockApi,
        takeEffect: TAKE_EFFECT_EVERY,
      })

      const subject = createTestRJSubscription(RjObject, mockCallback)

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      subject.next({
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {},
      })

      // forwoard debouce time
      jest.runAllTimers()

      expect(mockApi).toBeCalledTimes(1)

      mockApi.mock.results[0].value.then(() => {
        expect(mockCallback).toBeCalledTimes(3)

        expect(mockCallback).nthCalledWith(1, {
          type: RUN,
          payload: { params: [] },
          meta: {},
          callbacks: {},
        })

        expect(mockCallback).nthCalledWith(2, {
          type: PENDING,
          meta: {},
        })

        expect(mockCallback).nthCalledWith(3, {
          type: SUCCESS,
          meta: {},
          payload: {
            params: [],
            data: 'Alice',
          },
        })

        done()
      })
    })

    it('can pipeling custom effect action with rx', () => {
      const mockApi = jest.fn()

      const mockTapper = jest.fn()

      const rjWithDebouce = rjPlugin({
        effectPipeline: (actions) => actions.pipe(tap(mockTapper)),
      })
      const RjObject = rj(rjWithDebouce, {
        actions: () => ({
          zz: (...params) => makeEffectAction('ZZ_TOP', params),
          zzGang: (...params) => makeEffectAction('ZZ_TOP_GANG', params),
        }),
        effect: mockApi,
      })
      const { actionCreators } = RjObject
      const subject = createTestRJSubscription(RjObject, () => {})
      const actions = bindActionCreators(actionCreators, (action) =>
        subject.next(action as EffectAction)
      )

      actions.zz(23)
      actions.zzGang(3)

      expect(mockTapper).nthCalledWith(1, {
        type: 'ZZ_TOP',
        payload: {
          params: [23],
        },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
      expect(mockTapper).nthCalledWith(2, {
        type: 'ZZ_TOP_GANG',
        payload: {
          params: [3],
        },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
    })
  })

  describe('addSideEffect', () => {
    it('should hanlde custom side effects', () => {
      const mockApi = jest.fn()

      const mockCallback = jest.fn()

      const mockAddSideEffect = jest
        .fn()
        .mockImplementation((actions: Observable<EffectAction>) =>
          actions.pipe(filter((a) => a.type === 'ZZ_TOP_GANG'))
        )

      const RjObject = rj(
        rjPlugin({
          addSideEffect: mockAddSideEffect,
        }),
        {
          addSideEffect: (actions) =>
            actions.pipe(filter((a) => a.type === 'ZZ_TOP')),
          actions: () => ({
            zz: (...params) => makeEffectAction('ZZ_TOP', params),
            zzGang: (...params) => makeEffectAction('ZZ_TOP_GANG', params),
          }),
          effect: mockApi,
        }
      )

      const { actionCreators } = RjObject
      const subject = createTestRJSubscription(RjObject, mockCallback)
      const actions = bindActionCreators(actionCreators, (action) =>
        subject.next(action as EffectAction)
      )

      actions.zz(23)
      actions.zzGang(3)

      expect(mockAddSideEffect).toHaveBeenNthCalledWith(
        1,
        expect.any(Observable),
        expect.any(Observable),
        {
          effect: mockApi,
          getEffectCaller: expect.any(Function),
          prefix: '',
        }
      )

      expect(mockCallback).nthCalledWith(1, {
        type: 'ZZ_TOP',
        payload: {
          params: [23],
        },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
      expect(mockCallback).nthCalledWith(2, {
        type: 'ZZ_TOP_GANG',
        payload: {
          params: [3],
        },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
    })
    it('should hanlde custom side effects ... using core rj take effects', async () => {
      const mockApi = jest.fn().mockResolvedValue('GioVa')

      const mockCallback = jest.fn()
      const RjObject = rj({
        addSideEffect: (actions, state, config) =>
          takeEffectsHanlders.latest(actions, state, {
            ...config,
            prefix: 'GANG/',
          }),
        actions: () => ({
          gang: (...params) => makeEffectAction(`GANG/${RUN}`, params),
        }),
        effect: mockApi,
      })

      const { actionCreators } = RjObject
      const subject = createTestRJSubscription(RjObject, mockCallback)
      const dispatch = (action: any) => subject.next(action)
      const actions = bindActionCreators(actionCreators, dispatch)

      actions.gang(23)

      await mockApi.mock.results[0].value

      expect(mockCallback).nthCalledWith(1, {
        type: 'GANG/RUN',
        payload: {
          params: [23],
        },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })
      expect(mockCallback).nthCalledWith(2, {
        type: 'GANG/PENDING',
        meta: {},
      })
      expect(mockCallback).nthCalledWith(3, {
        type: 'GANG/SUCCESS',
        payload: {
          params: [23],
          data: 'GioVa',
        },
        meta: {},
      })
    })
  })
})
