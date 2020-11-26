import { rjPlugin, PENDING, SUCCESS, FAILURE, CLEAN } from '../..'
import { omit } from '../../core/utils'
import {
  Action,
  Reducer,
  RjStateRootShape,
  RjStateShape,
} from '../../core/types'

type KeyMaker = (a: Action) => any

type DataTransformer<S = any> = (a: any) => S

interface RjPluginMapConfig {
  key?: KeyMaker
  dataTransform?: DataTransformer
  keepCompleted?: boolean
}

const defaultKeyMaker: KeyMaker = (action) =>
  action.meta ? action.meta.id : null
const defaultDataTransform: DataTransformer = (arg) => arg

const handlePendingItem = (prevState: RjStateRootShape, action: Action) => ({
  ...prevState,
  error: null,
  pending: true,
  data: (prevState && prevState.data) || null,
})

const handleSuccessItem = (
  prevState: RjStateRootShape,
  action: Action,
  dataTransform: DataTransformer
) => ({
  ...prevState,
  pending: false,
  data: dataTransform(action.payload.data),
})

const handleFailureItem = (
  prevState: RjStateRootShape,
  action: Action
): RjStateRootShape => ({
  ...prevState,
  pending: false,
  error: action.payload,
})

type RootMapStateShape = Record<string, RjStateRootShape>
type MapStateShape = RjStateShape<RootMapStateShape>

const makeMapReducer = (
  fallbackReducer: Reducer<any>,
  keyMaker: KeyMaker = defaultKeyMaker,
  dataTransform?: DataTransformer,
  keepCompleted = true
): Reducer<RootMapStateShape> => {
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

type GetMapRoot = (s: MapStateShape) => RootMapStateShape

const makeMapSelectors = ({ getRoot }: { getRoot: GetMapRoot }) => {
  const getMapPendings = (state: MapStateShape) : Record<string, boolean> => {
    const rootState = getRoot(state)
    return Object.keys(rootState).reduce(
      (r, key) => (rootState[key].pending ? { ...r, [key]: true } : r),
      {}
    )
  }

  const getMapLoadings = getMapPendings

  const getMapFailures = (state: MapStateShape) : Record<string, any> => {
    const rootState = getRoot(state)
    return Object.keys(rootState).reduce((r, key) => {
      const error = rootState[key].error
      return error !== null ? { ...r, [key]: error } : r
    }, {})
  }

  const getMapData = (state: MapStateShape): Record<string, any> => {
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

const rjMap = (mapConfig: RjPluginMapConfig = {}) =>
  rjPlugin({
    actions: ({ run, clean }) => ({
      runKey: (id, ...params) => run(id, ...params).withMeta({ id }),
      cleanKey: (id) => clean(id).withMeta({ id }),
    }),
    reducer: (oldReducer) =>
      makeMapReducer(
        oldReducer,
        mapConfig.key,
        mapConfig.dataTransform,
        mapConfig.keepCompleted
      ),
    selectors: makeMapSelectors,
    takeEffect: [
      'groupBy',
      typeof mapConfig.key === 'function' ? mapConfig.key : defaultKeyMaker,
    ],
  })

export default rjMap
