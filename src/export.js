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
  invertKeys,
} from 'rocketjump-core/utils'
import { enhanceMakeExportWithPlugins } from 'rocketjump-core'
import DefaultActionCreators from './actionCreators'
import defaultReducer from './reducer'
import defaultMakeSelectors from './selectors'
import { enhanceMakeExportWithMutations } from './mutations/index'

// Make the exports
// take a extended export (the return of this function)
export default (runConfig, rjConfig, extendExport = {}, plugIns) => {
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
    actionCreators = DefaultActionCreators
  } else {
    // Use actionCreators to extended export
    actionCreators = extendExport.actionCreators
  }
  // Proxy actionCreators
  actionCreators = proxyObject(actionCreators, rjConfig.actions)

  // Create the make selectors
  // NOTE: The reason why switch from creating selectors
  // to creating a function that THEN (when rj is executed) actually
  // create selectors is a FUCKING TRICK eheh to let the user
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

  // Default no computed
  let computed = null
  if (extendExport.computed) {
    // Continue the export
    computed = extendExport.computed
  }
  if (rjConfig.computed) {
    // Merge given computed \w prev computed
    computed = { ...computed, ...invertKeys(rjConfig.computed) }
  }

  let newExport = {
    ...extendExport,
    sideEffect,
    reducer,
    actionCreators,
    makeSelectors,
    computed,
  }

  newExport = enhanceMakeExportWithMutations(rjConfig, newExport)
  return enhanceMakeExportWithPlugins(runConfig, rjConfig, newExport, plugIns)
}
