import { rjPlugin, SUCCESS } from '../../index'
import { get, getOrSelect } from '../../core/utils'
import rjListInsert from '../listInsert/index'
import { PaginationAdapter } from './pagination'
import {
  RjStateRootShape,
  RjStateShape,
  Reducer,
  CombineReducers,
  ReducersMap,
  RjPlugin,
  MakeRjPlugin,
} from '../../core/types'
import rjListUpdate from '../listUpdate/index'
import rjListDelete from '../listDelete/index'

type ListReducer<L extends any[] = any[]> = Reducer<L>

interface DefaultPaginationShape {
  count: number
  current: any
  next: any
  previous: any
}

type DefaultPaginationReducer = Reducer<DefaultPaginationShape>

type NullabelCombineReducers<M extends ReducersMap> = CombineReducers<
  M
> extends Reducer<infer H>
  ? Reducer<H | null>
  : never

type MakeDataListReducer<
  LC extends ListReducer,
  PC extends Reducer
> = NullabelCombineReducers<{
  list: LC extends ListReducer<infer H>
    ? unknown extends H
      ? ListReducer
      : LC
    : ListReducer
  pagination: PC extends Reducer<infer H>
    ? unknown extends H
      ? DefaultPaginationReducer
      : PC
    : DefaultPaginationReducer
}>

// Data reducer for a list paginated
function makeListDataReducer<LC extends ListReducer, PC extends Reducer>(
  paginationAdapter: PaginationAdapter,
  customListReducer?: LC,
  customPaginationReducer?: PC
): MakeDataListReducer<LC, PC>

// Data reducer for a list paginated
function makeListDataReducer(
  paginationAdapter: PaginationAdapter,
  customListReducer?: ListReducer,
  customPaginationReducer?: Reducer
): NullabelCombineReducers<{
  list: ListReducer
  pagination: any
}> {
  const defaultListReducer: ListReducer = (
    prevState,
    { payload: { data }, meta }
  ) => {
    const newList = getOrSelect(data, paginationAdapter.list)
    if (meta && meta.append && Array.isArray(prevState)) {
      return prevState.concat(newList)
    }
    if (meta && meta.prepend && Array.isArray(prevState)) {
      return newList.concat(prevState)
    }
    return newList
  }

  const defaultPaginationReducer: DefaultPaginationReducer = (
    prevState,
    { payload: { data, params } }
  ) => ({
    count: getOrSelect(data, paginationAdapter.count),
    current: getOrSelect(data, paginationAdapter.current),
    next: getOrSelect(data, paginationAdapter.next),
    previous: getOrSelect(data, paginationAdapter.previous),
  })

  const listReducer =
    typeof customListReducer === 'function'
      ? customListReducer
      : defaultListReducer

  const paginationReducer =
    typeof customPaginationReducer === 'function'
      ? customPaginationReducer
      : defaultPaginationReducer

  return (prevState, action) => ({
    list: listReducer(get(prevState, 'list'), action),
    pagination: paginationReducer(get(prevState, 'pagination'), action),
  })
}

interface ListDataShape<S extends any[] = any[]> {
  list: S
  pagination: {
    count: number
    current: any
    next: any
    previous: any
  }
  [extra: string]: any
}

// Selectors for a list
export type RootListStateShape<
  S extends any[] = any[]
> = RjStateRootShape<ListDataShape<S> | null>
export type ListStateShape<S extends any[] = any[]> = RjStateShape<
  RootListStateShape<S>
>

interface PaginationSelected {
  count: number | null
  numPages: number | null
  hasNext: boolean
  hasPrev: boolean
  current: any
  next: any
  prev: any
}

export type ListSelectors<LS extends ListStateShape> = {
  getList(s: LS): (LS extends ListStateShape<infer S> ? S : any) | null
  getCount(s: LS): number | null
  getNumPages(s: LS, overridePageSize?: number): number | null
  hasNext(s: LS): boolean
  hasPrev(s: LS): boolean
  getNext(s: LS): any
  getPrev(s: LS): any
  getCurrent(s: LS): any
  getPagination(s: LS): PaginationSelected
}

