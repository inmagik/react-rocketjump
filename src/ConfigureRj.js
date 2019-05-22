import React, { useMemo } from 'react'
import ConfigureRjContext from './ConfigureRjContext'

export default function ConfigureRj({ children, effectCaller }) {
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
