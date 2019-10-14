import { useEffect, useRef } from 'react'
import useRj from './useRj'
import { isNotRunValue, getDepValue, getDepMeta } from './deps'

function getMeta(oldValues, newArgs) {
  if (oldValues === null) {
    // All changes
    return newArgs.reduce(
      (meta, arg, i) => ({
        ...meta,
        ...getDepMeta(newArgs[i]),
      }),
      {}
    )
  }
  const oldValuesLen = oldValues.length
  return newArgs.reduce((meta, arg, index) => {
    if (index >= oldValuesLen || getDepValue(arg) !== oldValues[index]) {
      const depMeta = getDepMeta(arg)
      if (depMeta) {
        return {
          ...meta,
          ...getDepMeta(arg),
        }
      }
      return meta
    }
    return meta
  }, {})
}

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

  const runValues = runArgs.map(getDepValue)

  const prevRunValues = useRef(null)
  useEffect(() => {
    // has some maybe? If yes don't run effect
    const shouldRun = !runArgs.some(isNotRunValue)

    if (shouldRun) {
      const meta = getMeta(prevRunValues.current, runArgs)
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
