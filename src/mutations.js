import { useEffect, useReducer } from 'react'
import createMakeRxObservable from './createMakeRxObservable'
import { makeLibraryAction } from './actionCreators'
import { RUN, SUCCESS } from './actionTypes'
import { tap } from 'rxjs/operators'
import { useConstant } from './hooks'

const MUTATION_PREFIX = `@RJ~MUTATION`

const mutationReducer = (prevState, action) => {
  const type = action.type.split('/')[2]
  // console.log('X', type)
  if (type === 'PENDING') {
    return {
      ...prevState,
      pending: true,
    }
  }
  if (type === 'SUCCESS' || type === 'FAILURE') {
    return {
      ...prevState,
      pending: false,
    }
  }
  return prevState
}
const sss = {
  pending: false,
}
export function useMutation(mutationFn) {
  const [state, dispatch] = useReducer(mutationReducer, sss)
  const subscription = useConstant(() => {
    return mutationFn.__rjMutation.state$.subscribe(action => {
      // console.log('SHit from future!', action)
      dispatch(action)
    })
  })

  // On unmount unsub
  useEffect(() => {
    return () => subscription.unsubscribe()
  }, [subscription])

  return state
}

function makeActionCreator(name) {
  const actionCreator = (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params)
  actionCreator.__rjMutation = {
    name,
  }
  return actionCreator
}

export function enhanceActionCreators(mutations, actionCreators) {
  return Object.keys(mutations).reduce((actionCreators, name) => {
    // TODO: Add DEV warn 4 overrid prev exist actions ....
    const actionCreator = makeActionCreator(name)
    return {
      ...actionCreators,
      [name]: actionCreator,
    }
  }, actionCreators)
}

export function enhanceReducer(mutations, reducer, actionCreators) {
  const ActionsMap = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    let update

    if (typeof mutation.updater === 'string') {
      // TODO: Better checks ...
      const actionCreator = actionCreators[mutation.updater]
      update = (state, action) =>
        reducer(state, actionCreator(action.payload.data))
    } else {
      update = (state, action) => mutation.updater(state, action.payload.data)
    }

    const type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
    return {
      ...all,
      [type]: update,
    }
  }, {})

  return (prevState, action) => {
    if (ActionsMap[action.type]) {
      return ActionsMap[action.type](prevState, action)
    }
    return reducer(prevState, action)
  }
}

export function enhanceMakeObservable(mutations, makeObservable) {
  const makeMutationsObsList = Object.keys(mutations).map(name => {
    const { effect, takeEffect } = mutations[name]
    const prefix = `${MUTATION_PREFIX}/${name}/`

    return createMakeRxObservable(
      {
        effect,
        // TODO: Improve group by
        takeEffect: takeEffect || 'exhaust',
        effectPipeline: [],
      },
      prefix
    )
  })

  return (action$, ...params) => {
    let o$ = makeObservable(action$, ...params)
    o$ = makeMutationsObsList.reduce((o$, makeMutationObs) => {
      return makeMutationObs(o$, ...params)
    }, o$)
    o$ = o$.pipe(
      tap(a => {
        // console.log('A', a)
      })
    )
    return o$
  }
}

export function enhanceExportWithMutations(rjObject, mutations) {
  if (mutations === null) {
    return rjObject
  }

  const { makeRxObservable, actionCreators, reducer } = rjObject

  return {
    ...rjObject,
    reducer: enhanceReducer(mutations, reducer, actionCreators),
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(mutations, makeRxObservable),
  }
}
