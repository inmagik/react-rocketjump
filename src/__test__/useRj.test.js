import { act } from 'react-dom/test-utils'
import { renderHook } from 'react-hooks-testing-library'
import memoize from 'memoize-one'
import rj from '../rj'
import useRj from '../useRj'

describe('useRj', () => {
  it('should have the default state defined by rj', () => {
    const maRjState = rj(() => Promise.resolve(1312))

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
    })
  })

  it('should respect the exendibilty of rj and have the enhanced default state', () => {
    const maRjState = rj(
      rj({
        composeReducer: (prevState = { giova: 23 }) => prevState,
      }),
      rj({
        composeReducer: (prevState = { albi: 1312 }) => prevState,
      }),
      rj({
        composeReducer: (prevState = { skaffo: 777 }) => prevState,
      }),
      () => Promise.resolve(1312)
    )

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      data: null,
      giova: 23,
      skaffo: 777,
      albi: 1312,
      pending: false,
      error: null,
    })
  })

  it('should dervive the state if a function is provided', () => {
    const maRjState = rj(
      rj({
        composeReducer: (prevState = { giova: 23 }) => prevState,
      }),
      () => Promise.resolve(1312)
    )

    const { result } = renderHook(() =>
      useRj(maRjState, state => ({
        ...state,
        maik: 1312,
      }))
    )

    expect(result.current[0]).toEqual({
      data: null,
      giova: 23,
      maik: 1312,
      pending: false,
      error: null,
    })
  })

  it('should dervive the state if a function is provided and give rj selectors', () => {
    const maRjState = rj(
      rj({
        composeReducer: (prevState = { giova: 23 }) => prevState,
      }),
      () => Promise.resolve(1312)
    )

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getData }) => ({
        friends: getData(state),
      }))
    )

    expect(result.current[0]).toEqual({
      friends: null,
    })
  })

  it('should create a per-instance version of selectors to enable good memoization', () => {
    const mySelector = jest
      .fn()
      .mockImplementation(n => (n === 0 ? 0 : n + 1300))

    const maRjState = rj(
      rj({
        composeReducer: (prevState = { data: 0, beat: 0 }, action) => {
          if (action.type === 'GANG') {
            return {
              ...prevState,
              data: action.payload + prevState.data,
            }
          }
          if (action.type === 'CHARLIE') {
            return {
              ...prevState,
              beat: prevState.beat + 1,
            }
          }
          return prevState
        },
        actions: () => ({
          gang: n => ({ type: 'GANG', payload: n }),
          charlie: () => ({ type: 'CHARLIE' }),
        }),
        selectors: ({ getData }) => {
          const memoSelector = memoize(mySelector)
          return { getMaik: state => memoSelector(getData(state)) }
        },
      }),
      () => Promise.resolve(1312)
    )

    const { result: resultA } = renderHook(() =>
      useRj(maRjState, (state, { getMaik }) => ({
        friends: getMaik(state),
        beat: state.beat,
      }))
    )
    const { result: resultB } = renderHook(() =>
      useRj(maRjState, (state, { getMaik }) => ({
        friends: getMaik(state),
        beat: state.beat,
      }))
    )

    // No MEMO selectors called 2 Time
    expect(mySelector).toHaveBeenCalledTimes(2)
    expect(resultA.current[0]).toEqual({
      friends: 0,
      beat: 0,
    })
    expect(resultB.current[0]).toEqual({
      friends: 0,
      beat: 0,
    })

    // Break memo of A
    act(() => resultA.current[1].gang(12))

    expect(mySelector).toHaveBeenCalledTimes(3)
    expect(resultA.current[0]).toEqual({
      friends: 1312,
      beat: 0,
    })
    expect(resultB.current[0]).toEqual({
      friends: 0,
      beat: 0,
    })

    // State change but...
    act(() => resultA.current[1].charlie())

    // Ma FUCKING A MEMO GANG!!!!
    expect(mySelector).toHaveBeenCalledTimes(3)
    expect(resultA.current[0]).toEqual({
      friends: 1312,
      beat: 1,
    })

    // Break memo B
    act(() => resultB.current[1].gang(12))

    // ... Ensure break memo
    expect(mySelector).toHaveBeenCalledTimes(4)
    expect(resultA.current[0]).toEqual({
      friends: 1312,
      beat: 1,
    })
    expect(resultB.current[0]).toEqual({
      friends: 1312,
      beat: 0,
    })

    // Trigger the change on A state ...
    act(() => resultA.current[1].charlie())

    // A still memo :D
    expect(mySelector).toHaveBeenCalledTimes(4)
    expect(resultA.current[0]).toEqual({
      friends: 1312,
      beat: 2,
    })
  })

  it('should run rj sideEffects and react to succees', async () => {
    const mockFn = jest.fn().mockResolvedValue(23)
    const maRjState = rj(mockFn)

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getData }) => ({
        friends: getData(state),
      }))
    )

    expect(result.current[0]).toEqual({
      friends: null,
    })

    await act(async () => {
      result.current[1].run()
    })
    expect(result.current[0]).toEqual({
      friends: 23,
    })
  })

  it('should run rj sideEffects and react to failure', async () => {
    const mockFn = jest.fn(() => Promise.reject('Bleah'))
    const maRjState = rj(mockFn)

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getError }) => ({
        error: getError(state),
      }))
    )

    expect(result.current[0]).toEqual({
      error: null,
    })

    await act(async () => {
      result.current[1].run()
    })
    expect(result.current[0]).toEqual({
      error: 'Bleah',
    })
  })

  it('should get angry with a non rj object is passed as argument', () => {
    expect(() => {
      useRj(rj())
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj({})
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj(23)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj()
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
  })

  test.todo('Test onSuccess onFailure')

  test.todo('Test actions')

  test.todo('Test mapActions')
})