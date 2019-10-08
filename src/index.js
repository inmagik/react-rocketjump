// Our main builder the MagIK rj()
import rj from './rj'
import * as configHelpers from './configHelpers'

// Attach config helpers to rj
for (let name in configHelpers) {
  rj[name] = configHelpers[name]
}

export { rj }

// Hooks
export { default as useRj } from './useRj'
export { default as useRunRj } from './useRunRj'

// HOC
export { default as connectRj } from './connectRj'

// Compose HOCs utility
export { default as compose } from './compose'

// Scoped config of rocketjump
export { default as ConfigureRj } from './ConfigureRj'

// MagIK DeBps for useRunRj hook
export { default as deps } from './deps'

// make effect action
export { makeLibraryAction as makeAction } from './actionCreators'

// All action types
export * from './actionTypes'

// All rx effects
export { default as RxEffects } from './rxEffects'
