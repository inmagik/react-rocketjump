import { rj, useRj } from '../../../'
import { renderHook, act } from '@testing-library/react-hooks'
import rjMutationsPending from '../index'

type TestResoleCb = (a?: any) => void
type HackMutationsType = Record<string, {
  resolves: TestResoleCb[]
  rejects: TestResoleCb[]
}>

describe('mutationsPending Plugin', () => {
  it('should track ALL mutations pending state', async () => {
    const mockEffect = jest.fn().mockResolvedValue(99)

    const hackMutations: HackMutationsType = {}

    const mockOneEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.one = hackMutations.one ?? { resolves: [], rejects: [] }
          hackMutations.one.resolves.push(resolve)
          hackMutations.one.rejects.push(reject)
        })
    )
    const mockTwoEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.two = hackMutations.two ?? { resolves: [], rejects: [] }
          hackMutations.two.resolves.push(resolve)
          hackMutations.two.rejects.push(reject)
        })
    )
    const mockThreeEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.three = hackMutations.three ?? {
            resolves: [],
            rejects: [],
          }
          hackMutations.three.resolves.push(resolve)
          hackMutations.three.rejects.push(reject)
        })
    )

    const maRjState = rj(rjMutationsPending(), {
      mutations: {
        one: {
          effect: mockOneEffect,
          updater: (s) => s,
        },
        two: {
          effect: mockTwoEffect,
          updater: (s) => s,
        },
        three: {
          effect: mockThreeEffect,
          updater: (s) => s,
        },
      },
      effect: mockEffect,
      computed: {
        data: 'getData',
        pending: 'isPending',
        error: 'getError',
        busy: 'anyMutationPending',
      },
    })

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })

    await act(async () => {
      result.current[1].one()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      result.current[1].one()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      hackMutations.one.resolves[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      hackMutations.one.resolves[1]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })

    await act(async () => {
      result.current[1].two()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      result.current[1].three()
    })

    await act(async () => {
      hackMutations.two.resolves[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      hackMutations.three.rejects[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })
  })

  it('should track given mutations pending state when track option is given', async () => {
    const mockEffect = jest.fn().mockResolvedValue(99)

    const hackMutations : HackMutationsType = {}

    const mockOneEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.one = hackMutations.one ?? { resolves: [], rejects: [] }
          hackMutations.one.resolves.push(resolve)
          hackMutations.one.rejects.push(reject)
        })
    )
    const mockTwoEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.two = hackMutations.two ?? { resolves: [], rejects: [] }
          hackMutations.two.resolves.push(resolve)
          hackMutations.two.rejects.push(reject)
        })
    )
    const mockThreeEffect = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          hackMutations.three = hackMutations.three ?? {
            resolves: [],
            rejects: [],
          }
          hackMutations.three.resolves.push(resolve)
          hackMutations.three.rejects.push(reject)
        })
    )

    const maRjState = rj(
      rjMutationsPending({
        track: ['one', 'two'],
      }),
      {
        mutations: {
          one: {
            effect: mockOneEffect,
            updater: (s) => s,
          },
          two: {
            effect: mockTwoEffect,
            updater: (s) => s,
          },
          three: {
            effect: mockThreeEffect,
            updater: (s) => s,
          },
        },
        effect: mockEffect,
        computed: {
          data: 'getData',
          pending: 'isPending',
          error: 'getError',
          busy: 'anyMutationPending',
        },
      }
    )

    const { result } = renderHook(() => useRj(maRjState))

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })

    await act(async () => {
      result.current[1].one()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      result.current[1].one()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      hackMutations.one.resolves[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      hackMutations.one.resolves[1]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })

    await act(async () => {
      result.current[1].two()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: true,
    })

    await act(async () => {
      result.current[1].three()
    })

    await act(async () => {
      hackMutations.two.resolves[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })

    await act(async () => {
      hackMutations.three.rejects[0]()
    })

    expect(result.current[0]).toEqual({
      data: null,
      pending: false,
      error: null,
      busy: false,
    })
  })
})
