import rj from '../../rj'
import { INIT, SUCCESS, FAILURE, PENDING } from '../../actionTypes'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations reducers', () => {
  it('should be generated only when reducer key is present', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: () => {},
        },
        fuckSnitch: {
          effect: () => {},
          updater: () => {},
        },
      },
      effect: () => {},
    })

    let state = MaRjState.reducer(undefined, { INIT })
    expect(state).toEqual({
      pending: false,
      error: null,
      data: null,
    })
  })
  it('should be match the mutation key and be decoupled to related mutation', async () => {
    const mockReducer = jest.fn(() => ({
      giova: 23,
    }))
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: () => {},
          reducer: mockReducer,
        },
        fuckSnitch: {
          effect: () => {},
          updater: () => {},
        },
      },
      effect: () => {},
    })

    const { reducer } = MaRjState
    let state = reducer(undefined, { type: INIT })
    expect(mockReducer).toHaveBeenCalledTimes(1)
    expect(mockReducer).toHaveBeenNthCalledWith(1, undefined, { type: INIT })
    expect(state.mutations).toEqual({
      killHumans: { giova: 23 },
    })
    state = reducer(state, { type: 'KUAKAMOLE' })
    state = reducer(state, { type: SUCCESS, payload: {} })
    state = reducer(state, { type: PENDING })
    state = reducer(state, { type: FAILURE })
    state = reducer(state, { type: `${MUTATION_PREFIX}/xxx/${FAILURE}` })
    expect(mockReducer).toHaveBeenCalledTimes(1)
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/killHumans/${SUCCESS}`,
      payload: { data: 23 },
      meta: { params: ['GioVa'] },
    })
    expect(mockReducer).toHaveBeenCalledTimes(2)
    expect(mockReducer).toHaveBeenNthCalledWith(
      2,
      { giova: 23 },
      {
        type: SUCCESS,
        payload: { data: 23 },
        meta: { params: ['GioVa'] },
      }
    )
  })
})
