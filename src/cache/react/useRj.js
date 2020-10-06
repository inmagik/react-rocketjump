import { useEffect } from 'react'
import useCacheStore from './useCacheStore'
import { useRerender } from './utils'

export default function useRj(rjObject, params = [], config = {}) {
  const cacheStore = useCacheStore()
  const bucket = cacheStore.buildBucket(rjObject, params)

  if (config.suspense) {
    // TODO: FIX DA SHIT
    if (
      bucket.selectors.getData(bucket.selectors.getRoot(bucket.state)) === null
    ) {
      throw bucket.suspensePromise()
    }
  }

  // TODO: SWHITCH TO USE MUTABLE SOURCE
  const rerender = useRerender()
  useEffect(() => {
    const unsub = bucket.subscribe(rerender)
    return unsub
  }, [bucket, rerender])

  return [bucket.memoizedState, bucket.memoizedActions]
}
