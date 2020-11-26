// ~D3BpS~
import { get } from '../../utils'
import {
  WithMetaDeBp,
  WithMetaOnMountDeBp,
  WithAlwaysMeta,
  getDepValue,
  RunDeBp,
  NotRunDeBp,
} from './monad'
import { ActionMeta } from '../../types'

// Add meta when arg change
export const withMeta = (a: any, meta: ActionMeta) => WithMetaDeBp(a, meta)

// Add meta only on mount
export const withMetaOnMount = (meta: ActionMeta) => WithMetaOnMountDeBp(meta)

// Add always meta
export const withAlwaysMeta = (meta: ActionMeta) => WithAlwaysMeta(meta)

// // Maybe run based on value
export const maybe = (a: any) => (getDepValue(a) ? RunDeBp(a) : NotRunDeBp(a))

// Make all deps a maybe value!
export const allMaybe = (...args: any[]) => args.map(maybe)

// maybe if value is null
export const maybeNull = (a: any) =>
  getDepValue(a) === null ? NotRunDeBp(a) : RunDeBp(a)

// Make all deps maybe null
export const allMaybeNull = (...args: any[]) => args.map(maybeNull)

// Value + get object path or maybe
export const maybeGet = (a: any, path: string) => {
  const obj = getDepValue(a)
  if (obj) {
    return RunDeBp(get(obj, path))
  }
  return NotRunDeBp(a)
}
