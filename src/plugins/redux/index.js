import { useCallback, useEffect } from 'react'
import { combineReducers } from 'redux'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { ReplaySubject } from 'rxjs'
import { get } from '../../helpers'
import { useConstant } from '../../hooks'
import { createUseRj } from '../../useRj'
import { createUseRunRj } from '../../useRunRj'

const STATE_PREFIX = 'rj'
const ACTION_PREFIX = '@rj'

// slice the piece of ma rj
function sliceRjState(state, name) {
  return get(state, `${STATE_PREFIX}.${name}`)
}

// Swap "Mini" Redux with the actual Redux
function useReduxReducer(rjObject) {
  const dispatch = useDispatch()
  const name = rjObject.__rjconfig.name
  const namespacedDispatch = useCallback(
    action =>
      dispatch({
        ...action,
        type: `${ACTION_PREFIX}/${name}/${action.type}`,
      }),
    [dispatch, name]
  )
  return [null, namespacedDispatch]
}

function useDeriveStateFromRedux(
  _, // actual null
  memoizedSelectors,
  selectState,
  computeState,
  rjObject
) {
  const name = rjObject.__rjconfig.name
  const stateFromRedux = useSelector(allState => {
    const state = sliceRjState(allState, name)
    let derivedState = state
    if (typeof computeState === 'function') {
      derivedState = computeState(state, memoizedSelectors)
    }
    if (typeof selectState === 'function') {
      derivedState = selectState(state, memoizedSelectors, derivedState)
    }
    return derivedState
  })
  return stateFromRedux
}

function useReduxStateObserver(_, rjObject) {
  const store = useStore()
  const name = rjObject.__rjconfig.name

  const [stateSubject, state$] = useConstant(() => {
    const subject = new ReplaySubject()
    const stateObs = subject.asObservable()
    const state = sliceRjState(store.getState(), name)
    stateObs.value = state
    subject.next(state)
    return [subject, stateObs]
  })

  useEffect(() => {
    function checkForUpdates() {
      const nextState = sliceRjState(store.getState(), name)
      if (nextState !== state$.value) {
        state$.value = nextState
        stateSubject.next(nextState)
      }
    }
    checkForUpdates()
    const unsub = store.subscribe(checkForUpdates)
    return unsub
  }, [stateSubject, state$, name, store])

  return state$
}

export const useRj = createUseRj({
  useReducer: useReduxReducer,
  useDeriveState: useDeriveStateFromRedux,
  useStateObserver: useReduxStateObserver,
})
export const useRunRj = createUseRunRj(useRj)

function createReduxReducer(reducer, name) {
  return function namespacedReducer(state, action) {
    const prefix = STATE_PREFIX + '/' + name + '/'
    const index = action.type.indexOf(prefix)
    if (index !== -1) {
      const type = action.type
      const decoupleType = type.substr(index + prefix.length, type.length)
      return reducer(state, { ...action, type: decoupleType })
    }
    return reducer(state, action)
  }
}

export function createReducer(rjObjects) {
  const reducers = rjObjects.reduce((reducers, rjObject) => {
    const name = rjObject.__rjconfig.name
    return {
      [name]: createReduxReducer(rjObject.reducer, name),
      ...reducers,
    }
  }, {})
  return combineReducers(reducers)
}
