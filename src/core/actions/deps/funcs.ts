// useRunRj methods
import { getDepMeta, getDepValue, ifDep, shouldDepRun } from './monad'
import { ActionMeta } from '../../../core/types'

// ([...args], prevValuesFromRunValues) => Meta({})
export function getMetaFromDeps(
  argsWithDeps: any[],
  oldValues: null | any[] = null,
  onMount?: boolean
) : ActionMeta {
  if (oldValues === null) {
    const useOnMount =
      onMount === undefined
        ? true // On mount (unless forced)
        : onMount
    // All changes
    return argsWithDeps.reduce(
      (meta, arg, i) => ({
        ...meta,
        ...getDepMeta(argsWithDeps[i], useOnMount),
      }),
      {}
    )
  }
  const useOnMount =
    onMount === undefined
      ? false // Not on mount (unless forced)
      : onMount
  const oldValuesLen = oldValues.length
  return argsWithDeps.reduce((meta, arg, index) => {
    if (index >= oldValuesLen || getDepValue(arg) !== oldValues[index]) {
      const depMeta = getDepMeta(arg, useOnMount)
      if (depMeta) {
        return {
          ...meta,
          ...depMeta,
        }
      }
      return meta
    }
    return meta
  }, {})
}

// From run args to -> useEffect([...runValues])
export function getRunValuesFromDeps(argsWithDeps: any[]): any[] {
  return argsWithDeps.reduce(
    (runValues, arg) =>
      ifDep(
        arg,
        () => {
          // Meta on mount are not handle a run value
          if (arg.skipRunValue()) {
            return runValues
          }
          runValues.push(arg.getValue())
          return runValues
        },
        () => {
          runValues.push(arg)
          return runValues
        }
      ),
    []
  )
}

// Should run ma values?
export function shouldRunDeps(argsWithDeps: any[]) {
  return !argsWithDeps.some((a) => !shouldDepRun(a))
}
