import { proxyObject, kompose } from 'rocketjump-core/utils'
import { get } from '../helpers'

// Add some utils selectors
function makeMutationsSelectors() {
  return {
    getRoot: state => state.root,
    getMutation: (state, path) => get(state.mutations, path),
  }
}

export function enhanceMakeSelectors(mutations, makeSelectors) {
  // Compose makeSelectors as rj export does ...
  return kompose(makeSelectors, selectors =>
    proxyObject(selectors, makeMutationsSelectors)
  )
}
