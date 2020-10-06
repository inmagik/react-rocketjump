import { useState, useCallback } from 'react'
export function useRerender() {
  const [, forceUpdate] = useState(0)
  return useCallback(() => forceUpdate((c) => c + 1), [])
}
