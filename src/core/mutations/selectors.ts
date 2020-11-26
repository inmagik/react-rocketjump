import { RjStateShapeWithMutations } from '../types'

export function getMutations<S = any>(state: RjStateShapeWithMutations<S>) {
  return state.mutations
}
