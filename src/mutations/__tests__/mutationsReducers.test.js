import rj from '../../rj'
import { INIT, SUCCESS, FAILURE, PENDING, RUN } from '../../actionTypes'

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
  it('should be optimistic and revert failure', () => {
    const MaRjState = rj({
      mutations: {
        toggle: {
          optimistic: true,
          effect: () => {},
          updater: (state) => ({
            ...state,
            data: {
              ...state.data,
              done: !state.data.done,
            },
          }),
        },
      },
      effect: () => {},
      composeReducer: (state, action) => {
        if (action.type === 'JJ') {
          return {
            ...state,
            data: {
              ...state.data,
              j: state.data.j + 1,
            },
          }
        }
        return state
      },
    })

    const { reducer } = MaRjState
    let state = reducer(undefined, { type: INIT })
    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { done: true, j: 0 } },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 1,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 2,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 3,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: 'JJ',
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 1,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 2,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 3,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
  })
  it('should be optimistic and revert failure regardless of actions orders', () => {
    console.log('~~~~')
    const MaRjState = rj({
      mutations: {
        toggle: {
          optimistic: true,
          effect: () => {},
          updater: (state) => ({
            ...state,
            data: {
              ...state.data,
              done: !state.data.done,
            },
          }),
        },
      },
      effect: () => {},
      composeReducer: (state, action) => {
        if (action.type === 'JJ') {
          return {
            ...state,
            data: {
              ...state.data,
              j: state.data.j + 1,
            },
          }
        }
        return state
      },
    })

    const { reducer } = MaRjState
    let state = reducer(undefined, { type: INIT })
    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { done: true, j: 0 } },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 1,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 0,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: 'JJ',
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 2,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 1,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: 'JJ',
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${RUN}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 3,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 2,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: false,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: 'JJ',
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 0,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 1,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: false,
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 3,
              },
            },
            committed: false,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: true,
          },
          {
            action: {
              type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: true,
            j: 2,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: { params: [] },
      meta: {
        optimisticMutation: 3,
      },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
  })
})
