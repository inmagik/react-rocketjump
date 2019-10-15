import { useEffect, useRef, useState, useMemo } from 'react'
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
  const [state, originalActions] = useRj(rjObject, selectState)
  const { run, clean } = originalActions

  const [withMeta, setWithMeta] = useState({})
  const prevWithMeta = useRef(null)

  const runValues = getRunValuesFromDeps(runArgs)
  const prevRunValues = useRef(null)

  useEffect(() => {
    // Should run?
    const shouldRun = shouldRunDeps(runArgs)

    if (shouldRun) {
      const meta = getMetaFromDeps(prevRunValues.current, runArgs)
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
