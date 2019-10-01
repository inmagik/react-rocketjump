import { useEffect } from 'react'
import useRj from './useRj'
import { isMaybe } from './deps'

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

  useEffect(() => {
    // has some maybe? If yes don't run effect
    const shouldRun = !runArgs.some(isMaybe)

    if (shouldRun) {
      run(...runArgs)
    }

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
  }, [clean, run, shouldCleanOnNewEffect, ...runArgs])

  return stateAndActions
}
