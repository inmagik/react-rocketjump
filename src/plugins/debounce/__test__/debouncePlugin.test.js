import rj from '../../../rj'
import { Subject } from 'rxjs'
import rjDebounce from '../index'
import bindActionCreators from '../../../bindActionCreators'
import { PENDING, SUCCESS, CLEAN, RUN } from '../../../actionTypes'

jest.useFakeTimers()

const noopDispatch = () => {}

describe('rjDebounce', () => {
  it('should debouce run', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')
      .mockResolvedValueOnce('Maik')

    const mockCallback = jest.fn()

    const { makeRxObservable, actionCreators } = rj(rjDebounce(200), {
      effect: mockApi,
      takeEffect: 'every',
    })

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)
    const { runDebounced, clean } = bindActionCreators(
      actionCreators,
      noopDispatch,
      subject
    )
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
  it('should ingore debounce on non debounced action', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')

    const mockCallback = jest.fn()

    const { makeRxObservable, actionCreators } = rj(rjDebounce(200), {
      effect: mockApi,
      takeEffect: 'every',
    })

    const subject = new Subject()
    makeRxObservable(subject.asObservable()).subscribe(mockCallback)
    const { run } = bindActionCreators(actionCreators, noopDispatch, subject)
    run()
    run()

    expect(mockApi).toBeCalledTimes(2)

    mockApi.mock.results[1].value.then(() => {
      expect(mockCallback).toBeCalledTimes(6)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [] },
        meta: {},
        callbacks: {
          onSuccess: undefined,
          onFailure: undefined,
        },
      })

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: {},
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
})
