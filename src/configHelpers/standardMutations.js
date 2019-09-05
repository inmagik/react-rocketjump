import { SUCCESS, FAILURE, PENDING } from '../actionTypes'
import immutable from 'object-path-immutable'

function singleMutationReducer(
  state = { pending: false, error: null },
  action
) {
  switch (action.type) {
    case PENDING:
      return {
        ...state,
        error: null,
        pending: true,
      }
    case FAILURE:
      return {
        ...state,
        error: action.payload,
        pending: false,
      }
    case SUCCESS:
      return {
        ...state,
        pending: false,
      }
    default:
      return state
  }
}

export const single = mutation => ({
  reducer: singleMutationReducer,
  takeEffect: 'exhaust',
  ...mutation,
})

function makeMultiMutationReducer(makeKey) {
  return (state = { pendings: {}, errors: {} }, action) => {
    switch (action.type) {
      case PENDING: {
        const key = makeKey(...action.meta.params)
        return {
          errors: immutable.del(state.errors, key),
          pendings: {
            ...state.pendings,
            [key]: true,
          },
        }
      }
      case FAILURE: {
        const key = makeKey(...action.meta.params)
        return {
          errors: {
            ...state.errors,
            [key]: action.payload.params,
          },
          pendings: immutable.del(state.pendings, key),
        }
      }
      case SUCCESS: {
        const key = makeKey(...action.meta.params)
        return {
          ...state,
          pendings: immutable.del(state.pendings, key),
        }
      }
      default:
        return state
    }
  }
}

export const multi = (makeKey, mutation) => ({
  reducer: makeMultiMutationReducer(makeKey),
  takeEffect: ['groupByExhaust', action => makeKey(...action.meta.params)],
  ...mutation,
})
