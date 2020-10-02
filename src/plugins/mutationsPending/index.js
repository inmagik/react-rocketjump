import { rj, matchMutationType } from '../../index'
import { PENDING, SUCCESS, FAILURE } from '../../actionTypes'

function makeMutationsPendingReducer(trackTypes) {
  return (state = 0, action) => {
    if (matchMutationType(action.type, trackTypes, PENDING)) {
      return state + 1
    }
    if (matchMutationType(action.type, trackTypes, [SUCCESS, FAILURE])) {
      return state - 1
    }
    return state
  }
}

const rjMutationsPending = (config = {}) =>
  rj({
    combineReducers: {
      mutationsPending: makeMutationsPendingReducer(config.track ?? '*'),
    },
    selectors: () => ({
      anyMutationPending: state => state.mutationsPending > 0,
    }),
  })

export default rjMutationsPending
