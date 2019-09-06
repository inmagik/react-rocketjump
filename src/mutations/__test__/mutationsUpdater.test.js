import rj from '../../rj'
import useRj from '../../useRj'
import { renderHook, act } from '@testing-library/react-hooks'

describe('RJ mutations updater', () => {
  it('should be called on mutation SUCCESS with current rj state and the effect result', async () => {
    const mockUpdater = jest.fn()

    const MaRjState = rj({
      mutations: {
        muta: {
          effect: (shouldResolve = true) =>
            shouldResolve ? Promise.resolve(23) : Promise.reject(false),
          updater: mockUpdater,
        },
      },
      effect: () => {},
    })

    const { result } = renderHook(() => useRj(MaRjState))
    expect(mockUpdater).not.toHaveBeenCalled()
    await act(async () => {
      result.current[1].muta()
    })
    expect(mockUpdater).toHaveBeenNthCalledWith(
      1,
      {
        data: null,
        error: null,
        pending: false,
      },
      23
    )
    await act(async () => {
      result.current[1].muta(false)
    })
    expect(mockUpdater).toBeCalledTimes(1)
  })
})
