import { SUCCESS, FAILURE, PENDING } from '../../actionTypes'
import immutable from 'object-path-immutable'

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

export default function multi(makeKey, mutationConfig) {
  return {
    reducer: makeMultiMutationReducer(makeKey),
    takeEffect: ['groupByExhaust', action => makeKey(...action.meta.params)],
    ...mutationConfig,
  }
}
