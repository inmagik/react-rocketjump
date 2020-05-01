import blamer from 'rocketjump-core/blamer.macro'
import { SUCCESS, INIT, RUN, FAILURE } from '../actionTypes'
import { MUTATION_PREFIX } from './actionTypes'
import combineReducers from '../combineReducers'

// enhance the basic reducer \w updater of mutations to rj root reducer
export function enhanceReducer(mutations, reducer, actionCreators) {
  const handleMutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    let update

    if (typeof mutation.updater === 'string') {
      const actionCreator = actionCreators[mutation.updater]
      if (typeof actionCreator !== 'function') {
        blamer(
          '[rj-config-error] @mutations',
          `[react-rocketjump] @mutations you provide a non existing ` +
            `action creator [${mutation.updater}] as updater for mutation [${name}].`
        )
      }
      update = (state, action) =>
        reducer(state, actionCreator(action.payload.data))
    } else if (typeof mutation.updater === 'function') {
      update = (state, action) => mutation.updater(state, action.payload.data)
    } else {
      blamer(
        '[rj-config-error] @mutations',
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    const type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
    const nextHanlders = {
      ...all,
      [type]: update,
    }

    // Optmistic updater!
    if (typeof mutation.optimisticResult === 'function') {
      const type = `${MUTATION_PREFIX}/${name}/${RUN}`
      nextHanlders[type] = (state, action) => {
        const optimisticData = mutation.optimisticResult(
          ...action.payload.params
        )
        return update(state, {
          payload: { data: optimisticData },
        })
      }
    }

    return nextHanlders
  }, {})

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
    const pieces = (action.type ?? '').split('/')
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
  const mutationTypeRun = action.type
    .split('/')
    .slice(0, 2)
    .concat(RUN)
    .join('/')
  let nextActions = actions.map((a) => {
    // FIXME FILTER 4 RUN!
    if (
      a.action.type === mutationTypeRun &&
      a.action?.meta?.mutationID === action.meta.mutationID
    ) {
      return {
        committed: true,
        action,
      }
    } else {
      return a
    }
  })

  // Commited root state \w SUCCESS from SERVER
  const commitedRootState = applyActionsOnSnapshot(
    snapshot,
    nextActions.map((a) => a.action),
    reducer
  )

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

export function optimisticMutationsHor(reducer, mutations) {
  return (state, action) => {
    if (Number.isInteger(action?.meta?.mutationID)) {
      // OPT ACTIONS

      // Split into mutations pieces
      const pieces = (action.type ?? '').split('/')
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
