// Our main builder the MagIK rj()
import rj from './rj'

// All rj helpers
import * as configHelpers from './configHelpers'

// Attach config helpers to rj
for (let name in configHelpers) {
  rj[name] = configHelpers[name]
}

// Exports Rj \w helpers
export { rj }

// Hooks
export { default as useRj } from './useRj'
export { default as useRunRj } from './useRunRj'

// Export MagIK DeBps for useRunRj hook
export { deps } from 'rocketjump-core'

// HOC
export { default as connectRj } from './connectRj'

// Compose HOCs utility
export { default as compose } from './compose'

// Scoped config of rocketjump
export { default as ConfigureRj } from './ConfigureRj'

// make effect action
export { makeLibraryAction as makeAction } from 'rocketjump-core'

// All action types
export * from './actionTypes'

// Mutations action types
export * from './mutations/actionTypes'

// All types checks
export * from './types'

// All rx effects
export { default as RxEffects } from './rxEffects'

// Helper for custom Rx effect:
// { type: RUN } => [Observable<PENDING>, Observable<SUCCESS | FAILURE>]
export { default as mapRunActionToObservable } from './mapRunActionToObservable'

// Rj Cache
export * from './cache/index'
