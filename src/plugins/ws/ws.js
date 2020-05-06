import { Observable, empty } from 'rxjs'
import { switchMap, map, filter, distinctUntilChanged } from 'rxjs/operators'
import { makeLibraryAction as makeAction } from 'rocketjump-core'
import { rj } from '../../index'

export default function rjWs(wsConfigArg = {}) {
  const wsConfig = {
    ...{
      // Defaults

      WsClass: WebSocket,

      json: false,
    },
    ...wsConfigArg,
  }

  function wsRoutine(actionObx, stateObx, { getRootState }) {
    return stateObx.pipe(
      // Build url from state observable
      map((state) => {
        // Ws Url from ROOT State
        if (typeof wsConfig.url === 'function') {
          return wsConfig.url(getRootState(state))
        }
        // Just a static string
        return wsConfig.url
      }),
      // Open / Close a connection when url changes
      distinctUntilChanged(),
      // switchMap kill next observable on new parent emitted value
      // (close prev connection when new url is given)
      switchMap((wsUrl) => {
        // Nothing to do / prev Observable will terminate
        if (wsUrl === null) {
          return empty()
        }
        // Observe the world
        return new Observable((subscriber) => {
          // Create ws with given WsClass (Default a simple WebSocket)
          const ws = new wsConfig.WsClass(wsUrl)

          // Should handle message?
          if (wsConfig.onMessage) {
            ws.addEventListener('message', (e) => {
              let payload = e.data
              // Use JSON?
              if (wsConfig.json === true) {
                payload = JSON.parse(e.data)
              }
              // Dispatch on reducer
              subscriber.next({
                type: '@WS/MESSAGE',
                payload,
              })
            })
          }

          // Should handle open?
          if (wsConfig.onOpen) {
            ws.addEventListener('open', () => {
              // Dispatch on reducer
              subscriber.next({ type: '@WS/OPEN' })
            })
          }

          // Should handle close?
          if (wsConfig.onClose) {
            ws.addEventListener('close', () => {
              // Dispatch on reducer
              subscriber.next({ type: '@WS/CLOSE' })
            })
          }

          // Listen to effect action
          const actionSub = actionObx
            // Only our actions are important
            .pipe(filter((action) => action.type === '@WS/SEND'))
            .subscribe((action) => {
              let sendData = action.payload.params[0]
              // Use JSON?
              if (wsConfig.json) {
                sendData = JSON.stringify(sendData)
              }
              ws.send(sendData)
            })

          return () => {
            // Good Bye Space Cowboy
            actionSub.unsubscribe()
            ws.close()
          }
        })
      })
    )
  }

  return rj({
    routine: wsRoutine,

    composeReducer: (state, action) => {
      // Update the state in response to a WS Message
      if (action.type === '@WS/MESSAGE' && wsConfig.onMessage) {
        return wsConfig.onMessage(state, action.payload)
      }

      // Update the state in response to a WS OPEN
      if (action.type === '@WS/OPEN' && wsConfig.onOpen) {
        return wsConfig.onOpen(state)
      }

      // Update the state in response to a WS CLOSE
      if (action.type === '@WS/CLOSE' && wsConfig.onClose) {
        return wsConfig.onClose(state)
      }

      return state
    },

    actions: () => ({
      wsSend: (data) =>
        makeAction('@WS/SEND', data).withMeta({
          // We only need @WS/SEND action in RX context
          // no need to dispatch them and cause an entra render
          ignoreDispatch: true,
        }),
    }),
  })
}
