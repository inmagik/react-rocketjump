// Our main builder the MagIK rj()
import rj from './rj'

// MagIK DeBps for useRunRj hook
import * as allDeps from './deps'

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

// Exports DeBps
const deps = { ...allDeps } // Remove es6 module shit
export { deps }

// HOC
export { default as connectRj } from './connectRj'

// Compose HOCs utility
export { default as compose } from './compose'

// Scoped config of rocketjump
export { default as ConfigureRj } from './ConfigureRj'

// make effect action
export { makeLibraryAction as makeAction } from './actionCreators'

// All action types
export * from './actionTypes'

// All rx effects
export { default as RxEffects } from './rxEffects'
