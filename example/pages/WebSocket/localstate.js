import { INIT, makeEffectAction, rj } from 'react-rocketjump'
import { Observable, of } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

export const RocketWs = rj({
  name: 'RocketWs',

  // NOTE: NO NEED EFFECT FOR THIS EXAMPLE
  effect: () => Promise.resolve(null),

  actions: () => ({
    // EFFECT ACTIONS makeEffectAction is necessary cause we want
    // to emit action in our Observable instead of reducer!
    open: () => makeEffectAction('WS~OPEN'),
    close: () => makeEffectAction('WS~CLOSE'),
    send: (msg) => makeEffectAction('WS~SEND', [msg]),
  }),

  composeReducer: (state, action) => {
    if (action.type === INIT) {
      return {
        ...state,
        isWsOpen: false,
      }
    } else if (action.type === 'WS~MESSAGE') {
      return {
        ...state,
        isWsOpen: Boolean(state.isWsOpen),
        data: (state.data ?? []).concat(action.payload),
      }
    } else if (action.type === 'WS~ON_CLOSE') {
      return {
        ...state,
        isWsOpen: false,
      }
    } else if (action.type === 'WS~ON_OPEN') {
      return {
        ...state,
        isWsOpen: true,
      }
    }
    return {
      ...state,
      isWsOpen: Boolean(state.isWsOpen),
    }
  },

  addSideEffect: (actionObservable) => {
    return actionObservable.pipe(
      // WE FILTER ONLY OPEN / CLOSE TO CREATE NEXT INNER OBSERVABLE
      filter((action) => ['WS~OPEN', 'WS~CLOSE'].includes(action.type)),

      // Ma Men switchMap can close prev ws connect !!!
      switchMap((action) => {
        // Close prev!
        if (action.type === 'WS~CLOSE') {
          // SEND ON CLOSE ACTION TO REDUCER + CLOSE PREV OBSERVABLE
          // THanks 2 switchMap
          return of({
            type: 'WS~ON_CLOSE',
          })
        }
        // Start new observable *.* this emit shit to my reduer until next
        // close!
        return new Observable((subscriber) => {
          // OPEN WS!!!
          const ws = new WebSocket('wss://echo.websocket.org')

          // When ws send a message we emit to our Observable
          // then my old friend Rj Emit them to Reducer
          ws.addEventListener('message', (e) =>
            subscriber.next({
              type: 'WS~MESSAGE',
              payload: e.data,
            })
          )

          ws.addEventListener('open', () =>
            subscriber.next({
              type: 'WS~ON_OPEN',
            })
          )

          // heheeh trycky part, we listen to action observable
          // to grab SEND EVENT! end emit them over ws
          const actionsSub = actionObservable.subscribe((action) => {
            if (action.type === 'WS~SEND') {
              ws.send(action.payload.params[0])
            }
          })

          return () => {
            // Good Bye Space Cowboy!
            // Close ws and action sub
            ws.close()
            actionsSub.unsubscribe()
          }
        })
      })
    )
  },
})
