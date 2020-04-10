import { useEffect } from 'react'
import { filter } from 'rxjs/operators'
import { rj } from '../../index'
import { makeLibraryAction } from 'rocketjump-core'
// (config = {}) => {
//   return rj.pure({
//     actions: () => ({
//       gang: () =>
//         makeLibraryAction('GANG').withMeta({ ignoreDispatch: true }),
//     }),
//   })
// },

export function rjHelloRoutine() {
  function useRoutine(actionObserable, state, selectors, actions) {
    // const data = selectors.getRoot
    //   ? selectors.getData(selectors.getRoot(state))
    //   : selectors.getData(state)
    // console.log('Hello Routine!', data)
    // useEffect(() => {
    //   setTimeout(() => actions.gang(), 1000)
    // }, [actions])
    useEffect(() => {
      // actions.gang()
      const subscription = actionObserable.subscribe(action => {
        console.log('From Routine!', action)
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
  return rj({
    routine: useRoutine,
  })
}

export function rjTimeout(time, cb) {
  function useTimeout(actionObserable, state, selectors, actions) {
    useEffect(() => {
      const id = setInterval(() => cb(actions), time)
      return () => clearInterval(id)
    }, [actions])
  }

  return rj({
    routine: useTimeout,
  })
}
