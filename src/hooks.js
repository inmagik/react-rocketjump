import { useRef } from 'react'

// Thanks 2 ma man @Andarist
// https://github.com/Andarist/use-constant
export function useConstant(fn) {
  const ref = useRef()

  if (!ref.current) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}
