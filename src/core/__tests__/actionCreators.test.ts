import rj from '../rj'
import { RUN, CLEAN, CANCEL, UPDATE_DATA } from '../actions/actionTypes'
import { isEffectAction } from '../actions/effectAction'

describe('React-RocketJump action creators', () => {
  it('should produce default actions', () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
    })
    const { actionCreators } = obj
    expect(actionCreators).toHaveProperty('run')
    expect(actionCreators).toHaveProperty('clean')
    expect(actionCreators).toHaveProperty('cancel')
    expect(actionCreators).toHaveProperty('updateData')
  })

  it('should produce a good run action', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
    })
    const { actionCreators } = obj
    const action = actionCreators.run(1, 'a', {}, undefined)

    expect(action).toEqual({
      type: RUN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })

  it('should produce a good clean action', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
    })
    const { actionCreators } = obj
    const action = actionCreators.clean(1, 'a', {}, undefined)

    expect(action).toEqual({
      type: CLEAN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })

  it('should produce a good cancel action', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
    })
    const { actionCreators } = obj
    const action = actionCreators.cancel(1, 'a', {}, undefined)

    expect(action).toEqual({
      type: CANCEL,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })

  it('should produce a good updateData action', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
    })
    const { actionCreators } = obj
    const action = actionCreators.updateData({ name: 'GioVa23' })

    expect(action).toEqual({
      type: UPDATE_DATA,
      payload: { name: 'GioVa23' },
    })
    expect(isEffectAction(action)).toBe(false)
  })

  it('should allow action proxying', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
      actions: ({ run }) => ({
        run: (id: number) => run(id * 2),
      }),
    })
    const { actionCreators } = obj
    const action = actionCreators.run(33)

    expect(action).toEqual({
      type: RUN,
      payload: {
        params: [66],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })

  it('should allow action definition', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
      actions: ({ run }) => ({
        runDouble: (id: number) => run(id * 2),
      }),
    })
    const { actionCreators } = obj
    const action = actionCreators.runDouble(33)

    expect(action).toEqual({
      type: RUN,
      payload: {
        params: [66],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })

  it('should allow meta management inside', async () => {
    const obj = rj({
      effect: () => Promise.resolve(99),
      actions: ({ run }) => ({
        runDouble: (id: number) => run(id * 2).withMeta({ giova: 23 }),
      }),
    })
    const { actionCreators } = obj
    const action = actionCreators.runDouble(33)

    expect(action).toEqual({
      type: RUN,
      payload: {
        params: [66],
      },
      meta: {
        giova: 23
      },
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
      extend: expect.any(Function),
      withMeta: expect.any(Function),
    })
    expect(isEffectAction(action)).toBe(true)
  })
})
