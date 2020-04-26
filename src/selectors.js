// Barebone selectors for barebone reducer
export default function makeSelectors() {
  const getRoot = (state) => state
  const getData = ({ data }) => data
  const isLoading = ({ pending }) => pending
  const isPending = ({ pending }) => pending
  const getError = ({ error }) => error

  return { getRoot, getData, isLoading, isPending, getError }
}
