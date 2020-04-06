import { isObjectRj as coreIsObjectRj } from 'rocketjump-core'
import rj from './rj'

export function isObjectRj(objRj) {
  return coreIsObjectRj(objRj, rj)
}
