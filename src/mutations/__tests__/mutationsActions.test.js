import { isEffectAction, bindActionCreators } from 'rocketjump-core'
import { RUN, PENDING, SUCCESS } from '../../actionTypes'
import { renderHook, act } from '@testing-library/react-hooks'
import '@testing-library/jest-dom/extend-expect'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations action creators', () => {
  it('should be generated from mutations and generate good actions', () => {
    let rj
    jest.isolateModules(() => {
      rj = require('../../rj').default
    })
    const mockDispatch = jest.fn()
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
        cookSpaghetti: {
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
      },
      effect: () => Promise.resolve(1312),
    })
    const boundActions = bindActionCreators(
      maRjState.actionCreators,
      mockDispatch
    )
    boundActions.killHumans('x')

    expect(mockDispatch).nthCalledWith(1, {
      type: `${MUTATION_PREFIX}/killHumans/${RUN}`,
      payload: { params: ['x'] },
      meta: {
        params: ['x'],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })

    boundActions.cookSpaghetti('Yeah', 23)
    expect(mockDispatch).nthCalledWith(2, {
      type: `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`,
      payload: { params: ['Yeah', 23] },
      meta: {
        params: ['Yeah', 23],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should be call root reducer with mutations RUN PENDING and eat SUCCESS cause handled by updater', async () => {
    // Isolate version of optmistic updater counter
    let rj
    let useRj
    jest.isolateModules(() => {
      rj = require('../../rj').default
      useRj = require('../../useRj').default
    })

    const actionLog = []

    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
        cookSpaghetti: {
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
      },
      reducer: r => (state, action) => {
        actionLog.push(action)
        return r(state, action)
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState))

    let action
    let type

    await act(async () => {
      result.current[1].killHumans('Giova', 23)
    })

    type = `${MUTATION_PREFIX}/killHumans/${RUN}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toEqual({
      type,
      payload: {
        params: ['Giova', 23],
      },
      meta: {
        params: ['Giova', 23],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(action)).toBe(true)

    await act(async () => {
      result.current[1].cookSpaghetti({ k: 23 })
    })
    type = `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toEqual({
      type,
      payload: {
        params: [{ k: 23 }],
      },
      meta: {
        params: [{ k: 23 }],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(action)).toBe(true)
    // PENDING
    type = `${MUTATION_PREFIX}/cookSpaghetti/${PENDING}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toEqual({
      type,
      meta: {
        params: [{ k: 23 }],
      },
    })
    // NO SUCCESS
    type = `${MUTATION_PREFIX}/cookSpaghetti/${SUCCESS}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toBe(undefined)
  })

  it('should be call root reducer with optimistic mutations PENDING and SUCCESS and eat RUN cause handled by updater', async () => {
    // Isolate version of optmistic updater counter
    let rj
    let useRj
    jest.isolateModules(() => {
      rj = require('../../rj').default
      useRj = require('../../useRj').default
    })
    const actionLog = []

    const maRjState = rj({
      mutations: {
        cookSpaghetti: {
          optimisticResult: () => {},
          effect: () => Promise.resolve('SPAGHETTI!'),
          updater: () => {},
        },
      },
      reducer: r => (state, action) => {
        actionLog.push(action)
        return r(state, action)
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState))

    let action
    let type

    await act(async () => {
      result.current[1].cookSpaghetti({ k: 23 })
    })
    type = `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toBe(undefined)
    // PENDING
    type = `${MUTATION_PREFIX}/cookSpaghetti/${PENDING}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toEqual({
      type,
      meta: {
        mutationID: 1,
        params: [{ k: 23 }],
      },
    })
    // SUCCESS
    type = `${MUTATION_PREFIX}/cookSpaghetti/${SUCCESS}`
    action = actionLog.filter(a => a.type === type)[0]
    expect(action).toBe(undefined)
  })

  it('should be generated from mutations and generate good optimistic actions', () => {
    let rj
    jest.isolateModules(() => {
      rj = require('../../rj').default
    })
    const mockDispatch = jest.fn()
    const maRjState = rj({
      mutations: {
        killHumans: {
          optimisticResult: () => null,
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
        cookSpaghetti: {
          optimisticResult: () => null,
          effect: () => Promise.resolve(23),
          updater: () => {},
        },
      },
      effect: () => Promise.resolve(1312),
    })
    const boundActions = bindActionCreators(
      maRjState.actionCreators,
      mockDispatch
    )
    boundActions.killHumans('x')

    expect(mockDispatch).nthCalledWith(1, {
      type: `${MUTATION_PREFIX}/killHumans/${RUN}`,
      payload: { params: ['x'] },
      meta: {
        mutationID: 1,
        params: ['x'],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })

    boundActions.cookSpaghetti('Yeah', 23)
    expect(mockDispatch).nthCalledWith(2, {
      type: `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`,
      payload: { params: ['Yeah', 23] },
      meta: {
        mutationID: 2,
        params: ['Yeah', 23],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should be warn when a mutation override existing action creator', async () => {
    let rj
    jest.isolateModules(() => {
      rj = require('../../rj').default
    })
    const spy = jest.fn()

    console.warn = spy
    rj(
      rj({
        actions: () => ({
          killHumans: () => {},
        }),
      }),
      {
        mutations: {
          killHumans: {
            effect: () => {},
            updater: () => {},
          },
        },
        effect: () => Promise.resolve(1312),
      }
    )

    expect(spy.mock.calls[0][0]).toMatch(/\[react-rocketjump\] @mutations/)
  })
})
