import { rj, rjPlugin } from '../../..'
import rjPlainList from '..'
import { SUCCESS } from '../../../core/actions/actionTypes'
import { RjStateRootShape, RjStateShape } from '../../../core/types'

type TestStateShape = RjStateShape<RjStateRootShape<any[] | null>>

describe('List Plugin', () => {
  it('should make a list reducer', () => {
    const { reducer } = rj(rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    const prevState = {
      root: {
        data: null,
        pending: false,
        error: null,
      },
    }

    const action = {
      type: SUCCESS,
      payload: {
        params: [{ page: 1 }],
        data: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }

    const nextState = reducer(prevState, action)

    expect(nextState.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 23,
          name: 'Alice',
        },
        {
          id: 23,
          name: 'Bob',
        },
        {
          id: 7,
          name: 'Eve',
        },
      ],
    })
  })

  it('should append items when meta append', () => {
    const { reducer } = rj(rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    let state: TestStateShape = {
      root: {
        data: [
          {
            id: 99,
            name: 'Mallory',
          },
        ],
        pending: false,
        error: null,
      },
    }

    const action = {
      type: SUCCESS,
      meta: { append: true },
      payload: {
        data: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }

    state = reducer(state, action)

    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 99,
          name: 'Mallory',
        },
        {
          id: 23,
          name: 'Alice',
        },
        {
          id: 23,
          name: 'Bob',
        },
        {
          id: 7,
          name: 'Eve',
        },
      ],
    })

    state = {
      root: {
        data: null,
        pending: false,
        error: null,
      },
    }

    state = reducer(state, action)

    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 23,
          name: 'Alice',
        },
        {
          id: 23,
          name: 'Bob',
        },
        {
          id: 7,
          name: 'Eve',
        },
      ],
    })
  })

  it('should prepend items when meta prepend', () => {
    const { reducer } = rj(rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    let state: TestStateShape = {
      root: {
        data: [
          {
            id: 99,
            name: 'Mallory',
          },
        ],
        pending: false,
        error: null,
      },
    }

    const action = {
      type: SUCCESS,
      meta: { prepend: true },
      payload: {
        data: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }

    state = reducer(state, action)

    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 23,
          name: 'Alice',
        },
        {
          id: 23,
          name: 'Bob',
        },
        {
          id: 7,
          name: 'Eve',
        },
        {
          id: 99,
          name: 'Mallory',
        },
      ],
    })

    state = {
      root: {
        data: null,
        pending: false,
        error: null,
      },
    }

    state = reducer(state, action)

    expect(state.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 23,
          name: 'Alice',
        },
        {
          id: 23,
          name: 'Bob',
        },
        {
          id: 7,
          name: 'Eve',
        },
      ],
    })
  })

  it('should make selectors for list', () => {
    const { makeSelectors } = rj(rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    const { getList, getCount } = makeSelectors()

    const state = {
      root: {
        pending: false,
        error: null,
        data: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }
    expect(getList(state)).toBe(state.root.data)
    expect(getCount(state)).toBe(3)
  })

  it('should use fallback reducer', () => {
    const fallbackReducer = jest.fn((state, action) => state)

    const otherPlugin = () =>
      rjPlugin({
        reducer: () => fallbackReducer,
      })

    const { reducer } = rj(otherPlugin(), rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    const prevState = {
      root: {
        pending: false,
        error: 'FUCK',
        data: null,
      },
    }

    const action = {
      type: 'CUSTOM',
      payload: {
        params: {},
        data: { id: 1 },
      },
    }

    reducer(prevState, action)

    expect(fallbackReducer).toBeCalledWith(prevState.root, action)
  })

  it('should not break with null state', () => {
    const { makeSelectors } = rj(rjPlainList(), {
      effect: () => Promise.resolve(1),
    })

    const { getList, getCount } = makeSelectors()

    const state = {
      root: {
        pending: false,
        error: null,
        data: null,
      },
    }
    expect(getList(state)).toBe(null)
    expect(getCount(state)).toBe(null)
  })

  it('should allow custom list reducer', () => {
    const customReducer = jest.fn((oldList, action) => {
      return action.payload.data.filter((item: any) =>
        item.name.startsWith('A')
      )
    })

    const { reducer } = rj(
      rjPlainList({
        customListReducer: customReducer,
      }),
      {
        effect: () => Promise.resolve(1),
      }
    )

    const prevState = {
      root: {
        data: [],
        pending: false,
        error: null,
      },
    }

    const action = {
      type: SUCCESS,
      payload: {
        params: [],
        data: [
          {
            id: 23,
            name: 'Alice',
          },
          {
            id: 23,
            name: 'Bob',
          },
          {
            id: 7,
            name: 'Eve',
          },
        ],
      },
    }

    const nextState = reducer(prevState, action)

    expect(customReducer).toBeCalledWith(prevState.root.data, action)

    expect(nextState.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 23,
          name: 'Alice',
        },
      ],
    })
  })
})
