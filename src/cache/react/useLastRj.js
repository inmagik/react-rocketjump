import useCacheStore from './useCacheStore'
import { useRef, useEffect } from 'react'
import { useRerender } from './utils'

export default function useLastRj(rjObject, params = [], config = {}) {
  const cacheStore = useCacheStore()
  const bucket = cacheStore.buildBucket(rjObject, params)

  const prevBucket = useRef(bucket)
  const subA = useRef(null)
  const subB = useRef(null)

  const rerender = useRerender()
  useEffect(() => {
    if (subA.current === null) {
      // Init first subscription from bucket
      subA.current = bucket.subscribe(rerender)
    } else {
      if (bucket !== prevBucket.current) {
        // Bucket has changed

        // New bucket has data
        if (bucket.state.root.data !== null) {
          console.log('SUB A 4', bucket.key)
          prevBucket.current = bucket
          // Clear prev A subscription
          subA.current()
          // Create new sub
          subA.current = bucket.subscribe(rerender)

          // NOTE: In the future an opt can be swap A B when the bucket
          // is the same ....
          if (subB.current) {
            subB.current()
            subB.current = null
          }
        } else {
          console.log('SUB B 4', bucket.key)
          if (subB.current) {
            subB.current()
          }
          subB.current = bucket.subscribe(rerender)
        }
      }
    }
  }, [bucket, rerender, bucket.state.root.data])

  // Clear pending subscription on unmount
  useEffect(() => {
    return () => {
      if (subA.current) {
        subA.current()
      }
      if (subB.current) {
        subB.current()
      }
    }
  }, [])

  // console.log(
  //   'CURRENT',
  //   bucket.key,
  //   bucket.state.root.data !== null,
  //   bucket.state.root
  // )
  // console.log(
  //   'PREV',
  //   prevBucket.current.key,
  //   prevBucket.current.state.root.data !== null,
  //   prevBucket.current.state.root
  // )

  let resolvedBucket, currentBucket
  if (bucket.state.root.data !== null) {
    resolvedBucket = bucket
    currentBucket = bucket
  } else {
    resolvedBucket = prevBucket.current
    currentBucket = bucket
  }

  const memoResolvedState = resolvedBucket.memoizedState
  const actionsForResolvedState = resolvedBucket.memoizedActions

  const memoCurrentState = currentBucket.memoizedState
  const actionsForCurrentState = currentBucket.memoizedActions

  return [
    memoResolvedState,
    memoCurrentState,
    actionsForResolvedState,
    actionsForCurrentState,
  ]
}
