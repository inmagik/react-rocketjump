import qs from 'query-string'

// Util for getting pagination params from url
export const pickParamsFromUrl = (url, pick) => {
  if (url) {
    const params = qs.parse(qs.extract(url))
    return pick(params)
  }
  return null
}

const pickPage = ({ page }) => ({ page: +(page || 1) })

export const nextPreviousPaginationAdapter = {
  // Getter for list of stuff string or fn selector from the response
  list: 'results',
  // Count of total stuff
  count: 'count',

  current: pickPage,

  // Next params
  next: ({ next }) => pickParamsFromUrl(next, pickPage),

  // Prev params
  previous: ({ previous }) => pickParamsFromUrl(previous, pickPage),
}

const pickLimitOffset = ({ limit, offset }) => ({
  offset: +(offset || 0),
  limit: +limit,
})

export const limitOffsetPaginationAdapter = {
  // Getter for list of stuff string or fn selector from the response
  list: 'results',
  // Count of total stuff
  count: 'count',
  current: pickLimitOffset,
  // Next params
  next: ({ next }) => pickParamsFromUrl(next, pickLimitOffset),
  // Prev params
  previous: ({ previous }) => pickParamsFromUrl(previous, pickLimitOffset),
}
