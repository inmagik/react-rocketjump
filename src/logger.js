import {
  RjDebugEvents,
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
} from './debugger/index'

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const colors = Array.apply(null, { length: 100 }).map(getRandomColor)

const pad = n => Array.apply(null, { length: n }).join(' ')

export default function rjLogger() {
  let rjLives = []

  RjDebugEvents.subscribe(event => {
    if (event.type === RJ_INIT_EVENT) {
      rjLives.push(event.payload.info)
    } else if (event.type === RJ_TEARDOWN_EVENT) {
      const index = rjLives.indexOf(event.payload.info)
      rjLives.splice(index, 1)
      // rjLives.push(event.info)
    } else if (event.type === RJ_DISPATCH_EVENT) {
      const index = rjLives.indexOf(event.payload.info)
      // console.log(rjLives)
      const { trackId } = event
      const color = colors[trackId % colors.length]
      const { action, prevState, nextState, info } = event.payload
      const rjName = info.name || `${index + 1}°`
      console.groupCollapsed(
        `%cRJ ${rjName} %caction %c${action.type}`,
        `color:${color}`,
        'color:grey;font-weight:lighter;',
        'color:#464646;'
      )
      console.log(`%cprev state`, 'color: grey;font-weight:bold;', prevState)
      console.log(
        `%caction ${pad(4)}`,
        'color:deepskyblue;font-weight:bold;',
        action
      )
      console.log(`%cnext state`, 'color: green;font-weight:bold;', nextState)
      // console.log(`%c_rj ${pad(7)}`, 'color: grey', {
      //   debugTrackId: trackId,
      //   lastRjConfig: event.payload.info,
      // })
      console.groupEnd()
    }
  })
}
