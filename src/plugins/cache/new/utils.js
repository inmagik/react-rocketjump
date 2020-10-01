export function makeDispatchWithCallbacks(dispatch, cacheStore) {
  return (action) => {
    const { successCallback, failureCallback, ...actionToDispatch } = action

    dispatch(actionToDispatch)

    if (successCallback) {
      successCallback(action.payload.data, cacheStore)
    }
    if (failureCallback) {
      failureCallback(action.payload, cacheStore)
    }
  }
}
// [String, Object, Number, Boolean, Array]
// TODO: IMPROVE THIS FUCKING SHIT MAYBE ASK 2 1312
export function createBucketMatchPredicate(rjObject, matchParams) {
  const { makeKey } = rjObject.cache
  let matchKey
  if (Array.isArray(matchParams)) {
    matchKey = makeKey(matchParams)
  } else if (matchParams !== undefined && matchParams !== null) {
    matchKey = makeKey([matchParams])
  }
  return (bucket) => {
    const { params, rjObject: rjObjectIterBucket } = bucket
    if (rjObjectIterBucket.cache.ns === rjObject.cache.ns) {
      // All shit
      if (!matchKey) {
        return true
      }
      return (
        rjObjectIterBucket.cache.makeKey(
          params.slice(0, matchParams.length)
        ) === matchKey
      )
    }
    return false
  }
}
