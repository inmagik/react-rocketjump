import { RjStateShape, RjStartSelectors, RjBaseSelectors } from './types'

export default function defaultMakeSelectors({
  getRoot,
  ...extraSelectors
}: RjStartSelectors): RjBaseSelectors {
  const getData = (state: RjStateShape) => getRoot(state).data
  const isLoading = (state: RjStateShape) => getRoot(state).pending
  const isPending = (state: RjStateShape) => getRoot(state).pending
  const getError = (state: RjStateShape) => getRoot(state).error

  return { ...extraSelectors, getRoot, getData, isLoading, isPending, getError }
}
