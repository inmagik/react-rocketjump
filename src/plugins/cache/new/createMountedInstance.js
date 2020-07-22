import { skip, distinctUntilChanged } from 'rxjs/operators'

export default function createMountedInstance(bucket, cb) {
  const mountedInstance = {}

  const stateSub = bucket.stateObservable
    .pipe(skip(1), distinctUntilChanged())
    .subscribe(cb)

  let cacheRunId = null

  mountedInstance.refreshInstance = () => {
    if (bucket.instances.size === 1) {
      if (!bucket.wasSuspended) {
        cacheRunId = bucket.run()
      } else {
        bucket.wasSuspended = false
      }
    }
  }

  mountedInstance.clear = () => {
    // console.log('Goodbye instance', mountedInstance)
    // effectSub.unsubscribe()
    stateSub.unsubscribe()
    bucket.instances.delete(mountedInstance)
    if (bucket.instances.size === 0) {
      // If bucket ongoing run is from current rj instance cancel them ...
      if (cacheRunId !== null && bucket.ongoingRun === cacheRunId) {
        bucket.actions.cancel()
      }
      bucket.scheduleGC()
    }
  }

  return mountedInstance
}
