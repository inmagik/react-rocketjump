/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { FunctionComponent } from 'react'
import { rj, rjPlugin, connectRj, INIT } from '.'
import { RjBaseActionCreators, Reducer, Action } from './core/types'
import rjPlainList from './plugins/plainList'
import { BoundActionCreatorsWithBuilder } from './core/actions/bindActionCreators'
import { map, withLatestFrom } from 'rxjs/operators'

function stateShape() {
  const ObjA = rj({
    effect: () => Promise.resolve(23),
  })

  const state = ObjA.reducer(undefined, { type: INIT })

  type TEST_ROOT_SHAPE = {
    data: any
    pending: boolean
    error: any
  }
  type TEST_SHAPE = {
    root: TEST_ROOT_SHAPE
  }

  const stateT: TEST_SHAPE = state

  const computedState = ObjA.computeState(state, ObjA.makeSelectors())
  const computedStateT: TEST_ROOT_SHAPE = computedState
}

function reducerExtendStateShape() {
  type BASE_ROOT_TEST_SHAPE = {
    data: any
    pending: boolean
    error: any
  }

  const ObjA = rj({
    reducer: (r) => (state, action) => {
      const stateT: BASE_ROOT_TEST_SHAPE = r(state, action)

      return {
        ...r(state, action),
        argo: 88,
      }
    },
    effect: () => Promise.resolve(23),
  })

  const state = ObjA.reducer(undefined, { type: INIT })

  type TEST_ROOT_SHAPE = {
    data: any
    pending: boolean
    error: any
    argo: number
  }
  type TEST_SHAPE = {
    root: TEST_ROOT_SHAPE
  }

  const stateT: TEST_SHAPE = state

  const computedState = ObjA.computeState(state, ObjA.makeSelectors())
  const computedStateT: TEST_ROOT_SHAPE = computedState
}

function reducerDummyCustomShape() {
  const ObjA = rj({
    reducer: (r) => (state, action) => {
      return {
        infoline: 'Budda',
        numbers: ['XXX', 'YYY'],
        legal: false,
      }
    },
    effect: () => Promise.resolve(23),
  })

  const state = ObjA.reducer(undefined, { type: INIT })

  type TEST_ROOT_SHAPE = {
    infoline: string
    numbers: string[]
    legal: boolean
  }
  type TEST_SHAPE = {
    root: TEST_ROOT_SHAPE
  }

  const stateT: TEST_SHAPE = state

  const computedState = ObjA.computeState(state, ObjA.makeSelectors())
  const computedStateT: TEST_ROOT_SHAPE = computedState
}

function reducerTypedCustomShape() {
  interface ActionGang extends Action<'GANG'> {
    gang: number
  }

  function oldMyReducer(
    state: string[] | undefined = [],
    action: Action | ActionGang
  ): string[] {
    if (action.type === 'GANG') {
      // TODO: If Action will only a uniono this explict check can be avoided....
      return state.concat((action as ActionGang).gang.toFixed(2))
    }
    return state
  }

  const ObjA = rj({
    reducer: (r) => oldMyReducer,
    effect: () => Promise.resolve(23),
  })

  const state = ObjA.reducer(undefined, { type: INIT })

  type TEST_ROOT_SHAPE = string[]
  type TEST_SHAPE = {
    root: TEST_ROOT_SHAPE
  }

  const stateT: TEST_SHAPE = state

  const computedState = ObjA.computeState(state, ObjA.makeSelectors())
  const computedStateT: TEST_ROOT_SHAPE = computedState
}

function reducerExtendStateShapeWithPlugin() {
  type BASE_ROOT_TEST_SHAPE = {
    data: any
    pending: boolean
    error: any
  }

  const pluginA = rjPlugin({
    reducer: (r) => (state, action) => {
      const stateT: BASE_ROOT_TEST_SHAPE = r(state, action)

      return {
        ...r(state, action),
        mrmax: { business: true },
      }
    },
  })

  type WITH_P1_ROOT_TEST_SHAPE = {
    data: any
    pending: boolean
    error: any
    mrmax: { business: boolean }
  }

  const ObjA = rj(pluginA, {
    reducer: (r) => (state, action) => {
      const stateT: WITH_P1_ROOT_TEST_SHAPE = r(state, action)

      return {
        ...r(state, action),
        argo: 88,
      }
    },
    effect: () => Promise.resolve(23),
  })

  const state = ObjA.reducer(undefined, { type: INIT })

  type TEST_ROOT_SHAPE = {
    data: any
    pending: boolean
    error: any
    mrmax: { business: boolean }
  }

  type TEST_SHAPE = {
    root: TEST_ROOT_SHAPE
  }

  const stateT: TEST_SHAPE = state

  const computedState = ObjA.computeState(state, ObjA.makeSelectors())
  const computedStateT: TEST_ROOT_SHAPE = computedState
}

function connectRjMatchProps() {
  type TEST_PROPS = {
    data: any
    error: any
    pending: boolean
  } & BoundActionCreatorsWithBuilder<RjBaseActionCreators>

  const rjState = rj(() => Promise.resolve(1312))
  const Component: FunctionComponent<TEST_PROPS> = (props) => {
    props.run.onSuccess(() => {}).run()
    props.clean.onSuccess(() => {}).run()
    props.cancel.onSuccess(() => {}).run()
    return null
  }

  const RjComponent = connectRj(rjState)(Component)
  const jsx = <RjComponent />

  type TEST_PROPS_B = {
    data: any
    error: any
    pending: boolean
    x: number
    yy: string[]
  } & BoundActionCreatorsWithBuilder<RjBaseActionCreators>

  const ComponentB: FunctionComponent<TEST_PROPS_B> = (props) => {
    return null
  }

  const RjComponentB = connectRj(rjState)(ComponentB)
  const jsxB = <RjComponentB x={3} yy={['Hello', 'Giova']} />
}

function effectPipeline() {
  const obj = rj({
    effect: () => Promise.resolve(99),
    effectPipeline: (action, state) => {
      const v = state.value
      return action.pipe(
        withLatestFrom(state),
        map(([action, state]) => {
          return action
        })
      )
    },
  })
}

function pluginPlainList() {
  const obj = rj(rjPlainList(), {
    effect: () => Promise.resolve(99),
  })
  const state = obj.reducer(undefined, { type: INIT })
  type TEST_DATA_TYPE = any[] | null
  const testData : TEST_DATA_TYPE = state.root.data
  state.root.data?.concat(88)
}
