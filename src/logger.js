import {
  RjDebugEvents,
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
} from './debugger/index'

function whereMyRjIsIvoked() {
  const originalStackLimit = Error.stackTraceLimit
  let stack
  Error.stackTraceLimit = Infinity
  try {
    throw new Error()
  } catch (e) {
    stack = e.stack.split('\n')
  }
  Error.stackTraceLimit = originalStackLimit

  const parseStackLine = line => {
    const cleanLine = line.trim()
    if (cleanLine.indexOf('at') === 0) {
      const pieces = cleanLine.split(' ')
      return pieces.slice(1)
    }
    return ['', '']
  }
  stack = stack.slice(1).map(parseStackLine)
  let startedMainHook = false
  for (let i = 0; i < stack.length; i++) {
    const [functionName] = stack[i]
    if (!startedMainHook && functionName === 'useMiniRedux') {
      startedMainHook = true
    } else if (startedMainHook) {
      if (functionName.indexOf('use') !== 0) {
        // First non hook from useMiniRedux
        return `<${functionName} />`
      }
    }
  }

  return ''
}

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
  let whereUsed = {}

  RjDebugEvents.subscribe(event => {
    if (event.type === RJ_INIT_EVENT) {
      whereUsed[event.meta.trackId] = whereMyRjIsIvoked()
      rjLives.push(event.meta.info)
    } else if (event.type === RJ_TEARDOWN_EVENT) {
      const index = rjLives.indexOf(event.meta.info)
      rjLives.splice(index, 1)
      delete whereUsed[event.meta.trackId]
    } else if (event.type === RJ_DISPATCH_EVENT) {
      const { info, trackId } = event.meta
      const index = rjLives.indexOf(info)
      const color = colors[trackId % colors.length]
      const { action, prevState, nextState } = event.payload
      const rjName = info.name || `${index + 1}°`
      const rjUsedFrom = whereUsed[trackId]

      console.groupCollapsed(
        `%c${rjUsedFrom}%c RJ ${rjName} %caction %c${action.type}`,
        'color:#61dafb;background:#20232a;font-family:monospace;',
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
      //   lastRjConfig: info
      // })
      console.groupEnd()
    }
  })
}
