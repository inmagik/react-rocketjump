import { proxyObject, kompose, get } from 'rocketjump-core/utils'

// Add some utils selectors
function makeMutationsSelectors() {
  return {
    getRoot: (state) => state.root,
    getMutation: (state, path) => get(state.mutations, path),
  }
}

export function enhanceMakeSelectors(mutations, makeSelectors) {
  // Compose makeSelectors as rj export does ...
  return kompose(makeSelectors, (selectors) =>
    proxyObject(selectors, makeMutationsSelectors)
  )
}
