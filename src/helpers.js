import immutable from 'object-path-immutable'
import { get } from 'rocketjump-core/utils'

export function set(obj, path, value) {
  return immutable.set(obj, path, value)
}

export function omit(object, props) {
  return props.reduce((obj, prop) => immutable.del(obj, prop), object)
}

export const getOrSelect = (obj, selector) => {
  if (typeof selector === 'function') {
    return selector(obj)
  }
  return get(obj, selector)
}
