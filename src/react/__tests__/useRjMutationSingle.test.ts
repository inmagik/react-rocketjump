import rj from '../../core/rj'
import useRj from '../useRj'
import { renderHook, act } from '@testing-library/react-hooks'

describe('useRj with single mutation', () => {
  it('should be handle one side effect per time', async () => {
    const resolves: any[] = []
    const rejects: any[] = []
    const mockEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolves.push(resolve)
          rejects.push(reject)
        })
    )

    const MaRjState = rj({
      mutations: {
        submitForm: rj.mutation.single({
          effect: mockEffect,
          updater: () => {},
        }),
      },
      effect: () => Promise.resolve(23),
      computed: {
        submitFormState: (s) => s.mutations.submitForm,
      },
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[0].submitFormState).toEqual({
      pending: false,
      error: null,
    })

    await act(async () => {
      result.current[1].submitForm()
    })
    expect(mockEffect).toHaveBeenCalledTimes(1)
    expect(result.current[0].submitFormState).toEqual({
      pending: true,
      error: null,
    })

    await act(async () => {
      result.current[1].submitForm()
    })
    expect(mockEffect).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolves[0]()
    })
    expect(result.current[0].submitFormState).toEqual({
      pending: false,
      error: null,
    })

    await act(async () => {
      result.current[1].submitForm()
    })
    expect(mockEffect).toHaveBeenCalledTimes(2)
    expect(result.current[0].submitFormState).toEqual({
      pending: true,
      error: null,
    })
    await act(async () => {
      rejects[1]('Culo')
    })
    expect(result.current[0].submitFormState).toEqual({
      pending: false,
      error: 'Culo',
    })
  })
})
