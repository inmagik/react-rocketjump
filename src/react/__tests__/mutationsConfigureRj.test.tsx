import ConfigureRj from '../ConfigureRj'
import React, { useState, useEffect } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { rj } from '../..'
import useRj from '../useRj'

describe('ConfigureRj with mutations', () => {
  it('should inject the effect caller in mutations', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)

    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: mockEffect,
          updater: 'updateData',
        },
      },
      effect: () => Promise.resolve(23),
      effectCaller: rj.configured(),
    })

    function Wrapper({ children }: { children: any }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: Wrapper,
    })

    await act(async () => {
      result.current[1].killHumans()
    })

    expect(mockEffect).toHaveBeenCalledTimes(0)
    expect(mockEffectCaller).toHaveBeenCalledTimes(1)
    expect(mockEffectCaller).nthCalledWith(1, mockEffect)

    expect(result.current[0]).toEqual({
      pending: false,
      error: null,
      data: 1312,
    })
  })
  it('should inject the effect caller in mutations unless defined in mutation', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)
    const mutationEffectCaller = jest.fn().mockResolvedValue(20900)

    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: mockEffect,
          effectCaller: mutationEffectCaller,
          updater: 'updateData',
        },
      },
      effect: () => Promise.resolve(23),
      effectCaller: rj.configured(),
    })

    function Wrapper({ children } : { children: any }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: Wrapper,
    })

    await act(async () => {
      result.current[1].killHumans()
    })

    expect(mockEffect).toHaveBeenCalledTimes(0)
    expect(mockEffectCaller).toHaveBeenCalledTimes(0)
    expect(mutationEffectCaller).toHaveBeenCalledTimes(1)
    expect(mutationEffectCaller).nthCalledWith(1, mockEffect)

    expect(result.current[0]).toEqual({
      pending: false,
      error: null,
      data: 20900,
    })
  })
  it('should inject the effect caller in mutations unless set to false in mutation', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockEffectCaller = jest.fn().mockResolvedValue(1312)

    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: mockEffect,
          effectCaller: false,
          updater: 'updateData',
        },
      },
      effect: () => Promise.resolve(23),
      effectCaller: rj.configured(),
    })

    function Wrapper({ children } : { children: any }) {
      return (
        <ConfigureRj effectCaller={mockEffectCaller}>{children}</ConfigureRj>
      )
    }

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: Wrapper,
    })

    await act(async () => {
      result.current[1].killHumans()
    })

    expect(mockEffect).toHaveBeenCalledTimes(1)
    expect(mockEffectCaller).toHaveBeenCalledTimes(0)

    expect(result.current[0]).toEqual({
      pending: false,
      error: null,
      data: 23,
    })
  })
  it('should access configured effect caller and remains in sync while updates', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)

    const maRjState = rj({
      mutations: {
        mutationA: {
          updater: (state, value) => ({ ...state, data: value }),
          effect: () => Promise.resolve(23),
        },
      },
      effect: mockEffect,
      effectCaller: rj.configured(),
    })

    function Wrapper({ children } : {children: any}) {
      const [i, setI] = useState(0)
      const caller = () => Promise.resolve(i)
      useEffect(() => {
        if (i < 1) {
          setI((i) => i + 1)
        }
      }, [i])
      // i take values 0 then 1 then stop
      return <ConfigureRj effectCaller={caller}>{children}</ConfigureRj>
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
      result.current[1].mutationA()
    })

    expect(mockEffect).toHaveBeenCalledTimes(0)

    expect(result.current[0]).toEqual({
      data: 1,
    })
  })
})
