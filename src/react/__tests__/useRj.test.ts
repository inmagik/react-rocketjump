import { withLatestFrom, map } from 'rxjs/operators'
import { renderHook, act } from '@testing-library/react-hooks'
import memoize from 'memoize-one'
import rj from '../../core/rj'
import rjPlugin from '../../core/rjPlugin'
import useRj from '../useRj'
import { INIT } from '../../core/actions/actionTypes'
import { RjStateRootShape } from '../../core/types'

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
      rjPlugin({
        composeReducer: (prevState) => ({
          ...prevState,
          giova: 23,
        }),
      }),
      rjPlugin({
        composeReducer: (prevState) => ({
          ...prevState,
          albi: 1312,
        }),
      }),
      rjPlugin({
        composeReducer: (prevState) => ({
          ...prevState,
          skaffo: 777,
        }),
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
      rjPlugin({
        composeReducer: (prevState) => ({
          ...prevState,
          giova: 23,
        }),
      }),
      () => Promise.resolve(1312)
    )

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getRoot }) => ({
        ...getRoot(state),
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
      rjPlugin({
        composeReducer: (prevState) => ({
          ...prevState,
          giova: 23,
        }),
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

  it('should compute state using given computed config', () => {
    const p1 = rjPlugin({
      selectors: () => ({
        getBuddy: () => 23,
        getMagic: () => 23,
      }),
    })
    const maRjState = rj(p1, {
      effect: () => Promise.resolve(1312),
      computed: {
        budda: 'getBuddy',
        magik: 'getMagic',
        babu: 'isLoading',
        friends: 'getData',
        shitBro: 'getError',
      },
      selectors: ({ getBuddy }) => ({
        getBuddy: () => getBuddy() * 2,
      }),
    })

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      budda: 46,
      magik: 23,
      shitBro: null,
      babu: false,
      friends: null,
    })
  })

  it('should compute state and give them to select state as last args', () => {
    const p1 = rjPlugin({
      selectors: () => ({
        getBuddy: () => 23,
        getMagic: () => 23,
      }),
    })
    const maRjState = rj(p1, {
      effect: () => Promise.resolve(1312),
      computed: {
        budda: 'getBuddy',
        magik: 'getMagic',
        babu: 'isLoading',
        friends: 'getData',
        shitBro: 'getError',
      },
      selectors: ({ getBuddy }) => ({
        getBuddy: () => getBuddy() * 2,
      }),
    })

    const { result } = renderHook(() =>
      useRj(maRjState, (state, selectors, computedState) => ({
        buddaTek: computedState.magik,
        waiting: selectors.isLoading(state),
      }))
    )

    expect(result.current[0]).toEqual({
      buddaTek: 23,
      waiting: false,
    })
  })

  it('should compute state using given computed config ... and permit inline selctor function', () => {
    const p1 = rjPlugin({
      selectors: () => ({
        getBuddy: () => 23,
        getMagic: () => 23,
      }),
    })
    const maRjState = rj(p1, {
      effect: () => Promise.resolve(1312),
      combineReducers: {
        abra: (s) => ['X'],
      },
      computed: {
        budda: 'getBuddy',
        magik: 'getMagic',
        babu: 'isLoading',
        friends: 'getData',
        shitBro: 'getError',
        gang: (s) => s.abra,
      },
      selectors: ({ getBuddy }) => ({
        getBuddy: () => getBuddy() * 2,
      }),
    })

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      budda: 46,
      magik: 23,
      shitBro: null,
      babu: false,
      friends: null,
      gang: ['X'],
    })
  })

  it('should create a per-instance version of selectors to enable good memoization', () => {
    const mySelector = jest
      .fn()
      .mockImplementation((n) => (n === 0 ? 0 : n + 1300))

    interface RootStateBeat extends RjStateRootShape {
      beat: number
      data: number
    }
    const maRjState = rj(
      rjPlugin({
        composeReducer: (prevState: RjStateRootShape | RootStateBeat, action) : RootStateBeat => {
          if (action.type === INIT) {
            return {
              ...prevState,
              data: 0,
              beat: 0,
            }
          }
          if (action.type === 'GANG') {
            return {
              ...prevState as RootStateBeat,
              data: Number(action.payload) + prevState.data,
            }
          }
          if (action.type === 'CHARLIE') {
            return {
              ...prevState,
              beat: (prevState as RootStateBeat).beat + 1,
            }
          }
          return prevState as RootStateBeat
        },
        actions: () => ({
          gang: (n) => ({ type: 'GANG', payload: n }),
          charlie: () => ({ type: 'CHARLIE' }),
        }),
        selectors: ({ getData }) => {
          const memoSelector = memoize(mySelector)
          return { getMaik: (state) => memoSelector(getData(state)) }
        },
      }),
      () => Promise.resolve(1312)
    )

    const { result: resultA } = renderHook(() =>
      useRj(maRjState, (state, { getMaik, getRoot }) => ({
        friends: getMaik(state),
        beat: getRoot(state).beat,
      }))
    )
    const { result: resultB } = renderHook(() =>
      useRj(maRjState, (state, { getMaik, getRoot }) => ({
        friends: getMaik(state),
        beat: getRoot(state).beat,
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
    act(() => {
      resultA.current[1].gang(12)
    })

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
    act(() => {
      resultA.current[1].charlie()
    })

    // Ma FUCKING A MEMO GANG!!!!
    expect(mySelector).toHaveBeenCalledTimes(3)
    expect(resultA.current[0]).toEqual({
      friends: 1312,
      beat: 1,
    })

    // Break memo B
    act(() => {
      resultB.current[1].gang(12)
    })

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
    act(() => {
      resultA.current[1].charlie()
    })

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
      useRj(rj() as any)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj({} as any)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj(23 as any)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj(undefined as any)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to useRj/
    )
  })

  it('should provide a good state observable', async () => {
    let resolves: any[] = []
    const mockFn = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolves[0] = resolve
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolves[1] = resolve
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolves[2] = resolve
          })
      )

    const testMaState = jest.fn()

    const rjStateObserver = rjPlugin({
      effectPipeline: (action$, state$) => {
        return action$.pipe(
          withLatestFrom(state$),
          map(([action, state]) => {
            testMaState(state)
            return action
          })
        )
      },
    })
    const maRjState = rj(rjStateObserver, mockFn)

    const { result } = renderHook(() =>
      useRj(maRjState, (state, { getData }) => ({
        pending: state.root.pending,
        friends: getData(state),
      }))
    )

    await act(async () => {
      result.current[1].run()
    })
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(testMaState).nthCalledWith(1, {
      root: {
        pending: false,
        data: null,
        error: null,
      },
    })
    await act(async () => {
      result.current[1].run()
    })
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(testMaState).nthCalledWith(2, {
      root: {
        pending: true,
        data: null,
        error: null,
      },
    })
    await act(async () => {
      resolves[0]('LuX')
      resolves[1]('Albi1312')
    })
    await act(async () => {
      result.current[1].run()
    })
    expect(testMaState).nthCalledWith(3, {
      root: {
        pending: false,
        data: 'Albi1312',
        error: null,
      },
    })
  })

  it('should mantein the same return instance while state remain the same', () => {
    const MaRjState = rj(() => Promise.resolve(23))

    const { result, rerender } = renderHook(() => useRj(MaRjState))

    let out = result.current

    rerender({ giova: 23 })

    expect(out).toBe(result.current)
  })

  it('should call onSucces when a RUN success', async () => {
    const mockEffect = jest
      .fn()
      .mockResolvedValueOnce('GANG')
      .mockResolvedValueOnce('13')
    const MaRjState = rj({
      effect: mockEffect,
    })
    const mockOnSuccess = jest.fn()

    const { result } = renderHook(() => useRj(MaRjState))

    await act(async () => {
      result.current[1].run.onSuccess(mockOnSuccess).run()
    })

    expect(mockEffect).toBeCalledTimes(1)
    await mockEffect.mock.results[0].value

    expect(mockOnSuccess).nthCalledWith(1, 'GANG')

    await act(async () => {
      result.current[1].run.onSuccess(mockOnSuccess).run()
    })

    expect(mockEffect).toBeCalledTimes(2)
    await mockEffect.mock.results[1].value
    expect(mockOnSuccess).nthCalledWith(2, '13')
  })

  it('should call onFailure when a RUN failure', async () => {
    const mockEffect = jest
      .fn()
      .mockRejectedValueOnce('GANG')
      .mockRejectedValueOnce('13')
    const MaRjState = rj({
      effect: mockEffect,
    })
    const mockOnFailure = jest.fn()

    const { result } = renderHook(() => useRj(MaRjState))

    await act(async () => {
      result.current[1].run.onFailure(mockOnFailure).run()
    })

    expect(mockEffect).toBeCalledTimes(1)
    try {
      await mockEffect.mock.results[0].value
    } catch (e) {}

    expect(mockOnFailure).nthCalledWith(1, 'GANG')

    await act(async () => {
      result.current[1].run.onFailure(mockOnFailure).run()
    })

    expect(mockEffect).toBeCalledTimes(2)
    try {
      await mockEffect.mock.results[1].value
    } catch (e) {}
    expect(mockOnFailure).nthCalledWith(2, '13')
  })

  test.todo('Test actions')

  test.todo('Test pipe into custom effect action')
})
