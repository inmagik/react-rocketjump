import { RJ_CONFIG_PLACEHOLDER } from './internals'
import * as standardMutations from './mutations/standard/index'

// feature flags
export { default as flags } from './flags'

// Placehoder for effectCaller (only it for now) in rj config
export function configured() {
  return RJ_CONFIG_PLACEHOLDER
}

export const mutation = { ...standardMutations }
