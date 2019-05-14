import React, { useMemo } from 'react'
import { $TYPE_RJ_EXTREA_CONFIG } from './internals'
import ConfigureRjContext from './ConfigureRjContext'

export default function ConfigureRj({
  children,
  reducer,
  composeReducer,
  actions,
  selectors,
  callEffect,
}) {

  const extraConfig = useMemo(() => {
    const injectExtraConfig = {
      reducer,
      composeReducer,
      actions,
      selectors,
      callEffect,
    }
    Object.defineProperty(injectExtraConfig, '__rjtype', { value: $TYPE_RJ_EXTREA_CONFIG })
    return injectExtraConfig
  }, [callEffect, reducer, composeReducer, actions, selectors])

  return (
    <ConfigureRjContext.Provider value={extraConfig}>
      {children}
    </ConfigureRjContext.Provider>
  )
}
