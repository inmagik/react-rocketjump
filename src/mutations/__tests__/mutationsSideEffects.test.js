import { Subject } from 'rxjs'
import rj from '../../rj'
import { RUN, SUCCESS, PENDING } from '../../actionTypes'

const MUTATION_PREFIX = '@MUTATION'

describe('RJ mutations side effect model', () => {
  it('should be use take effect every by default', async () => {
    const mockCallback = jest.fn()
    const resolvesA = []
    const mockEffectA = jest.fn(() => new Promise(r => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise(r => resolvesB.push(r)))

    const subject = new Subject()

    const { makeRxObservable } = rj({
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

    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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
    const mockEffectA = jest.fn(() => new Promise(r => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise(r => resolvesB.push(r)))

    const subject = new Subject()

    const { makeRxObservable } = rj({
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

    makeRxObservable(subject.asObservable()).subscribe(mockCallback)

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
})
