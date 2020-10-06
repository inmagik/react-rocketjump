import { createContext } from 'react'
import globalCacheStore from '../store'

const CacheStoreContext = createContext(globalCacheStore)
export default CacheStoreContext
