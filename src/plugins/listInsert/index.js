import { rj } from '../../index'
import { set, get } from '../../helpers'

const TYPE = 'RJ_LIST_INSERT'

const defaultMerge = (action, list) => (list || []).concat([action.item])

const rjListInsert = (config = {}) => {
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      insertItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        const paginationPath = path
          .split('.')
          .map((item, i, arr) => i === arr.length - 1 ? 'pagination' : item)
          .join('.')
        if (state && get(state, paginationPath) && config.warnPagination !== false) {
          console.warn(
            'It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object'
          )
        }
        const mergeFunc = config.merge ? config.merge : defaultMerge
        const newState = {...state}
        set(newState, path, mergeFunc(action, get(newState, path)))
        return newState
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListInsert