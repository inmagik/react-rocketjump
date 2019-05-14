import { rj } from '../../..'
import rjListInsert from '..'

describe('List Insert plugin', () => {
  it('adds a insertItem action', () => {

    const { actionCreators } = rj(
      rjListInsert(),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    expect(actionCreators).toHaveProperty('insertItem')

    const actionCreator = actionCreators.insertItem

    const action = actionCreator({ id: 1 })

    expect(action).toEqual({
      type: 'RJ_LIST_INSERT',
      item: {
        id: 1
      }
    })
  })

  it('patches reducer only to manage insert operations', () => {

    const jestReducer = jest.fn((state, args, oldReducer) => oldReducer(state, args))

    const spy = rj({
      reducer: oldReducer => (state, action) => jestReducer(state, action, oldReducer)
    })

    const { reducer } = rj(
      spy,
      rjListInsert(),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: null
    }

    reducer(prevState, { type: 'RJ_LIST_INSERT' })

    expect(jestReducer).not.toBeCalled();

    reducer(prevState, { type: 'CUSTOM' });

    expect(jestReducer).toBeCalled();




  })

  it('inserts items', () => {
    const { reducer } = rj(
      rjListInsert(),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: [
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Eve'
        }
      ]
    }

    let nextState = reducer(prevState, { type: 'RJ_LIST_INSERT', item: { id: 4, name: 'Mallory' } })

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Eve'
        },
        {
          id: 4,
          name: 'Mallory'
        }
      ]
    });

  })

  it('can operate with a custom path', () => {
    const { reducer } = rj(
      rjListInsert({ path: 'data.custom.path.to.list' }),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: {
        custom: {
          path: {
            to: {
              list: [
                {
                  id: 1,
                  name: 'Alice'
                },
                {
                  id: 2,
                  name: 'Bob'
                },
                {
                  id: 3,
                  name: 'Eve'
                }
              ]
            }
          }
        }
      }
    }

    let nextState = reducer(prevState, { type: 'RJ_LIST_INSERT', item: { id: 4, name: 'Mallory' } })

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: {
        custom: {
          path: {
            to: {
              list: [
                {
                  id: 1,
                  name: 'Alice'
                },
                {
                  id: 2,
                  name: 'Bob'
                },
                {
                  id: 3,
                  name: 'Eve'
                },
                {
                  id: 4,
                  name: 'Mallory'
                }
              ]
            }
          }
        }
      }
    })
  })

  it('should warn if pagination is suspected', () => {
    const spy = jest.fn()

    console.warn = spy

    const { reducer } = rj(
      rjListInsert({ path: 'data.list', identity: (action, listItem) => listItem === action.item }),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: {
        pagination: {

        },
        list: [
          1,
          2,
          3
        ]
      }
    }

    reducer(prevState, { type: 'RJ_LIST_INSERT', item: 2 })

    expect(spy).toBeCalled()
  })

  it('can use custom merge function', () => {
    const { reducer } = rj(
      rjListInsert({
        merge: (action, list) => {
          (list || []).push(action.item)
          list.sort((a, b) => a.id - b.id)
          return list
        }
      }),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: [
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 3,
          name: 'Eve'
        }
      ]
    }

    let nextState = reducer(prevState, { type: 'RJ_LIST_INSERT', item: { id: 2, name: 'Bob' } })

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 1,
          name: 'Alice'
        },
        {
          id: 2,
          name: 'Bob'
        },
        {
          id: 3,
          name: 'Eve'
        }
      ]
    })
  })
})