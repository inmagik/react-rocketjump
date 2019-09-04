import ConfigureRj from '../ConfigureRj'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { renderHook } from '@testing-library/react-hooks'
import { rj } from '..'
import useRj from '../useRj'

describe('ConfigureRj', () => {
  it('should inject the effect caller', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)

    const maRjState = rj({
      effect: mockEffect,
      effectCaller: rj.configured(),
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
  it(
    'should use the default effectCaller when no rj.configured() in rj config even ' +
      'if the ConfigureRj effectCaller is present',
    async () => {
      const mockEffect = jest.fn().mockResolvedValue(23)
      const mockEffectCaller = jest.fn().mockResolvedValue(1312)

      const maRjState = rj({
        effect: mockEffect,
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
    }
  )
  it('should inject the effect caller in specific placeholder postion and preserve the rj composition', async () => {
    const mockEffect = jest.fn().mockResolvedValue(['Rinne'])

    const callerA = jest.fn((fn, ...args) => {
      return fn(...args).then(a => a.concat('Giova'))
    })
    const callerB = jest.fn((fn, ...args) => {
      return fn(...args).then(a => a.concat('Skaffo'))
    })
    const callerC = jest.fn((fn, ...args) => {
      return fn(...args).then(a => a.concat('Nonno'))
    })

    const maRjState = rj(
      {
        effectCaller: callerA,
      },
      {
        effectCaller: callerB,
      },
      {
        effect: mockEffect,
        effectCaller: rj.configured(),
      }
    )

    function Wrapper({ children }) {
      return <ConfigureRj effectCaller={callerC}>{children}</ConfigureRj>
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

    expect(result.current[0]).toEqual({
      data: ['Rinne', 'Nonno', 'Skaffo', 'Giova'],
    })

    const maRjState2 = rj(
      {
        effectCaller: callerA,
      },
      {
        effectCaller: rj.configured(),
      },
      {
        effect: mockEffect,
        effectCaller: callerB,
      }
    )

    const { result: result2 } = renderHook(
      () =>
        useRj(maRjState2, (state, { getData }) => ({
          data: getData(state),
        })),
      {
        wrapper: Wrapper,
      }
    )

    await act(async () => {
      result2.current[1].run()
    })

    expect(result2.current[0]).toEqual({
      data: ['Rinne', 'Skaffo', 'Nonno', 'Giova'],
    })
  })
  test.todo('Test also with connectRj')
  test.todo('Testing malconfigured placeholder vs configured')
})
