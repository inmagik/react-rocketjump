import React, { useMemo } from 'react'
import { EffectCallerFn } from '../core/types'
import ConfigureRjContext from './ConfigureRjContext'

export default function ConfigureRj({
  children,
  effectCaller,
}: {
  children: React.ReactNode
  effectCaller: EffectCallerFn
}) {
  const extraConfig = useMemo(
    () => ({
      effectCaller,
    }),
    [effectCaller]
  )

  return (
    <ConfigureRjContext.Provider value={extraConfig}>
      {children}
    </ConfigureRjContext.Provider>
  )
}
