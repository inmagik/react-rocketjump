import { del, set } from 'object-path-immutable'
import { get } from 'rocketjump-core/utils'

export function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

export function omit(object, props) {
  return props.reduce((obj, prop) => del(obj, prop), object)
}

export const getOrSelect = (obj, selector) => {
  if (typeof selector === 'function') {
    return selector(obj)
  }
  return get(obj, selector)
}

export { set }
