import { HackableEffectAction, Action, ActionMeta } from '../types'

/**
 * Check if is an effect action
 */
export const isEffectAction = (
  action: Action
): action is HackableEffectAction => {
  return action['@@RJ/EFFECT'] === true
}

/**
 * Creates a new library action
 * A library action is a predefined action that can be handled in the context of rocketjump side effect model
 * Such actions are wired into the library and are extremely general: customization with the `actions` directive
 * is provided in order to adapt them (and their interface and behaviour) to user needs
 */
export function makeEffectAction<
  T extends string = string,
  M extends ActionMeta = ActionMeta
>(
  type: T,
  params: Array<unknown> = [],
  meta: M = {} as M
): HackableEffectAction<T, M> {
  const effectAction: HackableEffectAction<T, M> = {
    type,
    payload: {
      params,
    },
    meta,
    callbacks: {
      onSuccess: undefined,
      onFailure: undefined,
    },
    /**
     * This function allows to inject some extra params in a library action
     * It is a delicate operation, since it works by constructing a new action object
     * and rebinding the operations (extends and withMeta) to it
     */
    extend(this, extensions) {
      const nextAction = {
        ...this,
        meta: {
          ...this.meta,
          ...extensions.meta,
        },
        callbacks: {
          onSuccess: extensions.callbacks && extensions.callbacks.onSuccess,
          onFailure: extensions.callbacks && extensions.callbacks.onFailure,
        },
      }
      Object.defineProperty(nextAction, '@@RJ/EFFECT', { value: true })
      return nextAction
    },
    /**
     * Powerful helper to work with metadata
     * Its arg can either be a plain object, in which case it is merged in , or a function, in which
     *  case meta is hard set to the return value of the function
     */
    withMeta(this, meta) {
      const nextAction = {
        ...this,
        meta:
          typeof meta === 'function'
            ? meta(this.meta)
            : { ...this.meta, ...meta },
      }
      Object.defineProperty(nextAction, '@@RJ/EFFECT', { value: true })
      return nextAction
    },
  }
  Object.defineProperty(effectAction, '@@RJ/EFFECT', { value: true })
  return effectAction
}
