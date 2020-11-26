import { del } from 'object-path-immutable'

export function isPromise(obj: any): obj is Promise<any> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

export function arrayze<S extends any[] | any>(
  a: S
): S extends any[] ? S : [S] {
  return Array.isArray(a) ? a : ([a] as any)
}

// Light get ... only '.' is supported, and obj is expect to be plain shit...
export function get(obj: any, path: string, defaultValue?: any) {
  const keys = path.split('.')
  const result =
    obj === null
      ? undefined
      : keys.reduce((context, current) => context[current], obj)
  return result === undefined ? defaultValue : result
}

export const getOrSelect = (obj: any, selector: ((a: any) => any) | string) => {
  if (typeof selector === 'function') {
    return selector(obj)
  }
  return get(obj, selector)
}

export function omit(object: any, props: string[]) {
  return props.reduce((obj, prop) => del(obj, prop), object)
}
