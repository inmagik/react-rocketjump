import { rj } from '../../index'
import { get } from 'rocketjump-core/utils'
import { getOrSelect } from '../../helpers'
import { SUCCESS, HYDRATE } from '../../actionTypes'
import rjListInsert from '../listInsert/index'
import rjListUpdate from '../listUpdate/index'
import rjListDelete from '../listDelete/index'

// Data reducer for a list paginated
const makeListDataReducer = (
  paginationAdapter,
  customListReducer,
  customPaginationReducer
) => {
  const defaultListReducer = (prevState, { payload: { data }, meta }) => {
    const newList = getOrSelect(data, paginationAdapter.list)
    if (meta && meta.append && Array.isArray(prevState)) {
      return prevState.concat(newList)
    }
    if (meta && meta.prepend && Array.isArray(prevState)) {
      return newList.concat(prevState)
    }
    return newList
  }

  const defaultPaginationReducer = (
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

// Selectors for a list
const makeListSelectors = (getData, pageSize) => {
  const getList = (state) => {
    const data = getData(state)
    return data === null ? null : data.list
  }

  const getCount = (state) => {
    const data = getData(state)
    return data === null ? null : data.pagination.count
  }

  const getNumPages = (state, overridePageSize = pageSize) => {
    if (overridePageSize === undefined) {
      throw new Error(
        '[reactRj - rjList] Please pass a pageSize argument to getNumPages' +
          'selector or define a default page size (config.pageSize)'
      )
    }
    const count = getCount(state)
    return count === null ? null : Math.ceil(count / overridePageSize)
  }

  const hasNext = (state) => {
    const data = getData(state)
    return data === null ? false : data.pagination.next !== null
  }

  const hasPrev = (state) => {
    const data = getData(state)
    return data === null ? false : data.pagination.previous !== null
  }

  const getNext = (state) => {
    const data = getData(state)
    return data === null ? null : data.pagination.next
  }

  const getPrev = (state) => {
    const data = getData(state)
    return data === null ? null : data.pagination.previous
  }

  const getCurrent = (state) => {
    const data = getData(state)
    return data === null ? null : data.pagination.current
  }

  const getPagination = (state, pageSize) => ({
    count: getCount(state),
    numPages: getNumPages(state, pageSize),
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

// RJ List
const rjList = (config = {}) => {
  if (!config.pagination)
    throw new Error(
      '[reactRj - rjList] Please define a pagination adapter (config.pagination)'
    )
  const dataReducer = makeListDataReducer(
    config.pagination,
    config.customListReducer,
    config.customPaginationReducer
  )
  const computed = {
    error: 'getError',
    loading: 'isLoading',
    list: 'getList',
  }
  if (config.pageSize) {
    computed.pagination = 'getPagination'
  }

  return rj(
    rjListInsert({ path: 'data.list' }),
    rjListUpdate({ path: 'data.list' }),
    rjListDelete({ path: 'data.list' }),
    {
      selectors: ({ getData }) => makeListSelectors(getData, config.pageSize),
      reducer: (oldReducer) => (state, action) => {
        switch (action.type) {
          case HYDRATE:
            return {
              ...state,
              data: dataReducer(null, action),
            }
          case SUCCESS:
            return {
              ...state,
              pending: false,
              data: dataReducer(state.data, action),
            }
          default:
            return oldReducer(state, action)
        }
      },
      computed,
    }
  )
}

export default rjList

export * from './pagination'
