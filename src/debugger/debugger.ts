import { Subject } from 'rxjs'
import { DebugEvents } from './types'

export const AllRjEventsSubject = new Subject<DebugEvents>()
export const RjDebugEvents = AllRjEventsSubject.asObservable()
