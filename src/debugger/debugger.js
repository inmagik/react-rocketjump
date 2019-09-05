import { ReplaySubject } from 'rxjs'

export const AllRjEventsSubject = new ReplaySubject()
export const RjDebugEvents = AllRjEventsSubject.asObservable()
