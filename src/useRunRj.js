import { useEffect } from 'react'
import useRj from './useRj'

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
  const [state, actions] = useRj(rjObject, selectState)
  const { run, clean } = actions

  useEffect(() => {
    run(...runArgs)
    return () => {
      if (shouldCleanOnNewEffect) {
        clean()
      }
    }
    // spreading run arguments as deps means:
    // every time a run arguments changes (Object.is comparison)
    // a run is triggered and (if configured) a clean to clean up
    // the old effect related state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean, run, shouldCleanOnNewEffect, ...runArgs])

  return [state, actions]
}
