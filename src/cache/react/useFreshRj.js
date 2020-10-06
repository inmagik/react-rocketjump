import { useEffect, useRef, useMemo } from 'react'
import useCacheStore from './useCacheStore'
import { useRerender } from './utils'
import { PENDING, INIT } from '../../../../actionTypes'

export default function useFreshRj(rjObject, params = [], config = {}) {
  const lastConfigRef = useRef(config)
  const cacheStore = useCacheStore()
  const bucket = cacheStore.buildBucket(rjObject, params)

  // Never shot stal shit ...
  const isStaleDataRef = useRef(true)
  const prevStateRef = useRef(null)

  useEffect(() => {
    lastConfigRef.current = config
  })

  if (config.suspense) {
    if (bucket.selectors.getData(bucket.state) === null) {
      throw bucket.suspensePromise()
    }
  }

  // TODO: SWHITCH TO USE MUTABLE SOURCE
  const rerender = useRerender()
  useEffect(() => {
    const lastConfig = lastConfigRef.current
    prevStateRef.current = bucket.state
    // console.log(bucket.instances)
    isStaleDataRef.current =
      bucket.instances.size === 0 || lastConfig.runOnMount
    // eheheh the malus the extra render to be consistent baby!
    const unsub = bucket.subscribe((state) => {
      const prevState = prevStateRef.current
      const { getData, getRoot } = bucket.selectors
      // TODO: FIX THI SHIT !!!!
      // console.log('GANG', getData, getData(bucket.state), getData(prevState))
      if (
        getData(getRoot(bucket.state)) !== getData(getRoot(prevState)) &&
        getData(getRoot(bucket.state)) !== null
      ) {
        isStaleDataRef.current = false
        prevStateRef.current = state
      }
      rerender()
    }, lastConfig)
    if (!isStaleDataRef.current && !lastConfig.runOnMount) {
      rerender()
    }
    return unsub
  }, [bucket, rerender])

  let outState = bucket.memoizedState
  const loadingFactoryState = useMemo(() => {
    const { reducer, computeState, makeSelectors } = rjObject
    const selectors = makeSelectors()
    let state = reducer(undefined, { type: INIT })
    state = reducer(state, { type: PENDING })
    return computeState(state, selectors)
  }, [rjObject])

  if (isStaleDataRef.current) {
    outState = loadingFactoryState
  }

  return [outState, bucket.memoizedActions]
}
