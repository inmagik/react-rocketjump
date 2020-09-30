// Barebone selectors for barebone reducer
export default function makeSelectors({ getRoot, ...extraSelectors }) {
  const getData = (state) => getRoot(state).data
  const isLoading = (state) => getRoot(state).pending
  const isPending = (state) => getRoot(state).pending
  const getError = (state) => getRoot(state).error

  return { ...extraSelectors, getRoot, getData, isLoading, isPending, getError }
}
