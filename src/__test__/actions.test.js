import React from 'react'
import { act } from 'react-dom/test-utils'
import { rj as reactRj, connectRj } from '..'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { RUN, CLEAN, CANCEL, SUCCESS } from '../actionTypes'
import { isEffectAction } from '../actionCreators'

Enzyme.configure({ adapter: new Adapter() })

describe('React-RocketJump actions', () => {
  const makeRjComponent = rjState => {
    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    return mount(<RjComponent />).find(Component)
  }

  const makeActionObserver = (oldReducer, arrayLog, types) => {
    return (state, action) => {
      if (types.indexOf(action.type) >= 0) {
        arrayLog.push(action)
      }
      oldReducer(state, action)
    }
  }

  it('should produce default actions', () => {
    const rjState = reactRj(() => Promise.resolve([{ id: 1, name: 'admin' }]))

    const wrapper = makeRjComponent(rjState)

    expect(wrapper.props()).toHaveProperty('run')
    expect(wrapper.props()).toHaveProperty('clean')
    expect(wrapper.props()).toHaveProperty('cancel')
  })

  it('should produce a good run action', () => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const wrapper = makeRjComponent(rjState)

    wrapper.prop('run')(1, 'a', {}, undefined)

    expect(actionLog[0]).toEqual({
      type: RUN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should produce a good clean action', () => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [CLEAN]),
    })

    const wrapper = makeRjComponent(rjState)

    wrapper.prop('clean')(1, 'a', {}, undefined)

    expect(actionLog[0]).toEqual({
      type: CLEAN,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should produce a good cancel action', () => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [CANCEL]),
    })

    const wrapper = makeRjComponent(rjState)

    wrapper.prop('cancel')(1, 'a', {}, undefined)

    expect(actionLog[0]).toEqual({
      type: CANCEL,
      payload: {
        params: [1, 'a', {}, undefined],
      },
      meta: {},
      callbacks: {
        onSuccess: undefined,
        onFailure: undefined,
      },
    })
    expect(isEffectAction(actionLog[0])).toBe(true)
  })

  it('should expose builder', () => {
    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const wrapper = makeRjComponent(rjState)

    expect(wrapper.prop('run')).toHaveProperty('onSuccess')
    expect(wrapper.prop('run')).toHaveProperty('onFailure')
    expect(wrapper.prop('run')).toHaveProperty('withMeta')
    expect(wrapper.prop('run')).toHaveProperty('run')
  })

  it('should now allow direct run invocation', () => {
    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const wrapper = makeRjComponent(rjState)

    expect(() => wrapper.prop('run').run()).toThrow()
  })

  it('should use onSuccess', async () => {
    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const wrapper = makeRjComponent(rjState)

    const onSuccess = jest.fn()

    await act(async () => {
      wrapper
        .prop('run')
        .onSuccess(onSuccess)
        .run()
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should use onFailure', async () => {
    const rjState = reactRj({
      effect: () => Promise.reject(),
    })

    const wrapper = makeRjComponent(rjState)

    const onFailure = jest.fn()

    await act(async () => {
      wrapper
        .prop('run')
        .onFailure(onFailure)
        .run()
    })
    expect(onFailure).toHaveBeenCalledTimes(1)
  })

  it('should use plain meta data', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const wrapper = makeRjComponent(rjState)

    const onSuccess = () => {
      expect(actionLog[0].meta).toEqual({ a: 1 })
      done()
    }

    wrapper
      .prop('run')
      .withMeta({ a: 1 })
      .onSuccess(onSuccess)
      .run()
  })

  it('should compose plain meta data', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const wrapper = makeRjComponent(rjState)

    const onSuccess = () => {
      expect(actionLog[0].meta).toEqual({ a: 2, b: 2, c: 3 })
      done()
    }

    wrapper
      .prop('run')
      .withMeta({ a: 1 })
      .withMeta({ b: 2 })
      .withMeta({ a: 2, c: 3 })
      .onSuccess(onSuccess)
      .run()
  })

  it('should use meta data transform', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const wrapper = makeRjComponent(rjState)

    const onSuccess = () => {
      expect(actionLog[0].meta).toEqual({})
      done()
    }

    wrapper
      .prop('run')
      .withMeta({ a: 1 })
      .withMeta(() => ({}))
      .onSuccess(onSuccess)
      .run()
  })

  it('should use meta data transform correctly', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
      reducer: oldReducer => makeActionObserver(oldReducer, actionLog, [RUN]),
    })

    const wrapper = makeRjComponent(rjState)

    const onSuccess = () => {
      expect(actionLog[0].meta).toEqual({ a: 2, b: 1 })
      done()
    }

    wrapper
      .prop('run')
      .withMeta({ a: 1 })
      .withMeta(oldMeta => ({ b: oldMeta.a, a: 2 }))
      .onSuccess(onSuccess)
      .run()
  })

  it('should allow action renaming', () => {
    const rjState = reactRj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      fetchTodos: run,
      cleanTodos: clean,
    }))(Component)

    const wrapper = shallow(<RjComponent />).find(Component)

    expect(wrapper.props()).toHaveProperty('fetchTodos')
    expect(wrapper.props()).toHaveProperty('cleanTodos')
    expect(wrapper.props()).not.toHaveProperty('run')
    expect(wrapper.props()).not.toHaveProperty('clean')
  })

  it('should allow action proxying', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: id => Promise.resolve([{ id: id + 7, name: 'admin' }]),
      actions: ({ run }) => ({
        run: id => run(id * 2),
      }),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = () => {
      expect(actionLog[0]).toEqual({
        type: 'SUCCESS',
        meta: {},
        payload: {
          data: [{ id: 9, name: 'admin' }],
          params: [2],
        },
      })
      done()
    }

    wrapper
      .prop('run')
      .onSuccess(onSuccess)
      .run(1)
  })

  it('should allow action definition', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: id => Promise.resolve([{ id: id + 7, name: 'admin' }]),
      actions: ({ run }) => ({
        runDouble: id => run(id * 2),
      }),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = () => {
      expect(actionLog[0]).toEqual({
        type: 'SUCCESS',
        meta: {},
        payload: {
          data: [{ id: 9, name: 'admin' }],
          params: [2],
        },
      })
      done()
    }

    expect(wrapper.props()).toHaveProperty('run')
    expect(wrapper.props()).toHaveProperty('runDouble')

    wrapper
      .prop('runDouble')
      .onSuccess(onSuccess)
      .run(1)
  })

  it('should allow action signature change', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: object => run(object.id, object.name),
      }),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = () => {
      expect(actionLog[0]).toEqual({
        type: 'SUCCESS',
        meta: {},
        payload: {
          data: [{ id: 8, name: 'admin' }],
          params: [1, 'admin'],
        },
      })
      done()
    }

    wrapper
      .prop('runObject')
      .onSuccess(onSuccess)
      .run({ id: 1, name: 'admin' })
  })

  it('should allow meta management inside', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: object => run(object.id, object.name).withMeta({ z: 1 }),
      }),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = () => {
      expect(actionLog[0]).toEqual({
        type: 'SUCCESS',
        meta: { z: 1 },
        payload: {
          data: [{ id: 8, name: 'admin' }],
          params: [1, 'admin'],
        },
      })
      done()
    }

    wrapper
      .prop('runObject')
      .onSuccess(onSuccess)
      .run({ id: 1, name: 'admin' })
  })

  it('should allow meta transform inside', done => {
    const actionLog = []

    const rjState = reactRj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      actions: ({ run }) => ({
        runObject: object =>
          run(object.id, object.name)
            .withMeta({ z: 1 })
            .withMeta(({ z }) => ({ x: z })),
      }),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, [SUCCESS]),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState)(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = () => {
      expect(actionLog[0]).toEqual({
        type: 'SUCCESS',
        meta: { x: 1 },
        payload: {
          data: [{ id: 8, name: 'admin' }],
          params: [1, 'admin'],
        },
      })
      done()
    }

    wrapper
      .prop('runObject')
      .onSuccess(onSuccess)
      .run({ id: 1, name: 'admin' })
  })

  it('should allow plain actions', () => {
    const actionLog = []

    const rjState = reactRj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      run,
      clean,
      custom: () => ({ type: 'CUSTOM' }),
    }))(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    wrapper.prop('custom')()

    expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  })

  it('should allow builder on plain action (without success indeed)', () => {
    const actionLog = []

    const rjState = reactRj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      reducer: oldReducer =>
        makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
    })

    const Component = props => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      run,
      clean,
      custom: () => ({ type: 'CUSTOM' }),
    }))(Component)

    const wrapper = mount(<RjComponent />).find(Component)

    const onSuccess = jest.fn()

    wrapper
      .prop('custom')
      .onSuccess(onSuccess)
      .run()

    expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
