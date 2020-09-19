import { rj } from '../../index'
import { get } from 'rocketjump-core/utils'
import { set } from '../../helpers'

const TYPE = 'RJ_LIST_INSERT'

const defaultMerge = (action, list) => (list || []).concat([action.item])

const rjListInsert = (config = {}) => {
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      insertItem: (item) => ({ type: TYPE, item }),
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
        const mergeFunc = config.merge ? config.merge : defaultMerge
        return set(state, path, mergeFunc(action, get(state, path)))
      }
      return oldReducer(state, action)
    },
  })
}

export default rjListInsert
