import rj from '../../rj'
import useRj from '../../useRj'
import { INIT } from '../../actionTypes'
import { renderHook, act } from '@testing-library/react-hooks'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations updater', () => {
  it('should be called on mutation SUCCESS with current rj state and the effect result', async () => {
    const mockUpdater = jest.fn()

    const MaRjState = rj({
      mutations: {
        muta: {
          effect: (shouldResolve = true) =>
            shouldResolve ? Promise.resolve(23) : Promise.reject(false),
          updater: mockUpdater,
        },
      },
      effect: () => {},
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(mockUpdater).not.toHaveBeenCalled()
    await act(async () => {
      result.current[1].muta()
    })
    expect(mockUpdater).toHaveBeenNthCalledWith(
      1,
      {
        data: null,
        error: null,
        pending: false,
      },
      23
    )
    await act(async () => {
      result.current[1].muta(false)
    })
    expect(mockUpdater).toBeCalledTimes(1)
  })

  it('should used optimisticUpdater when provided for optimistic update and updater for commit update', async () => {
    const mockUpdater = jest.fn()
    const mockOptUpdater = jest.fn()
    const resolves = []

    const MaRjState = rj({
      mutations: {
        muta: {
          optimisticResult: () => 'Rinne',
          effect: () =>
            new Promise((resolve) => {
              resolves.push(resolve)
            }),
          updater: mockUpdater,
          optimisticUpdater: mockOptUpdater,
        },
      },
      effect: () => {},
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(mockUpdater).not.toHaveBeenCalled()
    expect(mockOptUpdater).not.toHaveBeenCalled()
    await act(async () => {
      result.current[1].muta()
    })
    expect(mockUpdater).not.toHaveBeenCalled()
    expect(mockOptUpdater).toHaveBeenLastCalledWith(
      {
        data: null,
        error: null,
        pending: false,
      },
      'Rinne'
    )
    mockOptUpdater.mockClear()
    await act(async () => {
      resolves[0]('Giova')
    })
    expect(mockOptUpdater).not.toHaveBeenCalled()
    expect(mockUpdater).toHaveBeenLastCalledWith(
      {
        data: null,
        error: null,
        pending: false,
      },
      'Giova'
    )
  })
  it('should be used as updater for main state', () => {
    const MaRjState = rj({
      mutations: {
        muta: {
          effect: () => {},
          updater: (state, data) => ({
            ...state,
            data: 'My name WAS ~ ' + data,
          }),
        },
      },
      effect: () => {},
    })

    let state = MaRjState.reducer(undefined, { INIT })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/socio/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: 'My name WAS ~ GioVa',
    })
  })
  it('should can be a string with the name of action creator used as updater for main state', () => {
    const MaRjState = rj(
      rj({
        actions: () => ({
          fixMaState: (name) => ({
            type: 'FIX_MA',
            payload: name,
          }),
        }),
        composeReducer: (state, action) => {
          if (action.type === 'FIX_MA') {
            return { ...state, data: 'The King Was ' + action.payload }
          }
          return state
        },
      }),
      {
        mutations: {
          muta: {
            effect: () => {},
            updater: 'fixMaState',
          },
        },
        effect: () => {},
      }
    )

    let state = MaRjState.reducer(undefined, { INIT })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/socio/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: 'The King Was GioVa',
    })
  })
  it('should can be a string with the name of action creator used as optimisticUpdater for main state', () => {
    const mockAction = jest.fn((name) => ({
      type: 'FIX_MA',
      payload: name,
    }))
    const MaRjState = rj(
      rj({
        actions: () => ({
          fixMaState: mockAction,
        }),
        composeReducer: (state, action) => {
          if (action.type === 'FIX_MA') {
            return { ...state, data: 'The King Was ' + action.payload }
          }
          return state
        },
      }),
      {
        mutations: {
          muta: {
            effect: () => {},
            optimisticResult: (a) => a,
            optimisticUpdater: 'fixMaState',
          },
        },
        effect: () => {},
      }
    )
    let state = MaRjState.reducer(undefined, { INIT })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: null,
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/socio/RUN`,
      meta: {},
      payload: { params: ['GioVa'] },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: null,
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
    expect(mockAction).not.toHaveBeenCalled()
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/RUN`,
      meta: {},
      payload: { params: ['GioVa'] },
    })
    expect(mockAction).toHaveBeenLastCalledWith('GioVa')
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: 'The King Was GioVa',
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
  })
  it('should can be a string with the name of action creator used as updater for main state also for optimistic update', () => {
    const MaRjState = rj(
      rj({
        actions: () => ({
          fixMaState: (name) => ({
            type: 'FIX_MA',
            payload: name,
          }),
        }),
        composeReducer: (state, action) => {
          if (action.type === 'FIX_MA') {
            return { ...state, data: 'The King Was ' + action.payload }
          }
          return state
        },
      }),
      {
        mutations: {
          muta: {
            optimisticResult: (name) => name,
            effect: () => {},
            updater: 'fixMaState',
          },
        },
        effect: () => {},
      }
    )

    let state = MaRjState.reducer(undefined, { INIT })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: null,
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/socio/RUN`,
      meta: {},
      payload: { params: ['GioVa'] },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: null,
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/RUN`,
      meta: {},
      payload: { params: ['GioVa'] },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: 'The King Was GioVa',
      },
      optimisticMutations: {
        snapshot: null,
        actions: [],
      },
    })
  })
})
