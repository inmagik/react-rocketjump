import { Action } from '../core/types'
import {
  RJ_DISPATCH_EVENT,
  RJ_ERROR_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
} from './events'

export interface DebugInfo {
  /**
   * The optional name of RJ
   */
  name?: string

  /**
   * Component name wrapped (only availbale from connectRj HOC)
   */
  wrappedComponentName?: string
}

export interface DebugEmitter {
  onStateInitialized(state: any): void

  onActionDispatched(action: Action, prevState: any, nextState: any): void

  onError(error: any): void

  onTeardown(): void
}

export interface BaseDebugEvent<T extends string = string, S = any> {
  type: T
  meta: {
    trackId: number
    info: DebugInfo
  }
  payload: S
}

export type InitDebugEvent = BaseDebugEvent<
  typeof RJ_INIT_EVENT,
  { state: any }
>

export type DispatchDebugEvent = BaseDebugEvent<
  typeof RJ_DISPATCH_EVENT,
  {
    action: Action
    prevState: any
    nextState: any
  }
>

export type ErrorDebugEvent = BaseDebugEvent<typeof RJ_ERROR_EVENT, any>

export type TeardownDebugEvent = BaseDebugEvent<typeof RJ_TEARDOWN_EVENT, {}>

export type DebugEvents =
  | InitDebugEvent
  | DispatchDebugEvent
  | ErrorDebugEvent
  | TeardownDebugEvent

export type DebugEventsTypes =
  | typeof RJ_INIT_EVENT
  | typeof RJ_DISPATCH_EVENT
  | typeof RJ_ERROR_EVENT
  | typeof RJ_TEARDOWN_EVENT
