import { Subject } from 'rxjs'
import { publish } from 'rxjs/operators'

// Create a useMiniRedux like subscription util 4 tesing
// only side effecs
const noop = () => {}
export function createTestRJSubscription(
  RjObject,
  subscribeCallback = noop,
  errorCallback = noop,
  ...args
) {
  const subject = new Subject()

  const { makeRxObservable, pipeActionStream } = RjObject
  const fakeActionObservable = pipeActionStream(subject.asObservable()).pipe(
    publish()
  )

  const observable = makeRxObservable(fakeActionObservable, ...args)

  observable.subscribe(subscribeCallback, errorCallback)

  fakeActionObservable.connect()

  return subject
}
