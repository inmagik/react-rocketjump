import { rjPlugin, SUCCESS } from '../..'
import {
  MakeRjPlugin,
  Reducer,
  RjStateRootShape,
  RjStateShape,
  Selectors,
} from '../../core/types'
import rjListInsert from '../listInsert/index'
import rjListUpdate from '../listUpdate/index'
import rjListDelete from '../listDelete/index'

// Data reducer for a list paginated
export const makeListDataReducer = (
  customListReducer?: ListReducer
): ListReducer => {
  const defaultListReducer: ListReducer = (
    prevState,
    { payload: { data }, meta }
  ) => {
    const newList = data
    if (meta && meta.append) {
      return (prevState || []).concat(newList)
    }
    if (meta && meta.prepend) {
      return newList.concat(prevState || [])
    }
    return newList
  }

  const listReducer =
    typeof customListReducer === 'function'
      ? customListReducer
      : defaultListReducer

  return (prevState, action) => listReducer(prevState, action)
}

type ListGetData = (s: ListStateShape) => any[] | null

// Selectors for a list
export const makeListSelectors = (getData: ListGetData): ListSelectors => {
  const getList = getData

  const getCount = (state: ListStateShape) => {
    const data = getList(state)
    return data === null ? null : data.length
  }

  return {
    getList,
    getCount,
  }
}

type ListReducer<L extends any[] | null = any[] | null> = Reducer<L>

interface RjPluginPlainListConfig<LR extends ListReducer = ListReducer> {
  customListReducer?: LR
}

type MakeDataListReducer<LC extends ListReducer> = LC extends ListReducer<
  infer H
>
  ? unknown extends H
    ? ListReducer
    : LC
  : ListReducer

type GrabListReducer<
  C extends RjPluginPlainListConfig
> = C extends RjPluginPlainListConfig<infer LR>
  ? MakeDataListReducer<LR> extends Reducer<infer S>
    ? Reducer<RjStateRootShape<S>>
    : Reducer<string>
  : never

type ListStateShape = RjStateShape<RjStateRootShape<any[] | null>>

export interface ListSelectors extends Selectors {
  getList(s: ListStateShape): any[] | null
  getCount(s: ListStateShape): number | null
}

// RJ Plain List

function rjPlainList<C extends RjPluginPlainListConfig>(
  config?: C
): MakeRjPlugin<
  [
    ReturnType<typeof rjListInsert>,
    ReturnType<typeof rjListUpdate>,
    ReturnType<typeof rjListDelete>
  ],
  GrabListReducer<C>,
  ListSelectors
>

function rjPlainList(config: RjPluginPlainListConfig = {}) {
  const dataReducer = makeListDataReducer(config.customListReducer)
  return rjPlugin(rjListInsert(), rjListUpdate(), rjListDelete(), {
    selectors: ({ getData }) => makeListSelectors(getData),
    reducer: (oldReducer) => (state, action) => {
      if (action.type === SUCCESS) {
        return {
          ...state,
          pending: false,
          data: dataReducer(state.data, action),
        }
      } else {
        return oldReducer(state, action)
      }
    },
  })
}

export default rjPlainList
