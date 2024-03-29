import qs, { ParsedQuery } from 'query-string'

type PaginationPicker = ((data: any) => any) | string

export interface PaginationAdapter {
  list: PaginationPicker

  count: PaginationPicker

  current: PaginationPicker

  next: PaginationPicker

  previous: PaginationPicker
}

type ParamsPicker = <Q>(query: ParsedQuery<Q>) => any

// Util for getting pagination params from url
export const pickParamsFromUrl = (url: string | null, pick: ParamsPicker) => {
  if (url) {
    const params = qs.parse(qs.extract(url))
    return pick(params)
  }
  return null
}

const pickPage = ({ page }: { page?: string | number }) => ({
  page: +(page || 1),
})

export const nextPreviousPaginationAdapter: PaginationAdapter = {
  // Getter for list of stuff string or fn selector from the response
  list: 'results',
  // Count of total stuff
  count: 'count',

  current: ({ next, previous, count }) => {
    const { page: nextPage } = pickParamsFromUrl(next, pickPage) || {
      page: null,
    }
    const { page: prevPage } = pickParamsFromUrl(previous, pickPage) || {
      page: null,
    }
    if (nextPage !== null) {
      return { page: nextPage - 1 }
    } else if (prevPage !== null) {
      return { page: prevPage + 1 }
    } else if (count > 0) {
      return { page: 1 }
    } else {
      return null
    }
  },

  // Next params
  next: ({ next }) => pickParamsFromUrl(next, pickPage),

  // Prev params
  previous: ({ previous }) => pickParamsFromUrl(previous, pickPage),
}

const pickLimitOffset = ({
  limit,
  offset,
}: {
  limit?: string | number
  offset?: string | number
}) => ({
  limit: +(limit ?? 0),
  offset: +(offset ?? 0),
})

export const limitOffsetPaginationAdapter: PaginationAdapter = {
  // Getter for list of stuff string or fn selector from the response
  list: 'results',
  // Count of total stuff
  count: 'count',

  current: ({ next, previous, count }) => {
    const { limit: prevLimit, offset: prevOffset } = pickParamsFromUrl(
      previous,
      pickLimitOffset
    ) || { limit: null, offset: null }
    const { limit: nextLimit, offset: nextOffset } = pickParamsFromUrl(
      next,
      pickLimitOffset
    ) || { limit: null, offset: null }
    if (prevLimit !== null) {
      return { limit: prevLimit, offset: prevLimit + prevOffset }
    } else if (nextLimit !== null) {
      return { limit: nextLimit, offset: nextLimit - nextOffset }
    } else if (count > 0) {
      return { page: 1 }
    } else {
      return null
    }
  },

  // Next params
  next: ({ next }) => pickParamsFromUrl(next, pickLimitOffset),
  // Prev params
  previous: ({ previous }) => pickParamsFromUrl(previous, pickLimitOffset),
}
