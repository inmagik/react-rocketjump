import rj from '../../rj'
import rjPlugin from '../../rjPlugin'
import bindActionCreators from '../../actions/bindActionCreators'
import { RUN } from '../../actions/actionTypes'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations action creators', () => {
  it('should be generated from mutations and generate good actions', () => {
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

  it('should be generated from mutations and generate good optimistic actions', () => {
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
        mutationID: expect.any(Number),
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
        mutationID: expect.any(Number),
        params: ['Yeah', 23],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should be generated from mutations and generate auto commit action when only optimistiUpdater is configured', () => {
    const mockDispatch = jest.fn()
    const maRjState = rj({
      mutations: {
        killHumans: {
          optimisticResult: () => null,
          effect: () => Promise.resolve(23),
          updater: () => {},
          optimisticUpdater: () => {},
        },
        cookSpaghetti: {
          optimisticResult: () => null,
          effect: () => Promise.resolve(23),
          optimisticUpdater: () => {},
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
        mutationID: expect.any(Number),
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
        mutationID: expect.any(Number),
        params: ['Yeah', 23],
        mutationAutoCommit: true,
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })

  it('should be warn when a mutation override existing action creator', async () => {
    const spy = jest.fn()

    console.warn = spy
    rj(
      rjPlugin({
        actions: () => ({
          killHumans: () => ({ type: 'BANGERAAANG' }),
        }),
      }),
      {
        mutations: {
          killHumans: {
            effect: () => Promise.resolve(99),
            updater: () => {},
          },
        },
        effect: () => Promise.resolve(1312),
      }
    )

    expect(spy.mock.calls[0][0]).toMatch(/\[react-rocketjump\] @mutations/)
  })
})