type ListGetData = (state: ListStateShape) => ListDataShape

const makeListSelectors = (
  getData: ListGetData,
  pageSize?: number
): ListSelectors<ListStateShape> => {
  const getList = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? null : data.list
  }

  const getCount = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? null : data.pagination.count
  }

  const getNumPages = (state: ListStateShape, overridePageSize = pageSize) => {
    if (overridePageSize === undefined) {
      throw new Error(
        '[reactRj - rjList] Please pass a pageSize argument to getNumPages' +
          'selector or define a default page size (config.pageSize)'
      )
    }
    const count = getCount(state)
    return count === null ? null : Math.ceil(count / overridePageSize)
  }

  const hasNext = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? false : data.pagination.next !== null
  }

  const hasPrev = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? false : data.pagination.previous !== null
  }

  const getNext = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? null : data.pagination.next
  }

  const getPrev = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? null : data.pagination.previous
  }

  const getCurrent = (state: ListStateShape) => {
    const data = getData(state)
    return data === null ? null : data.pagination.current
  }

  const getPagination = (state: ListStateShape) => ({
    count: getCount(state),
    numPages: getNumPages(state),
    hasNext: hasNext(state),
    hasPrev: hasPrev(state),
    current: getCurrent(state),
    next: getNext(state),
    prev: getPrev(state),
  })

  return {
    getList,
    getCount,
    getNumPages,
    hasNext,
    hasPrev,
    getNext,
    getPrev,
    getCurrent,
    getPagination,
  }
}

type GrabListReducer<
  C extends RjPluginListConfig
> = C extends RjPluginListConfig<infer LR, infer PR>
  ? MakeDataListReducer<LR, PR> extends Reducer<infer S>
    ? Reducer<RjStateRootShape<S>>
    : Reducer<string>
  : never

// NOTE: For now we ingore the custom pagination shape to build the list shape
// cause actually selector are only compatibile to custom pagination shape
// so allowing to any paginatio shape can actually cuase runtime errors
type GrabListOnlyStateShape<
  C extends RjPluginListConfig
> = C extends RjPluginListConfig<infer LC>
  ? LC extends ListReducer<infer H>
    ? unknown extends H
      ? ListStateShape
      : ListStateShape<H>
    : ListStateShape
  : never

interface RjPluginListConfig<
  LR extends ListReducer = ListReducer,
  PR extends Reducer = Reducer
> {
  pagination: PaginationAdapter
  pageSize?: number
  customListReducer?: LR
  customPaginationReducer?: PR
}

// RJ List
function rjList<C extends RjPluginListConfig>(
  config: C
): MakeRjPlugin<
  [
    ReturnType<typeof rjListInsert>,
    ReturnType<typeof rjListUpdate>,
    ReturnType<typeof rjListDelete>
  ],
  GrabListReducer<C>,
  ListSelectors<GrabListOnlyStateShape<C>>
>

function rjList(
  config: RjPluginListConfig
): RjPlugin<GrabListReducer<any>, ListSelectors<GrabListOnlyStateShape<any>>> {
  // NOTE: OLD CHECK MAYBE REMOVE CAUSE WE HAVE TYPPEEEES!
  if (!config?.pagination)
    throw new Error(
      '[reactRj - rjList] Please define a pagination adapter (config.pagination)'
    )
  const dataReducer = makeListDataReducer(
    config.pagination,
    config.customListReducer,
    config.customPaginationReducer
  )
  return rjPlugin(
    rjListInsert({ path: 'data.list' }),
    rjListUpdate({ path: 'data.list' }),
    rjListDelete({ path: 'data.list' }),
    {
      selectors: ({ getData }) =>
        makeListSelectors(getData as ListGetData, config.pageSize),
      reducer: (oldReducer) => (
        state: RootListStateShape | undefined,
        action
      ): RootListStateShape => {
        if (action.type === SUCCESS) {
          return {
            ...state,
            pending: false,
            data: dataReducer((state as RootListStateShape).data, action),
          } as RootListStateShape
        } else {
          return oldReducer(state, action)
        }
      },
    }
  )
}

export default rjList

export * from './pagination'
