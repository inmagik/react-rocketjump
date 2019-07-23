import createMakeRxObservable from './createMakeRxObservable'
import { makeLibraryAction } from './actionCreators'
import { RUN, SUCCESS } from './actionTypes'
import { tap } from 'rxjs/operators'

const MUTATION_PREFIX = `@RJ~MUTATION`

function makeActionCreator(name) {
  return (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params)
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

export function enhanceReducer(mutations, reducer) {
  const ActionsMap = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]
    const update = (state, action) =>
      mutation.updater(state, action.payload.data)
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
        console.log('A', a)
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
    reducer: enhanceReducer(mutations, reducer),
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(mutations, makeRxObservable),
  }
}
