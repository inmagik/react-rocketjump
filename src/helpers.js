import immutable from 'object-path-immutable'

export function get(obj, path, defaultValue = undefined) {
  const keys = path.split('.')
  const result =
    obj === null
      ? undefined
      : keys.reduce((context, current) => context[current], obj)
  return result === undefined ? defaultValue : result
}

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
