import { rj, rjPlugin, PENDING, SUCCESS, FAILURE, CLEAN, RUN } from '../../..'
import { omit } from '../../../core/utils'
import rjMap from '..'
import { createTestRJSubscription } from '../../../core/testUtils'

describe('Map Plugin', () => {
  it('should make map reducer', () => {
    const { reducer } = rj(rjMap(), {
      effect: () => Promise.resolve(1),
    })

    let state = reducer(
      {
        root: {},
      },
      {
        type: PENDING,
        meta: { id: 23 },
      }
    )

    expect(state.root).toEqual({
      23: {
        pending: true,
        error: null,
        data: null,
      },
    })

    state = reducer(state, {
      type: PENDING,
      meta: { id: 99 },
    })

    expect(state.root).toEqual({
      23: {
        pending: true,
        error: null,
        data: null,
      },
      99: {
        pending: true,
        error: null,
        data: null,
      },
    })

    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { name: 'Alice', id: 23 } },
      meta: { id: 23 },
    })

    expect(state.root).toEqual({
      23: {
        pending: false,
        error: null,
        data: {
          id: 23,
          name: 'Alice',
        },
      },
      99: {
        pending: true,
        error: null,
        data: null,
      },
    })

    state = reducer(state, {
      type: FAILURE,
      payload: '401 Unauthorized',
      meta: { id: 99 },
    })

    expect(state.root).toEqual({
      23: {
        pending: false,
        error: null,
        data: {
          id: 23,
          name: 'Alice',
        },
      },
      99: {
        pending: false,
        error: '401 Unauthorized',
        data: null,
      },
    })

    state = reducer(state, {
      type: CLEAN,
      meta: { id: 99 },
    })

    expect(state.root).toEqual({
      23: {
        pending: false,
        error: null,
        data: {
          id: 23,
          name: 'Alice',
        },
      },
    })

    state = reducer(state, {
      type: PENDING,
      meta: { id: 23 },
    })

    expect(state.root).toEqual({
      23: {
        pending: true,
        error: null,
        data: {
          id: 23,
          name: 'Alice',
        },
      },
    })

    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { name: 'Mallory', id: 23 } },
      meta: { id: 23 },
    })

    expect(state.root).toEqual({
      23: {
        pending: false,
        error: null,
        data: {
          id: 23,
          name: 'Mallory',
        },
      },
    })

    state = reducer(state, {
      type: CLEAN,
      meta: {},
    })

    expect(state.root).toEqual({})
  })

  it('should bubble up unknown actions', () => {
    const log: any[] = []

    const spy = jest.fn((state, action, fallback) => {
      log.push([state, action])
      return fallback(state, action)
    })

    const spyRj = () =>
      rjPlugin({
        reducer: (oldReducer) => (state, action) =>
          spy(state, action, oldReducer),
      })

    const { reducer } = rj(spyRj(), rjMap(), {
      effect: () => Promise.resolve(1),
    })

    reducer(
      {
        root: {},
      },
      {
        type: 'CUSTOM',
      }
    )

    expect(log).toHaveLength(1)
    expect(log[0]).toEqual([{}, { type: 'CUSTOM' }])
  })

  it('should make map selectors', () => {
    const { reducer, makeSelectors } = rj(rjMap(), {
      effect: () => Promise.resolve(1),
    })

    const { getMapPendings, getMapFailures, getMapData } = makeSelectors()

    let state = reducer(
      {
        root: {},
      },
      {
        type: PENDING,
        meta: { id: 23 },
      }
    )

    expect(getMapPendings(state)).toEqual({
      23: true,
    })
    expect(getMapFailures(state)).toEqual({})
    expect(getMapData(state)).toEqual({})

    state = reducer(state, {
      type: PENDING,
      meta: { id: 99 },
    })

    expect(getMapPendings(state)).toEqual({
      23: true,
      99: true,
    })
    expect(getMapFailures(state)).toEqual({})
    expect(getMapData(state)).toEqual({})

    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { name: 'Alice', id: 23 } },
      meta: { id: 23 },
    })

    expect(getMapPendings(state)).toEqual({
      99: true,
    })
    expect(getMapFailures(state)).toEqual({})
    expect(getMapData(state)).toEqual({
      23: { name: 'Alice', id: 23 },
    })

    state = reducer(state, {
      type: FAILURE,
      payload: '401 Unauthorized',
      meta: { id: 99 },
    })
    expect(getMapPendings(state)).toEqual({})
    expect(getMapFailures(state)).toEqual({
      99: '401 Unauthorized',
    })
    expect(getMapData(state)).toEqual({
      23: { name: 'Alice', id: 23 },
    })

    state = reducer(state, {
      type: CLEAN,
      meta: { id: 99 },
    })
    expect(getMapPendings(state)).toEqual({})
    expect(getMapFailures(state)).toEqual({})
    expect(getMapData(state)).toEqual({
      23: { name: 'Alice', id: 23 },
    })

    state = reducer(state, {
      type: CLEAN,
      meta: {},
    })
    expect(getMapPendings(state)).toEqual({})
    expect(getMapFailures(state)).toEqual({})
    expect(getMapData(state)).toEqual({})
  })

  it('should make map action creators', () => {
    const { actionCreators } = rj(rjMap(), {
      effect: () => Promise.resolve(1),
    })

    expect(actionCreators).toHaveProperty('runKey')
    expect(actionCreators).toHaveProperty('cleanKey')

    expect(omit(actionCreators.runKey(23), ['extend', 'withMeta'])).toEqual({
      type: RUN,
      payload: { params: [23] },
      meta: { id: 23 },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })

    expect(omit(actionCreators.cleanKey(23), ['extend', 'withMeta'])).toEqual({
      type: CLEAN,
      payload: { params: [23] },
      meta: { id: 23 },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should use a proper take effect', (done) => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('Alice')
      .mockResolvedValueOnce('Bob')
      .mockResolvedValueOnce('Eve')

    const mockCallback = jest.fn()

    const RjObject = rj(rjMap(), {
      effect: mockApi,
    })

    const { actionCreators } = RjObject
    const subject = createTestRJSubscription(RjObject, mockCallback)

    subject.next(omit(actionCreators.runKey(23), ['withMeta', 'extend']))
    subject.next(omit(actionCreators.runKey(32), ['withMeta', 'extend']))
    subject.next(omit(actionCreators.runKey(23), ['withMeta', 'extend']))

    mockApi.mock.results[2].value.then(() => {
      expect(mockCallback).toBeCalledTimes(8)

      expect(mockCallback).nthCalledWith(1, {
        type: RUN,
        payload: { params: [23] },
        meta: { id: 23 },
        callbacks: { onSuccess: undefined, onFailure: undefined },
      })

      expect(mockCallback).nthCalledWith(2, {
        type: PENDING,
        meta: { id: 23 },
      })

      expect(mockCallback).nthCalledWith(3, {
        type: RUN,
        payload: { params: [32] },
        meta: { id: 32 },
        callbacks: { onSuccess: undefined, onFailure: undefined },
      })

      expect(mockCallback).nthCalledWith(4, {
        type: PENDING,
        meta: { id: 32 },
      })

      expect(mockCallback).nthCalledWith(5, {
        type: RUN,
        payload: { params: [23] },
        meta: { id: 23 },
        callbacks: { onSuccess: undefined, onFailure: undefined },
      })

      expect(mockCallback).nthCalledWith(6, {
        type: PENDING,
        meta: { id: 23 },
      })

      expect(mockCallback).nthCalledWith(7, {
        type: SUCCESS,
        payload: { params: [32], data: 'Bob' },
        meta: { id: 32 },
      })

      expect(mockCallback).nthCalledWith(8, {
        type: SUCCESS,
        payload: { params: [23], data: 'Eve' },
        meta: { id: 23 },
      })

      done()
    })
  })

  it('should remove completed elements if told to do so', () => {
    const { reducer } = rj(rjMap({ keepCompleted: false }), {
      effect: () => Promise.resolve(1),
    })

    let state = reducer(
      {
        root: {},
      },
      {
        type: PENDING,
        payload: { params: [1] },
        meta: { id: 1 },
      }
    )

    expect(state.root).toEqual({
      1: {
        pending: true,
        error: null,
        data: null,
      },
    })

    state = reducer(state, {
      type: SUCCESS,
      payload: { params: [1], data: {} },
      meta: { id: 1 },
    })

    expect(state.root).toEqual({})

    state = reducer(
      {
        root: {},
      },
      {
        type: PENDING,
        payload: { params: [2] },
        meta: { id: 2 },
      }
    )

    expect(state.root).toEqual({
      2: {
        pending: true,
        error: null,
        data: null,
      },
    })

    state = reducer(state, {
      type: FAILURE,
      payload: 'Error',
      meta: { id: 2 },
    })

    expect(state.root).toEqual({
      2: {
        pending: false,
        error: 'Error',
        data: null,
      },
    })
  })

  it('should use a custom keymaker function', () => {
    const { reducer } = rj(
      rjMap({
        key: (action) => action.meta.name,
      }),
      {
        effect: () => Promise.resolve(1),
      }
    )

    let state = reducer(
      {
        root: {},
      },
      {
        type: PENDING,
        meta: { name: 'Alice' },
      }
    )

    expect(state.root).toEqual({
      Alice: {
        pending: true,
        data: null,
        error: null,
      },
    })

    state = reducer(state, {
      type: SUCCESS,
      payload: { params: [], data: { secret: 'secret' } },
      meta: { name: 'Alice' },
    })

    expect(state.root).toEqual({
      Alice: {
        pending: false,
        data: { secret: 'secret' },
        error: null,
      },
    })
  })

  it('does not break with corner-case states', () => {
    const { reducer } = rj(rjMap(), {
      effect: () => Promise.resolve(1),
    })

    let state = reducer({ root: null } as any, {
      type: PENDING,
      meta: { id: 1 },
    })

    expect(state.root).toEqual({
      1: {
        pending: true,
        data: null,
        error: null,
      },
    })

    state = reducer({} as any, {
      type: PENDING,
      meta: { id: 1 },
    })

    expect(state.root).toEqual({
      1: {
        pending: true,
        data: null,
        error: null,
      },
    })
  })

  it('should be able to take a custom data transform function', () => {
    const { reducer } = rj(
      rjMap({
        dataTransform: (data) => ({ ...data, name: data.name.toUpperCase() }),
      }),
      {
        effect: () => Promise.resolve(1),
      }
    )

    let state = reducer(
      { root: {} },
      {
        type: PENDING,
        meta: { id: 1 },
      }
    )

    state = reducer(state, {
      type: SUCCESS,
      payload: {
        params: [1],
        data: { id: 1, name: 'Alice', surname: 'Johns' },
      },
      meta: { id: 1 },
    })

    expect(state.root).toEqual({
      1: {
        pending: false,
        error: null,
        data: {
          id: 1,
          name: 'ALICE',
          surname: 'Johns',
        },
      },
    })
  })
})
