import { get } from './helpers'

// prince of saint felix
const MAYBE = Symbol('deBps')

// Is a maybe value?
export const isMaybe = a => a === MAYBE

// Value or maybe
export const maybe = a => (a ? a : MAYBE)

// Make all deps a maybe value!
export const allMaybe = (...args) => args.map(maybe)

// maybe if value is null
export const maybeNull = a => (a === null ? MAYBE : a)

// Make all deps maybe null
export const allMaybeNull = (...args) => args.map(maybeNull)

// Value + lodas get or maybe
export const maybeGet = (obj, path) => (obj ? get(obj, path) : MAYBE)
