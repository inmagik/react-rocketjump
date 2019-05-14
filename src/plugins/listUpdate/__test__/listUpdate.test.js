import { rj } from '../../..'
import rjListUpdate from '..';

describe('List Update plugin', () => {
  it('adds an updateItem action', () => {

    const { actionCreators } = rj(
      rjListUpdate(),
      {
        effect: () => Promise.resolve(1)
      }
    )()

    expect(actionCreators).toHaveProperty('updateItem')

    const actionCreator = actionCreators.updateItem

    const action = actionCreator({ id: 1, name: 'Alice' })

    expect(action).toEqual({
      type: 'RJ_LIST_UPDATE',
      item: {
        id: 1,
        name: 'Alice'
      }
    })
  })

  it('patches reducer only to manage update operations', () => {

    const jestReducer = jest.fn((state, args, oldReducer) => oldReducer(state, args))

    const spy = rj({
      reducer: oldReducer => (state, action) => jestReducer(state, action, oldReducer)
    })

    const { reducer } = rj(
      spy,
      rjListUpdate(),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: null
    }

    reducer(prevState, { type: 'RJ_LIST_UPDATE' })

    expect(jestReducer).not.toBeCalled();

    reducer(prevState, { type: 'CUSTOM' });

    expect(jestReducer).toBeCalled();




  })

  it('updates items', () => {
    const { reducer } = rj(
      rjListUpdate(),
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

    let nextState = reducer(prevState, { type: 'RJ_LIST_UPDATE', item: { id: 1, name: 'Mallory' } })

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: [
        {
          id: 1,
          name: 'Mallory'
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
    });

  })

  it('can operate with a custom path', () => {
    const { reducer } = rj(
      rjListUpdate({ path: 'data.custom.path.to.list' }),
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

    let nextState = reducer(prevState, { type: 'RJ_LIST_UPDATE', item: { id: 1, name: 'Mallory' } })

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
                  name: 'Mallory'
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
    })
  })

  it('can use custom identity function', () => {
    const { reducer } = rj(
      rjListUpdate({ identity: (action, listItem) => listItem.someKey === action.item.someKey }),
      {
        effect: () => Promise.resolve()
      }
    )()

    const prevState = {
      pending: false,
      error: null,
      data: [
        { id: 1, someKey: 'a', name: 'Alice' },
        { id: 2, someKey: 'b', name: 'Bob' },
        { id: 3, someKey: 'c', name: 'Claus' }
      ]
    }

    let nextState = reducer(prevState, { type: 'RJ_LIST_UPDATE', item: { someKey: 'b', name: 'Mallory', id: 6 } })

    expect(nextState).toEqual({
      pending: false,
      error: null,
      data: [
        { id: 1, someKey: 'a', name: 'Alice' },
        { id: 6, someKey: 'b', name: 'Mallory' },
        { id: 3, someKey: 'c', name: 'Claus' }
      ]
    })
  })

  it('should not warn if pagination is suspected', () => {
    const spy = jest.fn()

    console.warn = spy

    const { reducer } = rj(
      rjListUpdate({ path: 'data.list', identity: (action, listItem) => listItem === action.item }),
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

    reducer(prevState, { type: 'RJ_LIST_DELETE', item: 2 })

    expect(spy).not.toBeCalled()
  })
})