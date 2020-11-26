import { merge, Observable } from 'rxjs'
import { arrayze } from '../utils'
import { isRjConfiguredCaller } from '../typeUtils'
import takeEffectsHanlders from './takeEffects'
import {
  EffectFn,
  EffectCallerFn,
  RjEffectCaller,
  HookEffectAction,
  TakeEffectHanlder,
  MakeRjObservable,
  CreateEffectConfig,
  StateObservable,
} from '../types'

// Thanks ma teacher Virgy <3 * GUARDA MAMMA CON I TIPI!!! *
function composeEffectCallers(callers: EffectCallerFn[]): EffectCallerFn {
  return function effectCaller(effectCall: EffectFn, ...args: any[]) {
    function recursion(callers: EffectCallerFn[], ...args: any[]): any {
      const [effectCaller, ...passCallers] = callers

      if (passCallers.length === 0) {
        return effectCaller(effectCall, ...args)
      }

      return effectCaller((...args) => recursion(passCallers, ...args), ...args)
    }
    return recursion(callers, ...args)
  }
}

const defaultEffectCaller: EffectCallerFn = (call, ...args) => call(...args)

function makeRunTimeEffectCaller(
  effectCallers: RjEffectCaller[],
  injectEffectCaller?: EffectCallerFn
): EffectCallerFn {
  const realCallers = effectCallers.reduce((all, caller) => {
    if (isRjConfiguredCaller(caller)) {
      if (injectEffectCaller) {
        all.push(injectEffectCaller)
      }
    } else {
      all.push(caller)
    }
    return all
  }, [] as EffectCallerFn[])

  if (realCallers.length === 0) {
    return defaultEffectCaller
  }

  if (realCallers.length === 1) {
    return realCallers[0]
  }

  return composeEffectCallers(realCallers)
}

export default function createMakeObservable(
  { effect: effectCall, effectCallers, takeEffect }: CreateEffectConfig,
  prefix = ''
): MakeRjObservable {
  return function makeObservable(
    actionObservable: Observable<HookEffectAction>,
    stateObservable: StateObservable
  ) {
    // Make run time caller from effect action
    function getEffectCaller(action: HookEffectAction) {
      return makeRunTimeEffectCaller(
        effectCallers, // Defined in rocketjump config
        action.__rjEffectRef?.current?.effectCaller // Run time effect caller
      )
    }

    let handleTakeEffect: TakeEffectHanlder

    const [effectType, ...effectTypeArgs] = arrayze(takeEffect)

    if (typeof effectType === 'function') {
      handleTakeEffect = effectType
    } else {
      // Check valid effectType in DEV
      if (process.env.NODE_ENV !== 'production') {
        if (takeEffectsHanlders[effectType] === undefined) {
          throw new Error(
            `[react-rocketjump] takeEffect: ${takeEffect} is an invalid effect.`
          )
        }
      }
      handleTakeEffect = takeEffectsHanlders[effectType]
    }

    return handleTakeEffect(
      actionObservable,
      stateObservable,
      {
        effect: effectCall,
        getEffectCaller,
        prefix,
      },
      ...effectTypeArgs
    )
  }
}

// GioVa nel posto fa freddo brrrrrrrrrrrrr
export function mergeMakeObservables(
  baseCreator: MakeRjObservable,
  ...creators: MakeRjObservable[]
): MakeRjObservable {
  return (actionObservable, stateObservable) => {
    const baseDispatchObservable = baseCreator(
      actionObservable,
      stateObservable
    )

    const dispatchObservables2Merge = creators.reduce(
      (dispatchObservables, rxCreator) => {
        const nextDispatchObservable = rxCreator(
          actionObservable,
          stateObservable
        )
        dispatchObservables.push(nextDispatchObservable)
        return dispatchObservables
      },
      [baseDispatchObservable]
    )

    return merge(...dispatchObservables2Merge)
  }
}
