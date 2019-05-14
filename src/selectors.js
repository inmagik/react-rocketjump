// Barebone selectors for barebone reducer
export default function makeSelectors() {
  const getData = ({ data }) => data
  const isLoading = ({ pending }) => pending
  const isPending = ({ pending }) => pending
  const getError = ({ error }) => error

  return { getData, isLoading, isPending, getError }
}
