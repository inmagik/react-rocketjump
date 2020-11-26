import { SUCCESS, FAILURE, PENDING } from '../../actions/actionTypes'
import { Mutation, MutationAction, MutationReducer } from '../../types'
import { del } from 'object-path-immutable'

type KeyMaker = (...a: any[]) => any

export interface MultiMutationState {
  errors: Record<string, any>
  pendings: Record<string, boolean>
}

function makeMultiMutationReducer(makeKey: KeyMaker) {
  return (
    state = { pendings: {}, errors: {} },
    action: MutationAction
  ): MultiMutationState => {
    switch (action.type) {
      case PENDING: {
        const key = makeKey(...action.meta.params)
        return {
          errors: del(state.errors, key),
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
            [key]: action.payload,
          },
          pendings: del(state.pendings, key),
        }
      }
      case SUCCESS: {
        const key = makeKey(...action.meta.params)
        return {
          ...state,
          pendings: del(state.pendings, key),
        }
      }
      default:
        return state
    }
  }
}

export default function multi<M extends Mutation>(
  makeKey: KeyMaker,
  mutationConfig: M
): Mutation<
  MutationReducer<MultiMutationState>,
  M extends Mutation<any, infer H> ? H : any,
  M extends Mutation<any, any, infer H> ? H : any
> {
  return {
    reducer: makeMultiMutationReducer(makeKey),
    takeEffect: ['groupByExhaust', (action) => makeKey(...action.meta.params)],
    ...mutationConfig,
  }
}
