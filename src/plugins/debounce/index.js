import { empty, timer } from 'rxjs'
import { distinctUntilChanged, debounce, scan } from 'rxjs/operators'
import { RUN } from '../../actionTypes'
import rj from '../../rj'

const defaultOptions = {
  time: 180,
}
const rjDebounce = (optionsOrTime = defaultOptions) => {
  let options
  if (typeof optionsOrTime === 'number' && isFinite(optionsOrTime)) {
    options = { time: optionsOrTime }
  } else {
    options = { ...defaultOptions, ...optionsOrTime }
  }

  return rj({
    actions: ({ run }) => ({
      runDebounced: (...args) =>
        run(...args).withMeta({
          debounced: true,
        }),
    }),
    effectPipeline: (action$) =>
      action$.pipe(
        scan((prev, current) => {
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
        }, null),
        debounce((action) => {
          if (action.type === RUN && action.meta.debounced) {
            return timer(options.time)
          } else {
            return empty()
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
