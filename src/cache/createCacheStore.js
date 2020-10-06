import createBucket from './createBucket'
import { createBucketMatchPredicate } from './utils'
import { isObjectRj } from '../../../types'
import createMultiActions from './createMultiActions'

export default function createCacheStore() {
  const cacheStore = {
    // Lazy observable map of actions subjects ..
    actionsMap: new Map(),
    // Map of living buckets
    buckets: new Map(),
  }

  cacheStore.onEachBucket = (rjObject, params, cb) => {
    let matchPredicate
    if (isObjectRj(rjObject)) {
      matchPredicate = createBucketMatchPredicate(rjObject, params)
    }
    cacheStore.buckets.forEach((bucket) => {
      if (matchPredicate && matchPredicate(bucket)) {
        cb(bucket)
      }
    })
  }

  cacheStore.getBuckets = (rjObject, params) => {
    const bucketsList = []
    cacheStore.onEachBucket((bucket) => bucketsList.push(bucket))
    return bucketsList
  }

  cacheStore.getBucket = (rjObject, params) => {
    const key = rjObject.cache.makeKey(params)
    return cacheStore.buckets.get(key)
  }

  cacheStore.buildBucket = (rjObject, params) => {
    const key = rjObject.cache.makeKey(params)
    if (cacheStore.buckets.has(key)) {
      return cacheStore.buckets.get(key)
    }
    const bucket = createBucket(cacheStore, rjObject, params, key)
    cacheStore.buckets.set(key, bucket)
    return bucket
  }

  cacheStore.prefetch = (rjObject, params) => {
    const bucket = cacheStore.buildBucket(rjObject, params)
    bucket.run()
  }

  cacheStore.invalidate = (rjObject, matchParams) => {
    cacheStore.onEachBucket(rjObject, matchParams, (bucket) => {
      if (bucket.instances.size === 0) {
        // TODO: Write better... add config options and so on ...
        cacheStore.buckets.delete(bucket.key)
      } else {
        bucket.run()
      }
    })
  }

  cacheStore.buildActions = (rjObject, getMatchParams) => {
    return createMultiActions(cacheStore, rjObject, getMatchParams)
  }

  return cacheStore
}
