import { useRef, useEffect, useCallback, useMemo } from 'react'
import useCacheStore from './useCacheStore'

export default function useRjActions(rjObject, matchParams = []) {
  const cacheStore = useCacheStore()
  const matchParamsRef = useRef(matchParams)

  useEffect(() => {
    matchParamsRef.current = matchParams
  })

  const getLastMatchParams = useCallback(() => matchParamsRef.current, [])

  return useMemo(() => {
    return cacheStore.buildActions(rjObject, getLastMatchParams)
  }, [cacheStore, rjObject, getLastMatchParams])
}
