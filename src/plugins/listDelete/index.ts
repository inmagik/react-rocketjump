import { rjPlugin } from '../../index'
import { get } from '../../core/utils'
import { set } from 'object-path-immutable'
import { Action } from '../../core/types'

const TYPE = 'RJ_LIST_DELETE'

const defaultIdentity = (action: Action, listItem: any) =>
  action.item.id === listItem.id

interface RjListDeletePluginConfig {
  path?: string
  warnPagination?: boolean
  identity?: (action: Action, listItem: any) => boolean
}

const rjListDelete = (config: RjListDeletePluginConfig = {}) => {
  const identity = config.identity || defaultIdentity
  const path = config.path || 'data'

  return rjPlugin({
    actions: () => ({
      deleteItem: (item) => ({ type: TYPE, item }),
    }),
    reducer: (oldReducer) => (state, action) => {
      if (action.type === TYPE) {
        const paginationPath = path
          .split('.')
          .map((item, i, arr) => (i === arr.length - 1 ? 'pagination' : item))
          .join('.')
        if (
          state &&
          get(state, paginationPath) &&
          config.warnPagination !== false
        ) {
          console.warn(
            'It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object'
          )
        }
        let list = get(state, path)
        if (list) list = list.filter((listItem: any) => !identity(action, listItem))
        return set(state, path, list)
      }
      return oldReducer(state, action)
    },
  })
}

export default rjListDelete
