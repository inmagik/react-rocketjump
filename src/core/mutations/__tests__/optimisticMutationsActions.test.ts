import rj from '../../rj'
import bindActionCreators from '../../actions/bindActionCreators'
import { RUN } from '../../actions/actionTypes'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ optimistic action creators', () => {
  it('should generate incremental mutation ids', () => {
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

    boundActions.cookSpaghetti('Yeah', 23)
    expect(mockDispatch).nthCalledWith(3, {
      type: `${MUTATION_PREFIX}/cookSpaghetti/${RUN}`,
      payload: { params: ['Yeah', 23] },
      meta: {
        mutationID: 3,
        params: ['Yeah', 23],
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
  })
})
