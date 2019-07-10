import ConfigureRj from '../ConfigureRj'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { renderHook } from '@testing-library/react-hooks'
import rj from '../rj'
import useRj from '../useRj'

describe('ConfigureRj', () => {
  it('should inject the effect caller', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)

    const maRjState = rj({
      effect: mockEffect,
      // effectCaller: mockEffectCaller,
    })

    function Wrapper({ children }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          data: getData(state),
        })),
      {
        wrapper: Wrapper,
      }
    )

    await act(async () => {
      result.current[1].run()
    })

    expect(mockEffect).toHaveBeenCalledTimes(0)
    expect(mockEffectCaller).toHaveBeenCalledTimes(1)
    expect(mockEffectCaller).nthCalledWith(1, mockEffect)

    expect(result.current[0]).toEqual({
      data: 1312,
    })
  })
  it('should use the string noop as default effectCaller and bypass the ConfigureRj effectCaller', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)

    const maRjState = rj({
      effect: mockEffect,
      effectCaller: 'noop',
    })

    function Wrapper({ children }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          data: getData(state),
        })),
      {
        wrapper: Wrapper,
      }
    )

    await act(async () => {
      result.current[1].run()
    })

    expect(mockEffect).toHaveBeenCalledTimes(1)
    expect(mockEffectCaller).toHaveBeenCalledTimes(0)

    expect(result.current[0]).toEqual({
      data: 23,
    })
  })
  it('should inject the effect caller unless is provided', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)
    const mockEffectCallerRj = jest.fn().mockResolvedValue(777)

    const maRjState = rj({
      effect: mockEffect,
      effectCaller: mockEffectCallerRj,
    })

    function Wrapper({ children }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          data: getData(state),
        })),
      {
        wrapper: Wrapper,
      }
    )

    await act(async () => {
      result.current[1].run()
    })

    expect(mockEffect).toHaveBeenCalledTimes(0)
    expect(mockEffectCaller).toHaveBeenCalledTimes(0)
    expect(mockEffectCallerRj).toHaveBeenCalledTimes(1)
    expect(mockEffectCallerRj).nthCalledWith(1, mockEffect)

    expect(result.current[0]).toEqual({
      data: 777,
    })
  })
  test.todo('Test also with connectRj')
})
