import { useEffect, useRef, useState, useMemo } from 'react'
import useRj from './useRj'
import {
  getRunValuesFromDeps,
  shouldRunDeps,
  getMetaFromDeps,
} from '../core/actions/deps/funcs'
import { BoundActionCreatorsWithBuilder } from '../core/actions/bindActionCreators'
import {
  ExtractRjObjectActions,
  ExtractRjObjectComputedState,
  ExtractRjObjectState,
  ExtractRjObjectSelectors,
  RjObject,
  ActionMeta,
} from '../core/types'
import { StateSelector } from './types'

interface WithNextMetaActionsBag {
  withNextMeta(meta: ActionMeta): void
}

function useRunRj<R extends RjObject, O>(
  // The returned value of rj(..., EFFECT)
  rjObject: R,
  // Argument of run
  runArgs?: any[],
  shouldCleanOnNewEffect?: boolean,
  // A function to select state
  selectState?: StateSelector<
    ExtractRjObjectState<R>,
    ExtractRjObjectSelectors<R>,
    ExtractRjObjectComputedState<R>,
    O
  >
): [
  unknown extends O ? ExtractRjObjectComputedState<R> : O,
  BoundActionCreatorsWithBuilder<ExtractRjObjectActions<R>> &
    WithNextMetaActionsBag
]

// Use a rocketjump and run it according to run arguments.
// This is only a syntax sugar over useRj and useEffect,
// you can create your own helper, we think this is the most "useful" version
// from our point of view.
function useRunRj(
  rjObject: RjObject,
  runArgs: any[] = [],
  shouldCleanOnNewEffect = true,
  // A function to select state
  selectState?: StateSelector
) {
  const [state, originalActions] = useRj(rjObject, selectState)
  const { run, clean } = originalActions

  const [withMeta, setWithMeta] = useState({})
  const prevWithMeta = useRef<ActionMeta | null>(null)

  const runValues = getRunValuesFromDeps(runArgs)
  const prevRunValues = useRef<any>(null)

  useEffect(() => {
    // Should run?
    const shouldRun = shouldRunDeps(runArgs)

    if (shouldRun) {
      const meta = getMetaFromDeps(runArgs, prevRunValues.current)
      // Add meta only if setWithMeta in called along with last args update
      let hackRunWithMeta = {}
      if (prevWithMeta.current && prevWithMeta.current !== withMeta) {
        hackRunWithMeta = withMeta
      }
      run.withMeta({ ...meta, ...hackRunWithMeta }).run(...runValues)
    }

    prevRunValues.current = runValues
    prevWithMeta.current = withMeta

    return () => {
      if (shouldCleanOnNewEffect && shouldRun) {
        clean()
      }
    }
    // spreading run arguments as deps means:
    // every time a run arguments changes (Object.is comparison)
    // a run is triggered and (if configured) a clean to clean up
    // the old effect related state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean, run, shouldCleanOnNewEffect, ...runValues])

  const actions = useMemo(
    () => ({
      ...originalActions,
      withNextMeta: setWithMeta,
    }),
    [setWithMeta, originalActions]
  )

  return useMemo(() => [state, actions], [state, actions])
}

export default useRunRj
