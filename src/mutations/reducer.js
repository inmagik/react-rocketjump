import { SUCCESS, INIT, RUN, FAILURE } from '../actionTypes'
import { MUTATION_PREFIX } from './actionTypes'
import combineReducers from '../combineReducers'

// enhance the basic reducer \w updater of mutations to rj root reducer
export function enhanceReducer(mutations, reducer, actionCreators) {
  const handleMutationsReducers = Object.keys(mutations).reduce(
    (handlers, name) => {
      const mutation = mutations[name]

      let update, optimisticUpdate

      if (
        typeof mutation.optimisticUpdater === 'function' ||
        typeof mutation.optimisticUpdater === 'string'
      ) {
        // Got optimisticUpdater
        // Check optimisticResult to be define when got optimisticUpdater
        if (typeof mutation.optimisticResult !== 'function') {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('[react-rocketjump] @mutations error.')
          } else {
            throw new Error(
              '[react-rocketjump] @mutations you should define optimisticUpdater ' +
                `along with optimisticResult check your mutation config [${name}].`
            )
          }
        }
        // Check for good optimisticUpdater action creator
        if (typeof mutation.optimisticUpdater === 'string') {
          const actionCreator = actionCreators[mutation.optimisticUpdater]
          if (typeof actionCreator !== 'function') {
            if (process.env.NODE_ENV === 'production') {
              throw new Error('[react-rocketjump] @mutations error.')
            } else {
              throw new Error(
                `[react-rocketjump] @mutations you provide a non existing ` +
                  `action creator [${mutation.updater}] as optimisticUpdater for mutation [${name}].`
              )
            }
          }
          // Use action creator as optmistic update handler
          optimisticUpdate = (state, action) =>
            reducer(state, actionCreator(action.payload.data))
        } else {
          optimisticUpdate = (state, action) =>
            mutation.optimisticUpdater(state, action.payload.data)
        }
      }

      // No optimisticUpdater
      // Check for good updater
      if (typeof mutation.updater === 'string') {
        const actionCreator = actionCreators[mutation.updater]
        if (typeof actionCreator !== 'function') {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('[react-rocketjump] @mutations error.')
          } else {
            throw new Error(
              `[react-rocketjump] @mutations you provide a non existing ` +
                `action creator [${mutation.updater}] as updater for mutation [${name}].`
            )
          }
        }
        update = (state, action) =>
          reducer(state, actionCreator(action.payload.data))
      } else if (typeof mutation.updater === 'function') {
        update = (state, action) => mutation.updater(state, action.payload.data)
      } else if (!optimisticUpdate) {
        // Get angry only when we have no a valid optimisticUpdate
        if (process.env.NODE_ENV === 'production') {
          throw new Error('[react-rocketjump] @mutations error.')
        } else {
          throw new Error(
            '[react-rocketjump] @mutations you should provide at least ' +
              `an effect and an updater to mutation config [${name}].`
          )
        }
      }

      // Register updater as SUCCESS handler
      if (update) {
        const type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
        handlers[type] = update
      }

      // Optmistic updater!
      if (typeof mutation.optimisticResult === 'function') {
        // Use standard updater ans optimistiUpdater when is not defined
        if (!optimisticUpdate) {
          optimisticUpdate = update
        }
        const type = `${MUTATION_PREFIX}/${name}/${RUN}`
        handlers[type] = (state, action) => {
          const optimisticData = mutation.optimisticResult(
            ...action.payload.params
          )
          return optimisticUpdate(state, {
            payload: { data: optimisticData },
          })
        }
      }

      return handlers
    },
    {}
  )

  return (prevState, action) => {
    if (handleMutationsReducers[action.type]) {
      return handleMutationsReducers[action.type](prevState, action)
    }
    return reducer(prevState, action)
  }
}

// Reducer for track the mutation state
function makeMutationReducer(mutation, name) {
  return (state, action) => {
    if (action.type === INIT) {
      return mutation.reducer(state, action)
    }
    const pieces = action.type.split('/')
    if (pieces.length !== 3) {
      return state
    }
    if (pieces[0] === MUTATION_PREFIX && pieces[1] === name) {
      const decoupleType = pieces[2]
      return mutation.reducer(state, { ...action, type: decoupleType })
    }
    return state
  }
}

// Mutations reducer or null if no mutations has a reducer config option
export function makeMutationsReducer(mutations) {
  const mutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    if (typeof mutation.reducer !== 'function') {
      return all
    }
    return {
      ...all,
      [name]: makeMutationReducer(mutation, name),
    }
  }, {})

  if (Object.keys(mutationsReducers).length === 0) {
    return null
  }

  return combineReducers(mutationsReducers)
}

const DefaultOptState = {
  snapshot: null,
  actions: [],
}
export function optimisticMutationsReducer(state = DefaultOptState, action) {
  if (state.snapshot) {
    return {
      ...state,
      actions: state.actions.concat({ committed: true, action }),
    }
  }
  return state
}

