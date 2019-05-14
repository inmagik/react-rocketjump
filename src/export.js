import {
  makeSideEffectDescriptor,
  addConfigToSideEffectDescritor,
} from './sideEffectDescriptor'
import {
  proxyObject,
  proxyReducer,
  composeReducers,
  kompose,
  arrayze,
} from 'rocketjump-core/utils'
import * as allActionCreators from './actionCreators'
import defaultReducer from './reducer'
import defaultMakeSelectors from './selectors'

// Convert 2 plain object
const defaultActionCreators = { ...allActionCreators }

// Make the exports
// take a extended export (the return of this function)
// _ -> is the run config but we don't need it
export default (_, rjConfig, extendExport = {}) => {
  // Make side effect descriptor exports
  let sideEffect
  if (!extendExport.sideEffect) {
    // Create fresh seide effect descriptor
    sideEffect = makeSideEffectDescriptor()
  } else {
    // Use the side effect descriptor form extended exports
    sideEffect = extendExport.sideEffect
  }
  // Enanche side effect descriptor \w config
  sideEffect = addConfigToSideEffectDescritor(sideEffect, rjConfig)

  // Make reducer
  let reducer
  if (!extendExport.reducer) {
    reducer = defaultReducer
  } else {
    reducer = extendExport.reducer
  }
  if (reducer) {
    reducer = proxyReducer(reducer, rjConfig.reducer)
    if (
      typeof rjConfig.composeReducer === 'function' ||
      Array.isArray(rjConfig.composeReducer)
    ) {
      const composeReducer = arrayze(rjConfig.composeReducer)
      reducer = composeReducers(...[reducer].concat(composeReducer))
    }
  }

  // Make action creators
  let actionCreators
  if (!extendExport.actionCreators) {
    // Make fresh action creators
    actionCreators = defaultActionCreators
  } else {
    // Use actionCreators to extended export
    actionCreators = extendExport.actionCreators
  }
  // Proxy actionCreators
  actionCreators = proxyObject(actionCreators, rjConfig.actions)

  // Create the make selectors
  // NOTE: The reason why switch from creating selectors
  // to creating a function that THEN (when rj is executed) actually
  // create reducer is a FUCKING TRICK eheh to let the user
  // to create a memoized-component version of the selectors
  let makeSelectors
  if (!extendExport.makeSelectors) {
    // Fresh selectors
    makeSelectors = defaultMakeSelectors
  } else {
    // Use selectors from exports
    makeSelectors = extendExport.makeSelectors
  }
  if (makeSelectors) {
    makeSelectors = kompose(makeSelectors, selectors =>
      proxyObject(selectors, rjConfig.selectors)
    )
  }

  const newExport = {
    ...extendExport,
    sideEffect,
    reducer,
    actionCreators,
    makeSelectors,
  }

  Object.defineProperty(newExport, '__rjtype', {
    // RAVER FOLLE 23
    value: extendExport.__rjtype,
  })

  return newExport
}
