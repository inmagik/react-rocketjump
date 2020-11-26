import { SUCCESS, FAILURE, PENDING } from '../../actions/actionTypes'
import { Mutation, MutationAction, MutationReducer } from '../../types'

export interface SingleMutationState {
  pending: boolean
  error: any
}

function singleMutationReducer(
  state = { pending: false, error: null },
  action: MutationAction
): SingleMutationState {
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

export default function singleMutation<M extends Mutation>(
  mutationConfig: M
): Mutation<
  MutationReducer<SingleMutationState>,
  M extends Mutation<any, infer H> ? H : any,
  M extends Mutation<any, any, infer H> ? H : any
> {
  return {
    reducer: singleMutationReducer,
    takeEffect: 'exhaust',
    ...mutationConfig,
  }
}
