import React, { FunctionComponent } from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import rj from '../../core/rj'
import { Action, Reducer } from '../../core/types'
import connectRj from '../connectRj'

describe('React-RocketJump connectRj actions', () => {
  const makeActionObserver = (
    oldReducer: Reducer,
    arrayLog: Action[],
    types: string[]
  ) => {
    return (state: any, action: Action) => {
      if (types.indexOf(action.type) >= 0) {
        arrayLog.push(action)
      }
      oldReducer(state, action)
    }
  }

  it('should allow action renaming', () => {
    const rjState = rj({
      effect: () => Promise.resolve([{ id: 1, name: 'admin' }]),
    })

    const Component: FunctionComponent = (props) => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      fetchTodos: run,
      cleanTodos: clean,
    }))(Component)

    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)

    expect(wrapper.props).toHaveProperty('fetchTodos')
    expect(wrapper.props).toHaveProperty('cleanTodos')
    expect(wrapper.props).not.toHaveProperty('run')
    expect(wrapper.props).not.toHaveProperty('clean')
  })

  it('should allow plain actions', async () => {
    const actionLog: Action[] = []

    const obj = rj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
    })

    const Component: FunctionComponent = (props) => null

    const RjComponent = connectRj(obj, undefined, ({ run, clean }) => ({
      run,
      clean,
      custom: () => ({ type: 'CUSTOM' }),
    }))(Component)

    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)

    await act(async () => {
      wrapper.props.custom()
    })

    expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  })

  it('should allow builder on plain action (without success indeed)', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
    })

    const Component: FunctionComponent = (props) => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      run,
      clean,
      custom: () => ({ type: 'CUSTOM' }),
    }))(Component)

    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)

    const onSuccess = jest.fn()

    await act(async () => {
      wrapper.props.custom.onSuccess(onSuccess).run()
    })

    expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('should allow promises on plain actions (even if useless)', async () => {
    const actionLog: Action[] = []

    const rjState = rj({
      effect: (id, name) => Promise.resolve([{ id: id + 7, name: name }]),
      reducer: (oldReducer) =>
        makeActionObserver(oldReducer, actionLog, ['CUSTOM']),
    })

    const Component: FunctionComponent = (props) => null

    const RjComponent = connectRj(rjState, undefined, ({ run, clean }) => ({
      run,
      clean,
      custom: () => ({ type: 'CUSTOM' }),
    }))(Component)

    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)

    await act(async () => {
      const p = wrapper.props.custom.asPromise()
      expect(p).toBeInstanceOf(Promise)
    })

    expect(actionLog[0]).toEqual({ type: 'CUSTOM' })
  })
})
