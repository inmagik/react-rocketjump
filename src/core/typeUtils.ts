import { RJ_CONFIGURED_EFFECT_CALLER, RJ_OBJECT, RJ_PLUGIN } from './internals'
import { RjConfguredCaller, RjObject, RjPlugin } from './types'

export function isRjConfiguredCaller(a: any): a is RjConfguredCaller {
  return a === RJ_CONFIGURED_EFFECT_CALLER
}

export function isObjectRj(a: any): a is RjObject {
  return a?.__rjtype === RJ_OBJECT
}

export function isPluginRj(a: any): a is RjPlugin {
  return a?.__rjtype === RJ_PLUGIN
}
