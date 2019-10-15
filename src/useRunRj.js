import { useEffect, useRef } from 'react'
import useRj from './useRj'
import { getRunValuesFromDeps, shouldRunDeps, getMetaFromDeps } from './deps'

// Use a rocketjump and run it according to run arguments.
// This is only a syntax sugar over useRj and useEffect,
// you can create your own helper, we think this is the most "useful" version
// from our point of view.
export default function useRunRj(
  rjObject,
  runArgs = [],
  shouldCleanOnNewEffect = true,
  selectState
) {
  const stateAndActions = useRj(rjObject, selectState)
  const actions = stateAndActions[1]
  const { run, clean } = actions

  const runValues = getRunValuesFromDeps(runArgs)

  const prevRunValues = useRef(null)
  useEffect(() => {
    // has some maybe? If yes don't run effect
    const shouldRun = shouldRunDeps(runArgs)

    if (shouldRun) {
      const meta = getMetaFromDeps(prevRunValues.current, runArgs)
      run.withMeta(meta).run(...runValues)
    }

    prevRunValues.current = runValues

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

  return stateAndActions
}
