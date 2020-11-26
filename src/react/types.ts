import { RjBaseSelectors, Selectors } from '../core/types'

export type StateSelector<
  S = any,
  SE extends Selectors = RjBaseSelectors,
  D = any,
  O = any
> = (state: S, memoizedSelectors: SE, derivedState: D) => O
