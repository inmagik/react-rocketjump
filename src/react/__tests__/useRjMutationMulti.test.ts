import rj from '../../core/rj'
import useRj from '../useRj'
import { renderHook, act } from '@testing-library/react-hooks'

describe('useRj with multi mutation', () => {
  it('should be handle multi side effect per time', async () => {
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
        submitForm: rj.mutation.multi((p) => p, {
          effect: mockEffect,
          updater: () => {},
        }),
      },
      effect: () => Promise.resolve(99),
      computed: {
        submitFormState: s => s.mutations.submitForm,
      },
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(result.current[0].submitFormState).toEqual({
      pendings: {},
      errors: {},
    })

    await act(async () => {
      result.current[1].submitForm(23)
    })
    expect(mockEffect).toHaveBeenCalledTimes(1)

    expect(result.current[0].submitFormState).toEqual({
      pendings: {
        23: true,
      },
      errors: {},
    })

    await act(async () => {
      result.current[1].submitForm(23)
    })
    expect(mockEffect).toHaveBeenCalledTimes(1)
    expect(result.current[0].submitFormState).toEqual({
      pendings: {
        23: true,
      },
      errors: {},
    })

    await act(async () => {
      result.current[1].submitForm(777)
    })
    expect(mockEffect).toHaveBeenCalledTimes(2)
    expect(result.current[0].submitFormState).toEqual({
      pendings: {
        23: true,
        777: true,
      },
      errors: {},
    })

    await act(async () => {
      resolves[0]('Socio')
    })
    expect(result.current[0].submitFormState).toEqual({
      pendings: {
        777: true,
      },
      errors: {},
    })

    await act(async () => {
      resolves[1]('Matto')
    })
    expect(result.current[0].submitFormState).toEqual({
      pendings: {},
      errors: {},
    })

    await act(async () => {
      result.current[1].submitForm(1312)
    })
    expect(mockEffect).toHaveBeenCalledTimes(3)
    expect(result.current[0].submitFormState).toEqual({
      pendings: {
        1312: true,
      },
      errors: {},
    })

    await act(async () => {
      rejects[2]('Bleah')
    })
    expect(result.current[0].submitFormState).toEqual({
      pendings: {},
      errors: {
        1312: 'Bleah',
      },
    })
  })
})
