import { RJ_CONFIG_PLACEHOLDER } from '../internals'
import * as standardMutations from './standardMutations'

// Placehoder for effectCaller (only it for now) in rj config
export function configured() {
  return RJ_CONFIG_PLACEHOLDER
}

export const mutation = { ...standardMutations }
