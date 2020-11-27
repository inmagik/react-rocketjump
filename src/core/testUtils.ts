import { Subject, of, ConnectableObservable } from 'rxjs'
import { publish } from 'rxjs/operators'
import { isEffectAction } from './actions/effectAction'
import { Action, EffectAction, RjObject, StateObservable } from './types'

// Create a useMiniRedux like subscription util 4 tesing
// only side effecs
const noop = (a: any) => {}
export function createTestRJSubscription(
  rjObject: RjObject,
  subscribeCallback = noop,
  errorCallback = noop
) {
  const subject = new Subject<EffectAction>()

  const fakeStateObservable = of({
    root: {},
  }) as StateObservable<any>
  fakeStateObservable.value = {}

  const { makeObservable, pipeActionStream } = rjObject
  const fakeActionObservable = pipeActionStream(
    subject.asObservable(),
    fakeStateObservable
  ).pipe(publish()) as ConnectableObservable<EffectAction>

  const observable = makeObservable(fakeActionObservable, fakeStateObservable)

  observable.subscribe(subscribeCallback, errorCallback)

  fakeActionObservable.connect()

  return subject
}

export function createTestRjEffectDispatcher(
  rjObject: RjObject,
  subscribeCallback = noop,
  errorCallback = noop
) {
  const subject = createTestRJSubscription(
    rjObject,
    subscribeCallback,
    errorCallback
  )
  const dispatch = (action: Action | EffectAction) => {
    if (isEffectAction(action)) {
      subject.next(action)
    }
  }
  return dispatch
}
