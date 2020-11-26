import rjDevLogger from './logger'

let logger: () => void
if (process.env.NODE_ENV === 'production') {
  // Noop logger
  logger = () => {}
} else {
  // Dev logger
  logger = rjDevLogger
}

export default logger
