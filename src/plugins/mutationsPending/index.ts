import { rjPlugin, matchMutationType } from '../../index'
import { PENDING, SUCCESS, FAILURE } from '../../core/actions/actionTypes'
import { Action } from '../../core/types'

function makeMutationsPendingReducer(trackTypes: string | string[]) {
  return (state = 0, action: Action) => {
    if (matchMutationType(action.type, trackTypes, PENDING)) {
      return state + 1
    }
    if (matchMutationType(action.type, trackTypes, [SUCCESS, FAILURE])) {
      return state - 1
    }
    return state
  }
}

const rjMutationsPending = (track?: string | string[]) =>
  rjPlugin({
    combineReducers: {
      mutationsPending: makeMutationsPendingReducer(track ?? '*'),
    },
    selectors: () => ({
      anyMutationPending: (state) => state.mutationsPending > 0,
    }),
  })

export default rjMutationsPending
