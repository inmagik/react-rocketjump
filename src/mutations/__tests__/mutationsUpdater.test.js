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
    expect(state).toEqual({
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
    expect(state).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
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
    expect(state).toEqual({
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
    expect(state).toEqual({
      pending: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${MUTATION_PREFIX}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
      pending: false,
      error: null,
      data: 'The King Was GioVa',
    })
  })
})
