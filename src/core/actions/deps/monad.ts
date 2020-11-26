// ~~ prince of saint felix ~~ (with types)
// Ok, types not so cool for now but for now are ok maybe improve later
import { ActionMeta } from '../../types'

interface DeBpConfig {
  shouldRun?: boolean
  metaOnMount?: boolean
  skipRunValue?: boolean
  meta?: ActionMeta
}

const DefaultConfig: DeBpConfig = {
  shouldRun: true,
  metaOnMount: false,
  skipRunValue: false,
  meta: {},
}

export class DeBp {
  readonly _value: any
  readonly _shouldRun: boolean
  readonly _metaOnMount: boolean
  readonly _skipRunValue: boolean
  _meta: ActionMeta

  constructor(value: any, c: DeBpConfig = {}) {
    const config = { ...DefaultConfig, ...c } as Required<DeBpConfig>
    this._value = value
    this._meta = config.meta
    this._shouldRun = config.shouldRun
    this._metaOnMount = config.metaOnMount
    this._skipRunValue = config.skipRunValue
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

  shouldRun() {
    return this._shouldRun
  }

  withMeta(newMeta: ActionMeta) {
    this._meta = { ...this._meta, ...newMeta }
    return this
  }

  getMeta(onMount = false) {
    // When we are on mount and meta are only 4 mount give undef
    if (!onMount && this._metaOnMount) {
      return undefined
    }
    return this._meta
  }
}

type MonadCb<S = any> = () => S

export function ifDep<A, T, F>(
  a: A,
  cbTrue: MonadCb<T>,
  cbFalse: MonadCb<F>
): A extends DeBp ? T : F

export function ifDep(a: any, cbTrue: MonadCb, cbFalse: MonadCb) {
  return a instanceof DeBp ? cbTrue() : cbFalse()
}

export const RunDeBp = (a: any) =>
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

export const NotRunDeBp = (a: any) =>
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

export const WithMetaDeBp = (a: any, meta: ActionMeta) =>
  ifDep(
    a,
    () =>
      new DeBp(a.getValue(), {
        shouldRun: a.shouldRun(),
        meta: { ...a.getMeta(), ...meta },
      }),
    () => new DeBp(a, { shouldRun: true, meta })
  )

export const WithMetaOnMountDeBp = (meta: ActionMeta) =>
  new DeBp(true, {
    shouldRun: true,
    meta,
    metaOnMount: true,
    skipRunValue: true,
  })

export const WithAlwaysMeta = (meta: ActionMeta) =>
  new DeBp(true, {
    shouldRun: true,
    meta,
    metaOnMount: false,
    skipRunValue: true,
  })

export const getDepValue = (a: any) =>
  ifDep(
    a,
    () => (a as DeBp).getValue(),
    () => a
  )

export const getDepMeta = (a: any, onMount: boolean) =>
  ifDep(
    a,
    () => (a as DeBp).getMeta(onMount),
    () => undefined
  )

export const shouldDepRun = (a: any) =>
  ifDep(
    a,
    () => (a as DeBp).shouldRun(),
    () => true
  )
