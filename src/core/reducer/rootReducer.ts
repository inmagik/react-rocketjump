import {
  FAILURE,
  SUCCESS,
  PENDING,
  CLEAN,
  CANCEL,
  UPDATE_DATA,
} from '../actions/actionTypes'
import { AllActions, RjStateRootShape } from '../types'

// Barebone reducer for handle an async effect

const defaultState: RjStateRootShape = {
  pending: false,
  error: null,
  data: null,
}

export default function rootReducer(
  prevState = defaultState,
  action: AllActions
): RjStateRootShape {
  const { type } = action
  switch (type) {
    case PENDING:
      return {
        ...prevState,
        error: null,
        pending: true,
      }
    case FAILURE:
      return {
        ...prevState,
        pending: false,
        error: action.payload,
      }
    case SUCCESS:
      return {
        ...prevState,
        pending: false,
        data: action.payload.data,
      }
    case CANCEL:
      return {
        ...prevState,
        pending: false,
      }
    case CLEAN:
      // So easy if someone add some shit to state
      // simply preserve that keys!
      return { ...prevState, ...defaultState }
    case UPDATE_DATA:
      return {
        ...prevState,
        data: action.payload,
      }
    default:
      return prevState
  }
}
