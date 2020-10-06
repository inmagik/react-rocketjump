import { useContext } from 'react'
import CacheStoreContext from './context'

export default function useCacheStore() {
  const cacheStore = useContext(CacheStoreContext)
  return cacheStore
}
