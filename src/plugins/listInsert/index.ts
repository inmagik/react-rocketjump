import { rjPlugin } from '../../core'
import { get } from '../../core/utils'
import { set } from 'object-path-immutable'
import { Action } from '../../core/types'

export const TYPE = 'RJ_LIST_INSERT'

interface RjListInsertPluginConfig {
  path?: string
  warnPagination?: boolean
  merge?: <L extends any[]>(action: Action, list: L) => L
}

const defaultMerge = (action: Action, list: any[]) =>
  (list || []).concat([action.item])

const rjListInsert = (config: RjListInsertPluginConfig = {}) => {
  const path = config.path || 'data'

  return rjPlugin({
    actions: () => ({
      insertItem: (item) => ({ type: TYPE, item }),
    }),
    reducer: (oldReducer) => (state, action) => {
      if (action.type === TYPE) {
        if (process.env.NODE_ENV !== 'production') {
          if (config.warnPagination !== false) {
            const paginationPath = path
              .split('.')
              .map((item, i, arr) =>
                i === arr.length - 1 ? 'pagination' : item
              )
              .join('.')
            if (state && get(state, paginationPath)) {
              console.warn(
                'It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object'
              )
            }
          }
        }
        const mergeFunc = config.merge ? config.merge : defaultMerge
        return set(state, path, mergeFunc(action, get(state, path)))
      }
      return oldReducer(state, action)
    },
  })
}

export default rjListInsert
