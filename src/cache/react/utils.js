import { useState, useCallback } from 'react'
export function useRerender() {
  const [, forceUpdate] = useState({})
  return useCallback(() => forceUpdate({}), [])
}
