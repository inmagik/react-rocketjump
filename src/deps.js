import { get } from './helpers'

// ~~ prince of saint felix ~~

const NOT_RUN = Symbol('deBpsNoRun')

class DeBpMonad {
  constructor(value, meta) {
    this._value = value
    this._meta = meta
  }
  meta(newMeta) {
    this._meta = { ...this._meta, ...newMeta }
    return this
  }
  getMeta() {
    return this._meta
  }
  getValue() {
    return this._value
  }
}

const Run = (a, meta) => new DeBpMonad(a, meta)
const NotRun = () => new DeBpMonad(NOT_RUN)

export const getDepValue = a => (a instanceof DeBpMonad ? a.getValue() : a)

export const getDepMeta = a =>
  a instanceof DeBpMonad ? a.getMeta() : undefined

// Is a maybe value?
export const isNotRunValue = a => getDepValue(a) === NOT_RUN

export const meta = (a, meta) => Run(a, meta)

// Naybe run based on value
export const maybe = a => (a ? Run(a) : NotRun())

// Make all deps a maybe value!
export const allMaybe = (...args) => args.map(maybe)

// maybe if value is null
export const maybeNull = a => (a === null ? NotRun() : Run(a))

// Make all deps maybe null
export const allMaybeNull = (...args) => args.map(maybeNull)

// Value + get object path or maybe
export const maybeGet = (obj, path) => (obj ? Run(get(obj, path)) : NotRun())
