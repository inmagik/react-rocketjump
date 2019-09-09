import React from 'react'
import rj from '../../rj'
import useRj from '../../useRj'
import connectRj from '../../connectRj'
import { SUCCESS, FAILURE, PENDING } from '../../actionTypes'
import { isEffectAction } from '../../actionCreators'
import { renderHook, act } from '@testing-library/react-hooks'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations action creators', () => {
  it('should be generated from mutations and generate good actions', async () => {
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

    type = `${MUTATION_PREFIX}/killHumans/RUN`
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
    type = `${MUTATION_PREFIX}/cookSpaghetti/RUN`
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
  })

  it('should be warn when a mutation override existing action creator', async () => {
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

  it('should be handle the mutation state when mutation has state', async () => {
    const resolves = []
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => new Promise(r => resolves.push(r)),
          updater: () => {},
          reducer: (state = { pending: false }, { type }) => {
            if (type === PENDING) {
              return { ...state, pending: true }
            }
            if (type === SUCCESS || type === FAILURE) {
              return { ...state, pending: false }
            }
            return state
          },
        },
      },
      effect: () => Promise.resolve(1312),
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[1].killHumans.state()).toEqual({
      pending: false,
    })
    await act(async () => {
      result.current[1].killHumans()
    })
    expect(result.current[1].killHumans.state()).toEqual({
      pending: true,
    })
    await act(async () => {
      resolves[0]()
    })
    expect(result.current[1].killHumans.state()).toEqual({
      pending: false,
    })
  })

  it('should be handle the mutation state when mutation has state even with connectRj', async () => {
    const effect = () => Promise.resolve(23)
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(1312),
          updater: () => {},
          reducer: () => ({
            magik: 23,
          }),
        },
      },
      effect,
    })

    let TreeWithConnect = ({ killHumans }) => {
      const { magik } = killHumans.state()
      return (
        <div>
          <div data-testid="magik">{magik}</div>
        </div>
      )
    }
    TreeWithConnect = connectRj(MaRjState)(TreeWithConnect)
    const { getByTestId } = render(<TreeWithConnect />)
    expect(getByTestId('magik')).toHaveTextContent('23')
  })
})
