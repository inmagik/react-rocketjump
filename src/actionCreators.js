import { RUN, CLEAN, CANCEL, UPDATE_DATA } from './actionTypes'
import { makeLibraryAction } from 'rocketjump-core'

function run(...params) {
  return makeLibraryAction(RUN, ...params)
}

// TODO params really make sense for clean?
function clean(...params) {
  return makeLibraryAction(CLEAN, ...params)
}

// TODO params really make sense for cancel?
function cancel(...params) {
  return makeLibraryAction(CANCEL, ...params)
}

const updateData = data => ({
  type: UPDATE_DATA,
  payload: data,
})

const ActionCreators = {
  run,
  clean,
  cancel,
  updateData,
}

export default ActionCreators
