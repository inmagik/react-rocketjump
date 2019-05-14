import { rj } from '../../index'
import { set, get } from '../../helpers'

const TYPE = 'RJ_LIST_DELETE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id

const rjListDelete = (config = {}) => {
  const identity = config.identity || defaultIdentity
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      deleteItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        const paginationPath = path
          .split('.')
          .map((item, i, arr) => i === arr.length - 1 ? 'pagination' : item)
          .join('.')
        if (state && get(state, paginationPath) && config.warnPagination !== false) {
          // eslint-disable-next-line no-console
          console.warn(
            'It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object'
          )
        }
        const newState = {...state}
        let list = get(newState, path)
        if (list) list = list.filter(listItem => !identity(action, listItem))
        set(newState, path, list)
        return newState
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListDelete