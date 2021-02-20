import rj from '../rj'
import {
  PENDING,
  SUCCESS,
  FAILURE,
  CLEAN,
  CANCEL,
  UPDATE_DATA,
  INIT,
} from '../actions/actionTypes'
import rjPlugin from '../rjPlugin'
import { Action, Reducer, RjStateRootShape } from '../types'

describe('Rocketjump reducer', () => {
  it('should return the initial state', () => {
    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(reducer(undefined, { type: '___UNKOWN______XxXxX' }).root).toEqual({
      pending: false,
      data: null,
      error: null,
    })

    expect(reducer(undefined, { type: INIT }).root).toEqual({
      pending: false,
      data: null,
      error: null,
    })
  })

  it('should handle PENDING actions', () => {
    const prevState = {
      root: {
        pending: false,
        data: 'custom_data',
        error: null,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(reducer(prevState, { type: PENDING }).root).toEqual({
      pending: true,
      data: 'custom_data',
      error: null,
    })
  })

  it('should handle FAILURE actions', () => {
    const prevState = {
      root: {
        pending: true,
        data: null,
        error: null,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(
      reducer(prevState, {
        type: FAILURE,
        error: true,
        payload: 'Something very bad happened...',
      }).root
    ).toEqual({
      pending: false,
      data: null,
      error: 'Something very bad happened...',
    })
  })

  it('should handle SUCCESS actions', () => {
    const prevState = {
      root: {
        pending: true,
        data: null,
        error: null,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(
      reducer(prevState, { type: SUCCESS, payload: { data: 'Yeah' } }).root
    ).toEqual({
      pending: false,
      data: 'Yeah',
      error: null,
    })
  })

  it('should handle UPDATE_DATA actions', () => {
    const prevState = {
      root: {
        pending: false,
        data: { name: 'Albi' },
        error: null,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(
      reducer(prevState, { type: UPDATE_DATA, payload: { name: 'GioVa' } }).root
    ).toEqual({
      pending: false,
      data: { name: 'GioVa' },
      error: null,
    })
  })

  it('should handle CLEAN actions', () => {
    const prevState = {
      root: {
        pending: true,
        data: 'Where is my mind?',
        error: 'Too many errors... Always...',
        customKey: 23,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(reducer(prevState, { type: CLEAN }).root).toEqual({
      pending: false,
      data: null,
      error: null,
      customKey: 23,
    })
  })

  it('should handle CANCEL actions', () => {
    const prevState = {
      root: {
        pending: true,
        data: 'Where is my mind?',
        error: 'Too many errors... Always...',
        customKey: 23,
      },
    }

    const { reducer } = rj({
      effect: () => Promise.resolve(1),
    })

    expect(reducer(prevState, { type: CANCEL }).root).toEqual({
      pending: false,
      data: 'Where is my mind?',
      error: 'Too many errors... Always...',
      customKey: 23,
    })
  })

  it('should be proxable', () => {
    const { reducer } = rj({
      effect: () => Promise.resolve(),
      reducer: (givenReducer) => {
        return (prevState, action) => {
          const nextState = givenReducer(prevState, action)
          if (action.type === SUCCESS) {
            return { ...nextState, cool: nextState.data + ' is cool' }
          }
          return nextState
        }
      },
    })

    const prevState = {
      root: {
        pending: true,
        data: null,
        error: null,
      },
    }

    expect(
      reducer(prevState, { type: SUCCESS, payload: { data: 'Maik' } }).root
    ).toEqual({
      pending: false,
      data: 'Maik',
      cool: 'Maik is cool',
      error: null,
    })
  })

  it('should be composable', () => {
    interface MyCustomStateA extends RjStateRootShape {
      myCustomKey: number
    }
    const rA = rjPlugin({
      composeReducer: (prevState, action): MyCustomStateA => ({
        ...prevState,
        myCustomKey: 12,
      }),
    })

    const rjB = rjPlugin({
      composeReducer: (prevState, action) => ({
        ...prevState,
        hisCustomKey: 1,
      }),
    })

    interface MyCustomStateB extends RjStateRootShape {
      hisCustomKey: number
    }

    // NOTE: MyCustomStateAB in necessary cause
    // in the composition process the final state is calculate
    // from the result of LAST rj reducer
    // ... but the rjB don't know about the rjA state
    // so we need a custom type thar intersect both A and B
    type MyCustomStateAB = MyCustomStateA & MyCustomStateB
    const rjAB = rjPlugin<Reducer<MyCustomStateAB>>(rA, rjB, {
      composeReducer: (prevState, action) =>
        action.type === 'COMPUTE_BRAIN_AGE'
          ? {
              ...prevState,
              myCustomKey: prevState.myCustomKey * 2,
            }
          : prevState,
    })

    const rABC = rjPlugin(rjAB, {
      composeReducer: (prevState, action) => ({
        ...prevState,
        giova: 23,
      }),
    })

    const { reducer } = rj(rABC, {
      effect: () => Promise.resolve(1),
      composeReducer: (prevState, action) =>
        action.type === 'COMPUTE_BRAIN_AGE'
          ? {
              ...prevState,
              myCustomKey: `Your brain age is: ${prevState.myCustomKey}`,
            }
          : prevState,
    })

    let state = reducer(undefined, { type: '___j___l' })

    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: null,
        hisCustomKey: 1,
        myCustomKey: 12,
        giova: 23,
      },
    })

    state = reducer(state, { type: 'COMPUTE_BRAIN_AGE' })
    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: null,
      hisCustomKey: 1,
      myCustomKey: 'Your brain age is: 24',
      giova: 23,
    })
  })

  it('should be combinable', () => {
    function dragoReducer(state = 'drago', action: Action) {
      if (action.type === 'D') {
        return state + '_' + state
      }
      return state
    }
    const { reducer } = rj({
      effect: () => Promise.resolve(99),
      combineReducers: {
        drago: dragoReducer,
      },
    })

    let state = reducer(undefined, { type: INIT })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago',
    })
    state = reducer(state, { type: 'D' })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago_drago',
    })

    state = reducer(state, { type: 'D' })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago_drago_drago_drago',
    })

    const snapState = state
    state = reducer(state, { type: 'MISS' })
    expect(state).toBe(snapState)

    state = reducer(state, { type: 'MISS 2X' })
    expect(state).toBe(snapState)
  })

  it('should be combinable and respect the rj law', () => {
    function dragoReducer(state = 'drago', action: Action) {
      if (action.type === 'D') {
        return state + '_' + state
      }
      return state
    }
    const { reducer } = rj(
      rjPlugin({
        combineReducers: {
          babu: () => 'babu',
          drago: () => 999,
        },
      }),
      {
        effect: () => Promise.resolve(88),
        combineReducers: {
          drago: dragoReducer,
        },
      }
    )

    let state = reducer(undefined, { type: INIT })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago',
      babu: 'babu',
    })
    state = reducer(state, { type: 'D' })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago_drago',
      babu: 'babu',
    })

    state = reducer(state, { type: 'D' })
    expect(state).toEqual({
      root: {
        error: null,
        pending: false,
        data: null,
      },
      drago: 'drago_drago_drago_drago',
      babu: 'babu',
    })
  })

  it('should warn when try to override root key', () => {
    const spy = jest.fn()

    console.warn = spy

    const obj = rj({
      combineReducers: {
        root: () => 'hack',
      },
      effect: () => Promise.resolve(23),
    })

    const state = obj.reducer(undefined, { type: INIT })
    expect(state.root).not.toBe('hack')

    expect(spy.mock.calls[0][0]).toMatch(
      /\[react-rocketjump\] ([a-z ]*) \[root\]/i
    )
  })
})
