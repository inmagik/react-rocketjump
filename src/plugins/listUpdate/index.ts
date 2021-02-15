import { rjPlugin } from '../../index'
import { get } from '../../core/utils'
import { set } from 'object-path-immutable'
import { Action } from '../../core/types'

export const TYPE = 'RJ_LIST_UPDATE'

const defaultIdentity = (action: Action, listItem: any) =>
  action.item.id === listItem.id
const defaultUpdater = (action: Action) => action.item

interface RjListUpdatePluginConfig {
  path?: string
  updater?: (action: Action, listItem: any) => any
  identity?: (action: Action, listItem: any) => boolean
}

const rjListUpdate = (config:  RjListUpdatePluginConfig = {}) => {
  const identity = config.identity || defaultIdentity
  const updater = config.updater || defaultUpdater
  const path = config.path || 'data'

  return rjPlugin({
    actions: () => ({
      updateItem: (item) => ({ type: TYPE, item }),
    }),
    reducer: (oldReducer) => (state, action) => {
      if (action.type === TYPE) {
        let list = get(state, path)
        if (list)
          list = list.map((listItem: any) =>
            identity(action, listItem) ? updater(action, listItem) : listItem
          )
        return set(state, path, list)
      }
      return oldReducer(state, action)
    },
  })
}

export default rjListUpdate
