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
  it('should be optimistic and commit success', () => {
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
      type: `${MUTATION_PREFIX}/toggle/${SUCCESS}`,
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
              type: `${MUTATION_PREFIX}/toggle/${RUN}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 2,
              },
            },
            committed: true,
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
      type: `${MUTATION_PREFIX}/toggle/${SUCCESS}`,
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
          j: 2,
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
  })
  it('should be optimistic and revert failure and commit success an keep state consistent', () => {
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
      type: `${MUTATION_PREFIX}/toggle/${SUCCESS}`,
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
            done: false,
            j: 1,
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
              type: 'JJ',
            },
            committed: true,
          },
        ],
        snapshot: {
          pending: false,
          error: null,
          data: {
            done: false,
            j: 1,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${SUCCESS}`,
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
        actions: [],
        snapshot: null,
      },
    })
  })
  it('should be optimistic and honored the mutations state', () => {
    function singleMutationReducer(
      state = { pending: false, error: null, rcount: 0 },
      action
    ) {
      switch (action.type) {
        case PENDING: {
          const rcount = state.rcount + action.meta.optimisticMutation
          return {
            ...state,
            rcount,
            error: null,
            pending: rcount > 0,
          }
        }
        case FAILURE: {
          const rcount = state.rcount - action.meta.optimisticMutation
          return {
            ...state,
            rcount,
            error: action.payload,
            pending: rcount > 0,
          }
        }
        case SUCCESS: {
          const rcount = state.rcount - action.meta.optimisticMutation
          return {
            ...state,
            rcount,
            pending: rcount > 0,
          }
        }
        default:
          return state
      }
    }
    const MaRjState = rj({
      mutations: {
        toggle: {
          reducer: singleMutationReducer,
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
    })
    const { reducer } = MaRjState
    let state = reducer(undefined, { type: INIT })
    state = reducer(state, {
      type: SUCCESS,
      payload: { data: { done: true } },
    })
    expect(state).toEqual({
      root: {
        pending: false,
        error: null,
        data: {
          done: true,
        },
      },
      mutations: {
        toggle: {
          rcount: 0,
          pending: false,
          error: null,
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
        },
      },
      mutations: {
        toggle: {
          rcount: 0,
          pending: false,
          error: null,
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
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
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
        },
      },
      mutations: {
        toggle: {
          rcount: 1,
          pending: true,
          error: null,
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
              type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
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
        },
      },
      mutations: {
        toggle: {
          rcount: 1,
          pending: true,
          error: null,
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
              type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
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
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
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
        },
      },
      mutations: {
        toggle: {
          rcount: 3,
          pending: true,
          error: null,
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
              type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
              payload: { params: [] },
              meta: {
                optimisticMutation: 1,
              },
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
              type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
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
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${SUCCESS}`,
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
        },
      },
      mutations: {
        toggle: {
          rcount: 2,
          pending: true,
          error: null,
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
              type: `${MUTATION_PREFIX}/toggle/${PENDING}`,
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
            done: false,
          },
        },
      },
    })
    state = reducer(state, {
      type: `${MUTATION_PREFIX}/toggle/${FAILURE}`,
      payload: 'Bu!',
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
        },
      },
      mutations: {
        toggle: {
          rcount: 0,
          pending: false,
          error: 'Bu!',
        },
      },
      optimisticMutations: {
        actions: [],
        snapshot: null,
      },
    })
  })
})
