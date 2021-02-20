import { RJ_PLUGIN } from './internals'
import { mergeRjObject } from './rjObject'
import { RjBaseConfig, RjMergeableObject, RjPlugin } from './types'

export default function craftRjPlugin(
  config: RjBaseConfig,
  plugins: RjPlugin[]
): RjPlugin {
  const plugIn = (givenObj: RjMergeableObject) => {
    const wihtCurriedPluginObj = plugins.reduce(
      (mergeObj, plugin) => plugin(mergeObj),
      givenObj
    )
    return mergeRjObject(config, wihtCurriedPluginObj)
  }
  Object.defineProperty(plugIn, '__rjtype', { value: RJ_PLUGIN })
  return plugIn
}
