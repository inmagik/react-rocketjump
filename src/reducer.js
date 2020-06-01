import {
  FAILURE,
  SUCCESS,
  PENDING,
  CLEAN,
  CANCEL,
  UPDATE_DATA,
  HYDRATE,
} from './actionTypes'

// Barebone reducer for handle an async effect

const defaultState = {
  pending: false,
  error: null,
  data: null,
}

export default function reducer(prevState = defaultState, action) {
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
    case HYDRATE:
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
