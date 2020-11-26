import { RUN, CLEAN, CANCEL, UPDATE_DATA } from './actionTypes'
import { makeEffectAction } from './effectAction'
import { RjBaseActionCreators } from '../types'

function run(...params: unknown[]) {
  return makeEffectAction(RUN, params)
}

function clean(...params: unknown[]) {
  return makeEffectAction(CLEAN, params)
}

function cancel(...params: unknown[]) {
  return makeEffectAction(CANCEL, params)
}

const updateData = <S = any>(
  data: S
): { type: typeof UPDATE_DATA; payload: S } => ({
  type: UPDATE_DATA,
  payload: data,
})

const ActionCreators: RjBaseActionCreators = {
  run,
  clean,
  cancel,
  updateData,
}

export default ActionCreators
