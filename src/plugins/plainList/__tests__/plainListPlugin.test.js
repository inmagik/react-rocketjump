import { rj } from '../../..'
import rjList from '..'
import { SUCCESS } from '../../../actionTypes'

describe('List Plugin', () => {
  it('should make a list reducer', () => {
    const { reducer } = rj(rjList(), {
      effect: () => Promise.resolve(1),
    })

    const prevState = {
      data: null,
      pending: false,
      error: null,
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

    expect(nextState).toEqual({
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
    const { reducer } = rj(rjList(), {
      effect: () => Promise.resolve(1),
    })

    let state = {
      data: [
        {
          id: 99,
          name: 'Mallory',
        },
      ],
      pending: false,
      error: null,
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

    expect(state).toEqual({
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
      data: null,
      pending: false,
      error: null,
    }

    state = reducer(state, action)

    expect(state).toEqual({
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
    const { reducer } = rj(rjList(), {
      effect: () => Promise.resolve(1),
    })

    let state = {
      data: [
        {
          id: 99,
          name: 'Mallory',
        },
      ],
      pending: false,
      error: null,
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

    expect(state).toEqual({
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
      data: null,
      pending: false,
      error: null,
    }

    state = reducer(state, action)

    expect(state).toEqual({
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
    const { makeSelectors } = rj(rjList(), {
      effect: () => Promise.resolve(1),
    })

    const { getList, getCount } = makeSelectors()

    const state = {
      loading: false,
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
    }
    expect(getList(state)).toBe(state.data)
    expect(getCount(state)).toBe(3)
  })

  it('should use fallback reducer', () => {
    const fallbackReducer = jest.fn((state, action) => state)

    const otherPlugin = () =>
      rj({
        reducer: () => fallbackReducer,
      })

    const { reducer } = rj(otherPlugin(), rjList(), {
      effect: () => Promise.resolve(1),
    })

    const prevState = null

    const action = {
      type: 'CUSTOM',
      payload: {
        params: {},
        data: { id: 1 },
      },
    }

    reducer(prevState, action)

    expect(fallbackReducer).toBeCalledWith(null, action)
  })

  it('should not break with null state', () => {
    const { makeSelectors } = rj(rjList(), {
      effect: () => Promise.resolve(1),
    })

    const { getList, getCount } = makeSelectors()

    const state = {
      loading: false,
      error: null,
      data: null,
    }
    expect(getList(state)).toBe(null)
    expect(getCount(state)).toBe(null)
  })

  it('should allow custom list reducer', () => {
    const customReducer = jest.fn((oldList, action) => {
      return action.payload.data.filter((item) => item.name.startsWith('A'))
    })

    const { reducer } = rj(
      rjList({
        customListReducer: customReducer,
      }),
      {
        effect: () => Promise.resolve(1),
      }
    )

    const prevState = {
      data: {
        list: [],
        pagination: null,
      },
      pending: false,
      error: null,
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

    expect(customReducer).toBeCalledWith(prevState.data, action)

    expect(nextState).toEqual({
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
