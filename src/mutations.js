import createMakeRxObservable from './createMakeRxObservable'
import { makeLibraryAction } from './actionCreators'
import { RUN } from './actionTypes'
import { tap, publish } from 'rxjs/operators'
import { merge } from 'rxjs'

const MUTATION_PREFIX = `@RJ~MUTATION`

function makeActionCreator(name) {
  return (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params)
}

export function makeMutationsActionCreators(mutations) {
  if (mutations === null) {
    return {}
  }

  return Object.keys(mutations).reduce((actionCreators, name) => {
    const actionCreator = makeActionCreator(name)
    return {
      ...actionCreators,
      [name]: actionCreator,
    }
  }, [])
  // console.log('Ma FUCKING mutations!!!!', mutations)
}

export function enhanceMakeObservableWithMutations(makeObservable, mutations) {
  if (mutations === null) {
    return makeObservable
  }

  const makeMutationsObsList = Object.keys(mutations).map(name => {
    const { effect } = mutations[name]
    const prefix = `${MUTATION_PREFIX}/${name}/`

    return createMakeRxObservable(
      {
        effect,
        takeEffect: 'exhaust',
      },
      prefix
    )
  })

  return (action$, ...params) => {
    let o$ = makeObservable(action$, ...params)
    o$ = makeMutationsObsList.reduce((o$, makeMutationObs) => {
      return makeMutationObs(o$, ...params)
    }, o$)

    return o$.pipe(
      tap(action => {
        console.log('Y shit', action)
      })
    )
  }
}
