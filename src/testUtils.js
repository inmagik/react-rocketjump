import { Subject, of } from 'rxjs'
import { publish } from 'rxjs/operators'

// Create a useMiniRedux like subscription util 4 tesing
// only side effecs
const noop = () => {}
export function createTestRJSubscription(
  RjObject,
  subscribeCallback = noop,
  errorCallback = noop
) {
  const subject = new Subject()

  const { makeRxObservable, pipeActionStream } = RjObject
  const fakeActionObservable = pipeActionStream(subject.asObservable()).pipe(
    publish()
  )

  const fakeStateObservable = of({
    root: {},
  })
  const observable = makeRxObservable(fakeActionObservable, fakeStateObservable)

  observable.subscribe(subscribeCallback, errorCallback)

  fakeActionObservable.connect()

  return subject
}
