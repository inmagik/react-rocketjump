import rjDevLogger from './logger'

let logger
if (process.env.NODE_ENV === 'production') {
  // Noop logger
  logger = () => {}
} else {
  // Dev logger
  logger = rjDevLogger
}

export default logger
