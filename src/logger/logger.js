import {
  RjDebugEvents,
  RJ_DISPATCH_EVENT,
  RJ_INIT_EVENT,
  RJ_TEARDOWN_EVENT,
  RJ_ERROR_EVENT,
} from '../debugger/index'

function whereMyRjIsIvoked(wrappedComponentName) {
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
  const rjHooks = ['useRj', 'useRunRj']
  let hooks = []
  let rjFn = ''

  // console.log(stack)
  for (let i = 0; i < stack.length; i++) {
    const [functionName] = stack[i]
    // console.log(functionName)
    if (!startedMainHook && functionName === 'useMiniRedux') {
      startedMainHook = true
    } else if (startedMainHook) {
      if (rjHooks.indexOf(functionName) !== -1) {
        rjFn = functionName
      } else if (functionName.indexOf('use') === 0) {
        hooks.push(functionName)
      } else {
        // connectRj
        if (wrappedComponentName) {
          return {
            component: `<${wrappedComponentName} />`,
            hooks,
            rjFn: 'connectRj',
          }
        }
        // First non hook from useMiniRedux
        return { component: `<${functionName} />`, hooks, rjFn }
      }
    }
  }

  return { component: '', hooks, rjFn }
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
      whereUsed[event.meta.trackId] = whereMyRjIsIvoked(
        event.meta.info.wrappedComponentName
      )
      rjLives.push(event.meta.info)
    } else if (event.type === RJ_TEARDOWN_EVENT) {
      const index = rjLives.indexOf(event.meta.info)
      rjLives.splice(index, 1)
      delete whereUsed[event.meta.trackId]
    } else if (event.type === RJ_DISPATCH_EVENT) {
      const { info, trackId } = event.meta
      const index = rjLives.indexOf(info)
      const location = whereUsed[trackId]

      const rjName = info.name || `${index + 1}°`
      const { component, rjFn, hooks } = location
      const componentLocation = `%c${component}%c${hooks
        .map(h => `  ${h}()`)
        .reverse()
        .join('')}  ${rjFn}(${rjName})`

      const color = colors[trackId % colors.length]
      const { action, prevState, nextState } = event.payload

      console.log(
        `${componentLocation}  %caction %c${action.type}`,
        'color: #80338a;font-weight:normal',
        `color:${color};font-weight:normal`,
        'color:grey;font-weight:lighter;',
        'color:#464646;'
      )
      // console.log(`%cprev state`, 'color: grey;font-weight:normal;', prevState)
      // console.log(
      //   `%caction ${pad(4)}`,
      //   'color:deepskyblue;font-weight:normal;',
      //   action
      // )
      // console.log(`%cnext state`, 'color: green;font-weight:normal;', nextState)
      // console.log(`%c_rj ${pad(7)}`, 'color: grey', {
      //   debugTrackId: trackId,
      //   lastRjConfig: info
      // })
      // console.groupEnd()
    } else if (event.type === RJ_ERROR_EVENT) {
      const { info, trackId } = event.meta
      const index = rjLives.indexOf(info)
      const location = whereUsed[trackId]

      const rjName = info.name || `${index + 1}°`
      const { component, rjFn, hooks } = location
      const componentLocation = `${component}${hooks.map(
        h => `  ${h}()`
      )}  ${rjFn}(${rjName})`

      const error = event.payload

      console.error(`[react-rocketjump] in ${componentLocation}\n  ${error}`)
    }
  })
}
