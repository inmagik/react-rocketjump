import { EMPTY, OperatorFunction, timer } from 'rxjs'
import { rjPlugin, RUN } from '../..'
import { distinctUntilChanged, debounce, scan } from 'rxjs/operators'
import { EffectAction } from '../../core/types'

type RjPluginDebounceOptionsObj = {
  time?: number
  when?: (...args: any[]) => boolean
}

type RjPluginDebounceOptions = RjPluginDebounceOptionsObj | number

const defaultOptions = {
  time: 180,
}
const rjDebounce = (
  optionsOrTime: RjPluginDebounceOptions = defaultOptions
) => {
  let options: RjPluginDebounceOptionsObj
  if (typeof optionsOrTime === 'number' && isFinite(optionsOrTime)) {
    options = { time: optionsOrTime }
  } else {
    options = {
      ...defaultOptions,
      ...(optionsOrTime as RjPluginDebounceOptionsObj),
    }
  }

  return rjPlugin({
    actions: ({ run }) => ({
      runDebounced: (...args) =>
        run(...args).withMeta({
          debounced: true,
        }),
    }),
    effectPipeline: (actionObservable) =>
      actionObservable.pipe(
        scan<EffectAction, EffectAction | null>(
          (prev, current): EffectAction => {
            // Shoud debounce ma run?
            if (
              current.type === RUN &&
              current.meta &&
              current.meta.debounced &&
              typeof options.when === 'function'
            ) {
              const shouldDebounce = options.when(
                prev ? prev.payload.params : null,
                current.payload.params
              )
              const newMeta = { ...current.meta }
              if (shouldDebounce) {
                newMeta.debounced = true
              } else {
                newMeta.debounced = false
              }
              return {
                ...current,
                meta: newMeta,
              }
            }
            return current
          },
          null
        ) as OperatorFunction<EffectAction, EffectAction>,
        // The scan signature T
        debounce((action) => {
          if (action.type === RUN && action.meta.debounced) {
            return timer(options.time)
          } else {
            return EMPTY
          }
        }),
        distinctUntilChanged((prevAction, currAction) => {
          // not same stuff
          if (currAction.type !== prevAction.type) {
            return false
          }
          // Ignore not debounced actions...
          if (currAction.type !== RUN || !currAction.meta.debounced) {
            return false
          }
          // cant be the same
          if (
            currAction.payload.params.length !==
            prevAction.payload.params.length
          ) {
            return false
          }
          // TODO: Maybe deep compare at 1 level depth of plain objects
          // compare params
          for (let i = 0; i < currAction.payload.params.length; i++) {
            if (currAction.payload.params[i] !== prevAction.payload.params[i]) {
              return false
            }
          }
          // the same action =)
          return true
        })
      ),
  })
}

export default rjDebounce
