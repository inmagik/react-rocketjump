import { tap } from 'rxjs/operators'
import rj from '../../rj'
import { RUN, SUCCESS, PENDING } from '../../actionTypes'
import { createTestRJSubscription } from '../../testUtils'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations side effect model', () => {
  it('should be use take effect every by default', async () => {
    const mockCallback = jest.fn()
    const resolvesA = []
    const mockEffectA = jest.fn(() => new Promise((r) => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise((r) => resolvesB.push(r)))

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          updater: () => {},
        },
        mutationB: {
          effect: mockEffectB,
          updater: () => {},
        },
      },
      effect: () => {},
    })

    const subject = createTestRJSubscription(RjObject, mockCallback)

    subject.next({
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    subject.next({
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: ['4LB1'] },
      meta: {},
      callbacks: {},
    })
    expect(mockEffectA).toHaveBeenCalledTimes(2)
    expect(mockEffectB).toHaveBeenCalledTimes(0)
    expect(mockCallback).toHaveBeenCalledTimes(4)
    expect(mockCallback).nthCalledWith(1, {
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockCallback).nthCalledWith(2, {
      type: `${MUTATION_PREFIX}/mutationA/${PENDING}`,
      meta: {},
    })
    expect(mockCallback).nthCalledWith(3, {
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: ['4LB1'] },
      meta: {},
      callbacks: {},
    })
    expect(mockCallback).nthCalledWith(4, {
      type: `${MUTATION_PREFIX}/mutationA/${PENDING}`,
      meta: {},
    })

    subject.next({
      type: `${MUTATION_PREFIX}/mutationB/RUN`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockEffectA).toHaveBeenCalledTimes(2)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledTimes(6)
    expect(mockCallback).nthCalledWith(5, {
      type: `${MUTATION_PREFIX}/mutationB/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockCallback).nthCalledWith(6, {
      type: `${MUTATION_PREFIX}/mutationB/${PENDING}`,
      meta: {},
    })

    resolvesA[0]('Fumello')
    await mockEffectA.mock.results[0].value
    expect(mockCallback).toHaveBeenCalledTimes(7)
    expect(mockCallback).nthCalledWith(7, {
      type: `${MUTATION_PREFIX}/mutationA/${SUCCESS}`,
      payload: { params: [], data: 'Fumello' },
      meta: {},
    })

    resolvesB[0](1312)
    await mockEffectB.mock.results[0].value
    expect(mockCallback).toHaveBeenCalledTimes(8)
    expect(mockCallback).nthCalledWith(8, {
      type: `${MUTATION_PREFIX}/mutationB/${SUCCESS}`,
      payload: { params: [], data: 1312 },
      meta: {},
    })

    resolvesA[1](23)
    await mockEffectA.mock.results[1].value
    expect(mockCallback).toHaveBeenCalledTimes(9)
    expect(mockCallback).nthCalledWith(9, {
      type: `${MUTATION_PREFIX}/mutationA/${SUCCESS}`,
      payload: { params: ['4LB1'], data: 23 },
      meta: {},
    })
  })

  it('should be use a custom take effect when specified', async () => {
    const mockCallback = jest.fn()
    const resolvesA = []
    const mockEffectA = jest.fn(() => new Promise((r) => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise((r) => resolvesB.push(r)))

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          takeEffect: 'exhaust',
          updater: () => {},
        },
        mutationB: {
          effect: mockEffectB,
          updater: () => {},
        },
      },
      effect: () => {},
    })

    const subject = createTestRJSubscription(RjObject, mockCallback)

    subject.next({
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    subject.next({
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: ['4LB1'] },
      meta: {},
      callbacks: {},
    })
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(0)
    expect(mockCallback).toHaveBeenCalledTimes(2)
    expect(mockCallback).nthCalledWith(1, {
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockCallback).nthCalledWith(2, {
      type: `${MUTATION_PREFIX}/mutationA/${PENDING}`,
      meta: {},
    })

    subject.next({
      type: `${MUTATION_PREFIX}/mutationB/RUN`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledTimes(4)
    expect(mockCallback).nthCalledWith(3, {
      type: `${MUTATION_PREFIX}/mutationB/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })
    expect(mockCallback).nthCalledWith(4, {
      type: `${MUTATION_PREFIX}/mutationB/${PENDING}`,
      meta: {},
    })

    resolvesA[0]('Fumello')
    await mockEffectA.mock.results[0].value
    expect(mockCallback).toHaveBeenCalledTimes(5)
    expect(mockCallback).nthCalledWith(5, {
      type: `${MUTATION_PREFIX}/mutationA/${SUCCESS}`,
      payload: { params: [], data: 'Fumello' },
      meta: {},
    })

    resolvesB[0](1312)
    await mockEffectB.mock.results[0].value
    expect(mockCallback).toHaveBeenCalledTimes(6)
    expect(mockCallback).nthCalledWith(6, {
      type: `${MUTATION_PREFIX}/mutationB/${SUCCESS}`,
      payload: { params: [], data: 1312 },
      meta: {},
    })
  })

  it('should apply the mutation effect caller', (done) => {
    const mockApi = jest.fn().mockResolvedValue(['GioVa'])
    const mockCallback = jest.fn()

    const callerA = jest.fn((fn, ...args) => {
      return fn(...args).then((a) => a.concat('Skaffo'))
    })

    const RjObject = rj({
      mutations: {
        killHumans: {
          effect: mockApi,
          updater: () => {},
          effectCaller: callerA,
        },
      },
      effect: () => {},
    })

    const subject = createTestRJSubscription(RjObject, mockCallback)

    subject.next({
      type: `${MUTATION_PREFIX}/killHumans/${RUN}`,
      payload: { params: [] },
      meta: {},
    })

    expect(callerA).toHaveBeenCalled()
    callerA.mock.results[0].value.then(() => {
      expect(mockCallback).toBeCalledTimes(3)

      expect(mockCallback).nthCalledWith(1, {
        type: `${MUTATION_PREFIX}/killHumans/${RUN}`,
        payload: { params: [] },
        meta: {},
      })

      expect(mockCallback).nthCalledWith(2, {
        type: `${MUTATION_PREFIX}/killHumans/${PENDING}`,
        meta: {},
      })

      expect(mockCallback).nthCalledWith(3, {
        type: `${MUTATION_PREFIX}/killHumans/${SUCCESS}`,
        meta: {},
        payload: {
          params: [],
          data: ['GioVa', 'Skaffo'],
        },
      })

      done()
    })
  })

  it('should run side effects of rx only once', async () => {
    const mockEffectA = jest.fn().mockResolvedValue(23)
    const mockEffectB = jest.fn().mockResolvedValue(23)
    const mockEffect = jest.fn().mockResolvedValue(23)
    const mockTap = jest.fn()
    const mockCallback = jest.fn()

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          updater: () => {},
        },
        mutationB: {
          effect: mockEffectB,
          updater: () => {},
        },
      },
      effectPipeline: (action$) => {
        return action$.pipe(tap(mockTap))
      },
      effect: mockEffect,
    })

    const subject = createTestRJSubscription(RjObject, mockCallback)

    subject.next({
      type: `${MUTATION_PREFIX}/mutationA/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })

    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(0)
    expect(mockEffect).toHaveBeenCalledTimes(0)
    expect(mockTap).toHaveBeenCalledTimes(1)

    subject.next({
      type: `${MUTATION_PREFIX}/mutationB/${RUN}`,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })

    expect(mockTap).toHaveBeenCalledTimes(2)
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(mockEffect).toHaveBeenCalledTimes(0)

    subject.next({
      type: RUN,
      payload: { params: [] },
      meta: {},
      callbacks: {},
    })

    expect(mockTap).toHaveBeenCalledTimes(3)
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(mockEffect).toHaveBeenCalledTimes(1)
  })
})
