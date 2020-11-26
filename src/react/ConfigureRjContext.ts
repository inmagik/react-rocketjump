import React from 'react'
import { EffectCallerFn } from '../core/types'

interface ConfigureRjType {
  effectCaller: EffectCallerFn
}

const ConfigureRjContext = React.createContext<ConfigureRjType | null>(null)
export default ConfigureRjContext
