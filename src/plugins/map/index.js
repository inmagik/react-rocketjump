import { omit } from '../../helpers'
import { rj } from '../../index'
import { PENDING, SUCCESS, FAILURE, CLEAN } from '../../actionTypes'

const defaultKeyMaker = action => (action.meta ? action.meta.id : null)
const defaultDataTransform = arg => arg

const handlePendingItem = (prevState, action) => ({
  ...prevState,
  error: null,
  pending: true,
  data: (prevState && prevState.data) || null,
})

const handleSuccessItem = (prevState, action, dataTransform) => ({
  ...prevState,
  pending: false,
  data: dataTransform(action.payload.data),
})

const handleFailureItem = (prevState, action) => ({
  ...prevState,
  pending: false,
  error: action.payload,
})

const makeMapReducer = (
  keyMaker = defaultKeyMaker,
  dataTransform,
  keepCompleted = true,
  fallbackReducer
) => {
  return (prevState, action) => {
    const key = keyMaker(action)

    prevState = prevState || {}

    switch (action.type) {
      case PENDING: {
        return {
          ...prevState,
          [key]: handlePendingItem(prevState[key], action),
        }
      }
      case FAILURE: {
        return {
          ...prevState,
          [key]: handleFailureItem(prevState[key], action),
        }
      }
      case SUCCESS: {
        if (keepCompleted) {
          return {
            ...prevState,
            [key]: handleSuccessItem(
              prevState[key],
              action,
              dataTransform || defaultDataTransform
            ),
          }
        } else {
          return omit(prevState, [key])
        }
      }
      case CLEAN: {
        // Clear key state
        if (key) {
          return omit(prevState, [key])
        }
        // Clear all the state
        return {}
      }
      default:
        return fallbackReducer(prevState, action)
    }
  }
}

const makeMapSelectors = ({ getRoot }) => {
  const getMapPendings = state => {
    const rootState = getRoot(state)
    return Object.keys(rootState).reduce(
      (r, key) => (rootState[key].pending ? { ...r, [key]: true } : r),
      {}
    )
  }

  const getMapLoadings = getMapPendings

  const getMapFailures = state => {
    const rootState = getRoot(state)
    return Object.keys(rootState).reduce((r, key) => {
      const error = rootState[key].error
      return error !== null ? { ...r, [key]: error } : r
    }, {})
  }

  const getMapData = state => {
    const rootState = getRoot(state)
    return Object.keys(rootState).reduce((r, key) => {
      const data = rootState[key].data
      return data !== null ? { ...r, [key]: data } : r
    }, {})
  }

  return {
    getMapLoadings,
    getMapPendings,
    getMapFailures,
    getMapData,
  }
}

const rjMap = (mapConfig = {}) =>
  rj({
    actions: ({ run, clean }) => ({
      runKey: (id, ...params) => run(id, ...params).withMeta({ id }),
      cleanKey: id => clean(id).withMeta({ id }),
    }),
    reducer: oldReducer =>
      makeMapReducer(
        mapConfig.key,
        mapConfig.dataTransform,
        mapConfig.keepCompleted,
        oldReducer
      ),
    selectors: makeMapSelectors,
    takeEffect: [
      'groupBy',
      typeof mapConfig.key === 'function' ? mapConfig.key : defaultKeyMaker,
    ],
  })

export default rjMap
