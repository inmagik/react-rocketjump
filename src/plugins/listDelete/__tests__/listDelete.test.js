import { rj } from '../../..'
import rjListDelete from '..'

describe('List DeletePlugin', () => {
  it('adds a deleteItem action', () => {
    const { actionCreators } = rj(rjListDelete(), {
      effect: () => Promise.resolve(1),
    })

    expect(actionCreators).toHaveProperty('deleteItem')

    const actionCreator = actionCreators.deleteItem

    const action = actionCreator({ id: 1 })

    expect(action).toEqual({
      type: 'RJ_LIST_DELETE',
      item: {
        id: 1,
      },
    })
  })

  it('patches reducer only to manage delete operations', () => {
    const jestReducer = jest.fn((state, args, oldReducer) =>
      oldReducer(state, args)
    )

    const spy = rj({
      reducer: oldReducer => (state, action) =>
        jestReducer(state, action, oldReducer),
    })

    const { reducer } = rj(spy, rjListDelete(), {
      effect: () => Promise.resolve(),
    })

    const prevState = {
      root: {
        pending: false,
        error: null,
        data: null,
      },
    }

    reducer(prevState, { type: 'RJ_LIST_DELETE' })

    expect(jestReducer).not.toBeCalled()

    reducer(prevState, { type: 'CUSTOM' })

    expect(jestReducer).toBeCalled()
  })

  it('deletes items', () => {
    const { reducer } = rj(rjListDelete(), {
      effect: () => Promise.resolve(),
    })

    const prevState = {
      root: {
        pending: false,
        error: null,
        data: [
          {
            id: 1,
            name: 'Alice',
          },
          {
            id: 2,
            name: 'Bob',
          },
          {
            id: 3,
            name: 'Eve',
          },
        ],
      },
    }

    let nextState = reducer(prevState, {
      type: 'RJ_LIST_DELETE',
      item: { id: 1 },
    })

    expect(nextState.root).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 2,
          name: 'Bob',
        },
        {
          id: 3,
          name: 'Eve',
        },
      ],
    })
  })

  it('can operate with a custom path', () => {
    const { reducer } = rj(rjListDelete({ path: 'data.custom.path.to.list' }), {
      effect: () => Promise.resolve(),
    })

    const prevState = {
      root: {
        pending: false,
        error: null,
        data: {
          custom: {
            path: {
              to: {
                list: [
                  {
                    id: 1,
                    name: 'Alice',
                  },
                  {
                    id: 2,
                    name: 'Bob',
                  },
                  {
                    id: 3,
                    name: 'Eve',
                  },
                ],
              },
            },
          },
        },
      },
    }

    let nextState = reducer(prevState, {
      type: 'RJ_LIST_DELETE',
      item: { id: 1 },
    })

    expect(nextState.root).toEqual({
      pending: false,
      error: null,
      data: {
        custom: {
          path: {
            to: {
              list: [
                {
                  id: 2,
                  name: 'Bob',
                },
                {
                  id: 3,
                  name: 'Eve',
                },
              ],
            },
          },
        },
      },
    })
  })

  it('can use custom identity function', () => {
    const { reducer } = rj(
      rjListDelete({
        identity: (action, listItem) => listItem === action.item,
      }),
      {
        effect: () => Promise.resolve(),
      }
    )

    const prevState = {
      root: {
        pending: false,
        error: null,
        data: [1, 2, 3],
      },
    }

    let nextState = reducer(prevState, { type: 'RJ_LIST_DELETE', item: 2 })

    expect(nextState.root).toEqual({
      pending: false,
      error: null,
      data: [1, 3],
    })
  })

  it('should warn if pagination is suspected', () => {
    const spy = jest.fn()

    console.warn = spy

    const { reducer } = rj(
      rjListDelete({
        path: 'data.list',
        identity: (action, listItem) => listItem === action.item,
      }),
      {
        effect: () => Promise.resolve(),
      }
    )

    const prevState = {
      root: {
        pending: false,
        error: null,
        data: {
          pagination: {},
          list: [1, 2, 3],
        },
      },
    }

    reducer(prevState, { type: 'RJ_LIST_DELETE', item: 2 })

    expect(spy).toBeCalled()
  })
})