function handleOptRun(reducer, state, action) {
  const {
    optimisticMutations: { actions, snapshot },
  } = state
  const nextActions = actions.concat({
    committed: false,
    action,
  })
  const nextSnapshot = snapshot ?? state.root
  const nextState = reducer(state, action)
  return {
    ...nextState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

function applyActionsOnSnapshot(snapshot, actions, reducer) {
  const state = { root: snapshot }
  return actions.reduce((snap, action) => reducer(snap, action), state).root
}

function getFirstNonCommittedIndex(actions) {
  for (let i = 0; i < actions.length; i++) {
    if (!actions[i].committed) {
      return i
    }
  }
  return null
}

function handleOptSuccess(reducer, state, action) {
  const {
    optimisticMutations: { actions, snapshot },
  } = state

  // Commit action
  // SWAP THE RUN \W SUCCESS KEEP ORDER BUT USE SERVER RESPONSE
  // OR WHEN AUTO COMMIT ACTIVE COMMIT THE GOOD RUN!
  const mutationTypeRun = action.type
    .split('/')
    .slice(0, 2)
    .concat(RUN)
    .join('/')
  let nextActions = actions.map((actionWrapper) => {
    if (
      actionWrapper.action.type === mutationTypeRun &&
      actionWrapper.action?.meta?.mutationID === action.meta.mutationID
    ) {
      return {
        committed: true,
        action:
          action.meta.mutationAutoCommit === true
            ? actionWrapper.action
            : action,
      }
    } else {
      return actionWrapper
    }
  })

  let commitedRootState
  if (action.meta.mutationAutoCommit === true) {
    // Use current root state and commit them!
    commitedRootState = state.root
  } else {
    // Commited root state \w SUCCESS from SERVER
    commitedRootState = applyActionsOnSnapshot(
      snapshot,
      nextActions.map((a) => a.action),
      reducer
    )
  }

  const firstNonCommitIndex = getFirstNonCommittedIndex(nextActions)

  let nextSnapshot
  if (firstNonCommitIndex === null) {
    // All commited!
    nextSnapshot = null
    nextActions = []
  } else {
    // Save a new snapshot appling actions unitl first non committed
    nextSnapshot = applyActionsOnSnapshot(
      snapshot,
      nextActions.slice(0, firstNonCommitIndex).map((a) => a.action),
      reducer
    )
    // Take only action from first non committed
    nextActions = nextActions.slice(firstNonCommitIndex)
  }

  const nextState = reducer(state, action)
  return {
    ...nextState,
    root: commitedRootState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

function handleOptFailure(reducer, state, action) {
  const {
    optimisticMutations: { actions, snapshot },
  } = state

  // Remove failied RUN
  const mutationTypeRun = action.type
    .split('/')
    .slice(0, 2)
    .concat(RUN)
    .join('/')
  let nextActions = actions.filter(
    (a) =>
      a.action.type !== mutationTypeRun ||
      a.action?.meta?.mutationID !== action.meta.mutationID
  )

  // 0 - 1 - 1 - 0 - 1
  // FILTER:
  // 1 - 1 - 0 - 1
  // or
  // 0 - 1 - 1 - 1

  // Rollback to state without opt failed actions
  const roolBackRootState = applyActionsOnSnapshot(
    snapshot,
    nextActions.map((a) => a.action),
    reducer
  )

  const firstNonCommitIndex = getFirstNonCommittedIndex(nextActions)

  let nextSnapshot
  if (firstNonCommitIndex === null) {
    // All committed!
    nextSnapshot = null
    nextActions = []
  } else {
    // 0 - 1 - 1 - 1
    // Squash the action that will be removed into a new snap
    nextSnapshot = applyActionsOnSnapshot(
      snapshot,
      nextActions.slice(0, firstNonCommitIndex).map((a) => a.action),
      reducer
    )
    // 0 - 1
    // or
    // 0 - 1 - 1 - 1
    // from
    nextActions = nextActions.slice(firstNonCommitIndex)
  }

  const nextState = reducer(state, action)
  return {
    ...nextState,
    root: roolBackRootState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

export function optimisticMutationsHor(reducer) {
  return (state, action) => {
    if (Number.isInteger(action?.meta?.mutationID)) {
      // OPT ACTIONS

      // Split into mutations pieces
      const pieces = action.type.split('/')
      if (pieces.length === 3 && pieces[0] === MUTATION_PREFIX) {
        const decoupleType = pieces[2]
        if (decoupleType === RUN) {
          return handleOptRun(reducer, state, action)
        }
        if (decoupleType === FAILURE) {
          return handleOptFailure(reducer, state, action)
        }
        if (decoupleType === SUCCESS) {
          return handleOptSuccess(reducer, state, action)
        }
      }
    }

    return reducer(state, action)
  }
}
