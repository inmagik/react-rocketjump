import '@testing-library/jest-dom/extend-expect'
import { renderHook, act } from '@testing-library/react-hooks'
import rj from '../../core/rj'
import useRj from '../useRj'
import { RUN, PENDING, SUCCESS } from '../../core/actions/actionTypes'
import { isEffectAction } from '../../core/actions/effectAction'
import { Action } from '../../core/types'

const MUTATION_PREFIX = '@MUTATION'

describe('useRj mutations action creators', () => {
  it('should be call root reducer with mutations RUN PENDING and eat SUCCESS cause handled by updater', async () => {
    const actionLog: Action[] = []

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
      reducer: (r) => (state, action) => {
        actionLog.push(action)
        return r(state, action)
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState))

    let action
    let type: string

    await act(async () => {
      result.current[1].killHumans('Giova', 23)
    })

    type = `${MUTATION_PREFIX}/killHumans/${RUN}`
    action = actionLog.filter((a) => a.type === type)[0]
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
    action = actionLog.filter((a) => a.type === type)[0]
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
    action = actionLog.filter((a) => a.type === type)[0]
    expect(action).toEqual({
      type,
      meta: {
        params: [{ k: 23 }],
      },
    })
    // NO SUCCESS
    type = `${MUTATION_PREFIX}/cookSpaghetti/${SUCCESS}`
    action = actionLog.filter((a) => a.type === type)[0]
    expect(action).toBe(undefined)
  })

  it('should be call root reducer with optimistic mutations PENDING and SUCCESS and eat RUN cause handled by updater', async () => {
    // Isolate version of optmistic updater counter
    const actionLog: Action[] = []

    const maRjState = rj({
      mutations: {
        cookSpaghetti: {
          optimisticResult: () => {},
          effect: () => Promise.resolve('SPAGHETTI!'),
          updater: () => {},
        },
      },
      reducer: (r) => (state, action) => {
        actionLog.push(action)
        return r(state, action)
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(maRjState))

    let action
    let type: string

    await act(async () => {
      result.current[1].cookSpaghetti({ k: 23 })
    })
    type = `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`
    action = actionLog.filter((a) => a.type === type)[0]
    expect(action).toBe(undefined)
    // PENDING
    type = `${MUTATION_PREFIX}/cookSpaghetti/${PENDING}`
    action = actionLog.filter((a) => a.type === type)[0]
    expect(action).toEqual({
      type,
      meta: {
        mutationID: 1,
        params: [{ k: 23 }],
      },
    })
    // SUCCESS
    type = `${MUTATION_PREFIX}/cookSpaghetti/${SUCCESS}`
    action = actionLog.filter((a) => a.type === type)[0]
    expect(action).toBe(undefined)
  })
})
