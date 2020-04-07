import { useEffect } from 'react'
import { filter } from 'rxjs/operators'
import { rj } from '../../index'
import { makeLibraryAction } from 'rocketjump-core'

function makeRoutine() {
  return function useRoutine(actionObserable, state, selectors, actions) {
    const data = selectors.getRoot
      ? selectors.getData(selectors.getRoot(state))
      : selectors.getData(state)
    console.log('Hello Routine!', data)
    useEffect(() => {
      setTimeout(() => actions.gang(), 1000)
    }, [actions])
    useEffect(() => {
      // actions.gang()
      const subscription = actionObserable.subscribe(action => {
        console.log('XXX', action)
      })
      // const id = setInterval(() => {
      //   // actions.addStupidTodo({
      //   //   title: 'ROUTINE ROULES',
      //   //   done: true,
      //   // })
      //   console.log('Routine On Mount!')
      // }, 1000)
      return () => {
        subscription.unsubscribe()
        // clearInterval(id)
      }
    }, [selectors, actionObserable, actions])
  }
}

rj({
  routine: function useLoop(actionObserable) {
    useEffect(() => {}, [])
  },
})
const rjWithRoutines = rj.plugin(
  (config = {}) => {
    return rj.pure({
      actions: () => ({
        gang: () =>
          makeLibraryAction('GANG').withMeta({ ignoreDispatch: true }),
      }),
    })
  },
  {
    name: 'RjWithRoutines',
    // makeExport: (runConfig, rjConfig, extendExport) => {},
    // hackExportBeforeFinalize: endExport => {},
    finalizeExport: (finalExport, runConfig, finalConfig) => {
      return {
        ...finalExport,
        routine: makeRoutine(),
      }
    },
  }
)

export default rjWithRoutines
