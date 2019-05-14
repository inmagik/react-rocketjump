import { rj } from '..'
import { Subject } from 'rxjs'
import { PENDING, SUCCESS, FAILURE, CLEAN, RUN } from '../actionTypes'
import {
  TAKE_EFFECT_EVERY,
  TAKE_EFFECT_GROUP_BY,
  TAKE_EFFECT_QUEUE,
  TAKE_EFFECT_EXHAUST,
} from '../createMakeRxObservable'

describe('RJ side effect model', () => {
  it('should run an async api and dispatch PENDING and SUCCESS actions when resolved', done => {
    const mockApiResult = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('should run an async api and dispatch LOADING and FAILURE actions when rejected', done => {
    const mockBadApi = jest.fn(() => Promise.reject('Something bad happened'))
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockBadApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('should pass params to api function', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(1)
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('should dispatch meta along with actions', done => {
    const mockApiResult = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('should dispatch meta along with actions also when reject', done => {
    const mockBadApi = jest.fn(() => Promise.reject('Something bad happened'))
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockBadApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('can unload a side effect', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(1)
    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

    subject.next({
      type: RUN,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })

    subject.next({
      type: 'CLEAN',
      payload: { params: [] },
      meta: {},
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
      })

      done()
    })
  })

  it('takes only the last side effect as default', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')
    const mockCallback = jest.fn()
    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('takes every side effect when specified', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')

    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: TAKE_EFFECT_EVERY,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('takes every side effect and dispatch succees in order of completation', done => {
    const resolves = []
    const mockApi = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolves.push(() => resolve('Gio Va'))
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolves.push(() => resolve('Ma Ik'))
          })
      )

    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: TAKE_EFFECT_EVERY,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('takes queue side effect when specified', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Gio Va')
      .mockResolvedValueOnce('Ma Ik')

    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: TAKE_EFFECT_QUEUE,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

    // At this point only the first side effect function should be caled
    expect(mockApi).toBeCalledTimes(1)

    // TODO: write a test to check the catch vs then
    mockApi.mock.results[0].value.then(() => {
      // When the first resolves the second should be called
      expect(mockApi).toBeCalledTimes(2)
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

  it('takes exhaust side effect when specified', done => {
    const resolves = []
    const mockApi = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolves.push(() => resolve('Gio Va'))
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolves.push(() => resolve('Ma Ik'))
          })
      )

    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: TAKE_EFFECT_EXHAUST,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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

  it('take latest side effect group by when specified', done => {
    const counterByName = {}

    const mockApi = jest.fn(
      name =>
        new Promise(resolve => {
          counterByName[name] = (counterByName[name] || 0) + 1
          resolve(`${name} is cool ${counterByName[name]}`)
        })
    )

    const mockCallback = jest.fn()

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: [TAKE_EFFECT_GROUP_BY, action => action.meta.name],
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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
    const counterByName = {}

    const mockApi = jest.fn(
      name =>
        new Promise(resolve => {
          counterByName[name] = (counterByName[name] || 0) + 1
          resolve(`${name} is cool ${counterByName[name]}`)
        })
    )

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: TAKE_EFFECT_GROUP_BY,
    })()

    const subject = new Subject()

    expect(() => makeRxObservable(subject.asObservable())).toThrow()
  })

  it('gets angry if unknown groupBy function is injected', () => {
    const counterByName = {}

    const mockApi = jest.fn(
      name =>
        new Promise(resolve => {
          counterByName[name] = (counterByName[name] || 0) + 1
          resolve(`${name} is cool ${counterByName[name]}`)
        })
    )

    const { makeRxObservable } = rj({
      effect: mockApi,
      takeEffect: 'blabla',
    })()

    const subject = new Subject()

    expect(() => makeRxObservable(subject.asObservable())).toThrow()
  })

  it('calls onSuccess callback when SUCCESS is produced', done => {
    const mockApiResult = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResult)

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(() => {})

    const check = arg => {
      expect(arg).toEqual(mockApiResult)

      done()
    }

    subject.next({
      type: RUN,
      payload: { params: [] },
      meta: {},
      callbacks: {
        onSuccess: check,
      },
    })
  })

  it('calls onFailure callback when SUCCESS is produced', done => {
    const mockApi = jest.fn(() => Promise.reject('Something bad happened'))

    const { makeRxObservable } = rj({
      effect: mockApi,
    })()

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(() => {})

    const check = arg => {
      expect(arg).toEqual('Something bad happened')

      done()
    }

    subject.next({
      type: RUN,
      payload: { params: [] },
      meta: {},
      callbacks: {
        onFailure: check,
      },
    })
  })
})
