import multiMuation from '../multi'
import rj from '../../../rj'
import useRj from '../../../useRj'
import { renderHook, act } from '@testing-library/react-hooks'

describe('Rj multi mutation', () => {
  it('should be handle multi side effect per time', async () => {
    const resolves = []
    const rejects = []
    const mockEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolves.push(resolve)
          rejects.push(reject)
        })
    )

    const MaRjState = rj({
      mutations: {
        submitForm: multiMuation((p) => p, {
          effect: mockEffect,
          updater: () => {},
        }),
      },
      effect: () => {},
      computed: {
        submitFormState: '@mutation.submitForm',
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
