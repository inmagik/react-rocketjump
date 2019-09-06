import { Subject } from 'rxjs'

export const AllRjEventsSubject = new Subject()
export const RjDebugEvents = AllRjEventsSubject.asObservable()
