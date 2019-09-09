import { SUCCESS, FAILURE, PENDING } from '../../actionTypes'

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

export default function singleMutation(mutationConfig) {
  return {
    reducer: singleMutationReducer,
    takeEffect: 'exhaust',
    ...mutationConfig,
  }
}
