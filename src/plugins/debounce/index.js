import { empty, timer } from 'rxjs/'
import { distinctUntilChanged, debounce } from 'rxjs/operators'
import rj from '../../rj'

const rjDebounce = (time = 200) =>
  rj({
    actions: ({ run }) => ({
      runDebounced: (...args) => run(...args).withMeta({ debounced: true }),
    }),
    effectPipeline: $s =>
      $s.pipe(
        debounce(action => {
          if (action.meta.debounced) {
            return timer(time)
          } else {
            return empty()
          }
        }),
        distinctUntilChanged((prevAction, currAction) => {
          // Ignore not debounced actions...
          if (!currAction.meta.debounced) {
            return false
          }
          // not same stuff
          if (currAction.type !== prevAction.type) {
            return false
          }
          // cant be the same
          if (
            currAction.payload.params.length !==
            prevAction.payload.params.length
          ) {
            return false
          }
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

export default rjDebounce
