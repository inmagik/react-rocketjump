import { rj } from '../../index'
import { get } from 'rocketjump-core/utils'
import { set } from '../../helpers'

const TYPE = 'RJ_LIST_UPDATE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id
const defaultUpdater = action => action.item

const rjListUpdate = (config = {}) => {
  const identity = config.identity || defaultIdentity
  const updater = config.updater || defaultUpdater
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      updateItem: item => ({ type: TYPE, item }),
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        let list = get(state, path)
        if (list)
          list = list.map(listItem =>
            identity(action, listItem) ? updater(action, listItem) : listItem
          )
        return set(state, path, list)
      }
      return oldReducer(state, action)
    },
  })
}

export default rjListUpdate
