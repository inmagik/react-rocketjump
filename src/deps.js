import { get } from 'rocketjump-core/utils'

// ~~ prince of saint felix ~~

const DefaultConfig = {
  shouldRun: true,
  metaOnMount: false,
  skipRunValue: false,
}

class DeBp {
  constructor(value, c = {}) {
    const config = { ...DefaultConfig, ...c }
    this._value = value
    this._meta = config.meta
    this._shouldRun = config.shouldRun
    this._metaOnMount = config.metaOnMount
    this._skipRunValue = config.skipRunValue
  }
  withMeta(newMeta) {
    this._meta = { ...this._meta, ...newMeta }
    return this
  }
  getValue() {
    return this._value
  }
  metaOnMount() {
    return this._metaOnMount
  }
  skipRunValue() {
    return this._skipRunValue
  }
  getMeta(onMount = false) {
    // When we are on mount and meta are only 4 mount give undef
    if (!onMount && this._metaOnMount) {
      return undefined
    }
    return this._meta
  }
  shouldRun() {
    return this._shouldRun
  }
}

const ifDep = (a, cbTrue, cbFalse) => (a instanceof DeBp ? cbTrue() : cbFalse())

const RunDeBp = a =>
  ifDep(
    a,
    () =>
      new DeBp(a.getValue(), {
        shouldRun: true,
        meta: a.getMeta(),
        metaOnMount: a.metaOnMount(),
        skipRunValue: a.skipRunValue(),
      }),
    () => new DeBp(a, { shouldRun: true })
  )
const NotRunDeBp = a =>
  ifDep(
    a,
    () =>
      new DeBp(a.getValue(), {
        shouldRun: false,
        meta: a.getMeta(),
        metaOnMount: a.metaOnMount(),
        skipRunValue: a.skipRunValue(),
      }),
    () => new DeBp(a, { shouldRun: false })
  )
const WithMetaDeBp = (a, meta) =>
  ifDep(
    a,
    () =>
      new DeBp(a.getValue(), {
        shouldRun: a.shouldRun(),
        meta: { ...a.getMeta(), ...meta },
      }),
    () => new DeBp(a, { shouldRun: true, meta })
  )
const WithMetaOnMountDeBp = meta =>
  new DeBp(true, {
    shouldRun: true,
    meta,
    metaOnMount: true,
    skipRunValue: true,
  })

const WithAlwaysMeta = meta =>
  new DeBp(true, {
    shouldRun: true,
    meta,
    metaOnMount: false,
    skipRunValue: true,
  })

const getDepValue = a => ifDep(a, () => a.getValue(), () => a)

const getDepMeta = (a, onMount) =>
  ifDep(a, () => a.getMeta(onMount), () => undefined)

const shouldDepRun = a => ifDep(a, () => a.shouldRun(), () => true)

// useRunRj methods

export function getMetaFromDeps(oldValues, newArgs) {
  if (oldValues === null) {
    // All changes
    return newArgs.reduce(
      (meta, arg, i) => ({
        ...meta,
        ...getDepMeta(newArgs[i], true), // On mount
      }),
      {}
    )
  }
  const oldValuesLen = oldValues.length
  return newArgs.reduce((meta, arg, index) => {
    if (index >= oldValuesLen || getDepValue(arg) !== oldValues[index]) {
      const depMeta = getDepMeta(arg, false) // Not on mount
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
export function getRunValuesFromDeps(args) {
  return args.reduce(
    (runValues, a) =>
      ifDep(
        a,
        () => {
          // Meta on mount are not handle a run value
          if (a.skipRunValue()) {
            return runValues
          }
          runValues.push(a.getValue())
          return runValues
        },
        () => {
          runValues.push(a)
          return runValues
        }
      ),
    []
  )
}

// Should run ma values?
export function shouldRunDeps(args) {
  return !args.some(a => !shouldDepRun(a))
}

// ~D3BpS~

// Add meta when arg change
export const withMeta = (a, meta) => WithMetaDeBp(a, meta)

// Add meta only on mount
export const withMetaOnMount = meta => WithMetaOnMountDeBp(meta)

// Add always meta
export const withAlwaysMeta = meta => WithAlwaysMeta(meta)

// Maybe run based on value
export const maybe = a => (getDepValue(a) ? RunDeBp(a) : NotRunDeBp(a))

// Make all deps a maybe value!
export const allMaybe = (...args) => args.map(maybe)

// maybe if value is null
export const maybeNull = a =>
  getDepValue(a) === null ? NotRunDeBp(a) : RunDeBp(a)

// Make all deps maybe null
export const allMaybeNull = (...args) => args.map(maybeNull)

// Value + get object path or maybe
export const maybeGet = (a, path) => {
  const obj = getDepValue(a)
  if (obj) {
    return RunDeBp(get(obj, path))
  }
  return NotRunDeBp(a)
}
