import { CombineReducers, Reducer, ReducersMap } from '../types'

// Stolen from https://github.com/reduxjs/redux
export default function combineReducers<M extends ReducersMap>(
  reducers: M
): CombineReducers<M>

export default function combineReducers(reducers: ReducersMap): Reducer {
  const reducerKeys = Object.keys(reducers)

  return function combination(state = {}, action) {
    let hasChanged = false
    const nextState = {} as ReducersMap
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    hasChanged = hasChanged || reducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}
