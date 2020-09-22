import { bindActionCreators } from 'rocketjump-core'
import rj from '../../../rj'
import { makeAction } from '../../../index'
import rjDebounce from '../index'
import { createTestRJSubscription } from '../../../testUtils'
import { PENDING, SUCCESS, CLEAN, RUN } from '../../../actionTypes'
import { filter } from 'rxjs/operators'

jest.useFakeTimers()

describe('rjDebounce', () => {
  it('should debouce run', (done) => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')
      .mockResolvedValueOnce('Maik')

    const mockCallback = jest.fn()

    const RjObject = rj(rjDebounce(200), {
      effect: mockApi,
      takeEffect: 'every',
    })
    const { actionCreators } = RjObject
    const subject = createTestRJSubscription(RjObject, mockCallback)
    const dispatch = (action) => subject.next(action)
    const { runDebounced, clean } = bindActionCreators(actionCreators, dispatch)
    runDebounced()
    runDebounced()
    runDebounced('GioVa')
    runDebounced()
    jest.advanceTimersByTime(100)
    expect(mockApi).toBeCalledTimes(0)
    jest.advanceTimersByTime(200)
    runDebounced()
    jest.advanceTimersByTime(200)
    // The same fucking sheet
    // distinctUntilChanged <3
    expect(mockApi).toBeCalledTimes(1)
    // now time run again!
    runDebounced(1312)
    jest.advanceTimersByTime(200)
    runDebounced(23)
    jest.advanceTimersByTime(200)

    expect(mockApi).toBeCalledTimes(3)

    mockApi.mock.results[1].value.then(() => {
      clean.withMeta({ debounced: true }).run()
      jest.advanceTimersByTime(200)
      // subject.next({
      //   type: 'GUAKAMOLE',
      // })
      expect(mockCallback).toBeCalledTimes(10)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [] },
        meta: {
          debounced: true,
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: {
          debounced: true,
        },
      })

      expect(mockCallback).nthCalledWith(3, {
        type: RUN,
        payload: { params: [1312] },
        meta: {
          debounced: true,
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(4, {
        type: PENDING,
        meta: {
          debounced: true,
        },
      })

      expect(mockCallback).nthCalledWith(5, {
        type: RUN,
        payload: { params: [23] },
        meta: {
          debounced: true,
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(6, {
        type: PENDING,
        meta: {
          debounced: true,
        },
      })

      expect(mockCallback).nthCalledWith(7, {
        type: SUCCESS,
        meta: {
          debounced: true,
        },
        payload: {
          params: [],
          data: 'Alice',
        },
      })

      expect(mockCallback).nthCalledWith(8, {
        type: SUCCESS,
        meta: {
          debounced: true,
        },
        payload: {
          params: [1312],
          data: 'Bob',
        },
      })

      expect(mockCallback).nthCalledWith(9, {
        type: SUCCESS,
        meta: {
          debounced: true,
        },
        payload: {
          params: [23],
          data: 'Maik',
        },
      })

      expect(mockCallback).nthCalledWith(10, {
        type: CLEAN,
        payload: { params: [] },
        meta: {
          debounced: true,
        },
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      done()
    })
  })
  it('should ingore debounce on non debounced action', (done) => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')

    const mockCallback = jest.fn()

    const RjObject = rj(rjDebounce(200), {
      effect: mockApi,
      actions: () => ({
        drago: () => makeAction('DRAGO'),
      }),
      addSideEffect: (actions) =>
        actions.pipe(filter((action) => action.type === 'DRAGO')),
      takeEffect: 'every',
    })

    const { actionCreators } = RjObject
    const subject = createTestRJSubscription(RjObject, mockCallback)
    const dispatch = (action) => subject.next(action)
    const { run, drago } = bindActionCreators(actionCreators, dispatch, subject)
    drago()
    drago()
    run()
    run()

    expect(mockApi).toBeCalledTimes(2)

    mockApi.mock.results[1].value.then(() => {
      expect(mockCallback).toBeCalledTimes(8)

      expect(mockCallback).nthCalledWith(1, {
        type: 'DRAGO',
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(2, {
        type: 'DRAGO',
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(3, {
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(4, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(5, {
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(6, {
        type: PENDING,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(7, {
        type: SUCCESS,
        meta: {},
        payload: {
          params: [],
          data: 'Alice',
        },
      })

      expect(mockCallback).nthCalledWith(8, {
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
  it('should use the when option to decide when skip debounce', (done) => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')
      .mockResolvedValueOnce('Maik')

    const mockCallback = jest.fn()

    const RjObject = rj(
      rjDebounce({
        time: 200,
        when: (prev, curr) => {
          if (prev && prev[0].q !== curr[0].q) {
            return true
          }
          return false
        },
      }),
      {
        effect: mockApi,
        takeEffect: 'every',
      }
    )

    const { actionCreators } = RjObject
    const subject = createTestRJSubscription(RjObject, mockCallback)
    const dispatch = (action) => subject.next(action)
    const { runDebounced } = bindActionCreators(actionCreators, dispatch)
    runDebounced({ q: 'G' })
    expect(mockApi).toBeCalledTimes(1)
    runDebounced({ q: 'Gi' })
    runDebounced({ q: 'Gio' })
    runDebounced({ q: 'Giov' })
    runDebounced({ q: 'Giova' })
    jest.advanceTimersByTime(100)
    expect(mockApi).toBeCalledTimes(1)
    jest.advanceTimersByTime(200)
    expect(mockApi).toBeCalledTimes(2)
    runDebounced({ q: 'Giova23' })
    expect(mockApi).toBeCalledTimes(2)
    runDebounced({ q: 'Giova23', xd: 23 })
    expect(mockApi).toBeCalledTimes(3)
    done()
  })
})
