import { get } from 'rocketjump-core/utils'

// Add some utils selectors
export function makeMutationsSelectors() {
  return {
    getMutation: (state, path) => get(state.mutations, path),
  }
}
