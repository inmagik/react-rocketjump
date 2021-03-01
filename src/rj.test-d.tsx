/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { FunctionComponent } from 'react'
import { rj, rjPlugin, connectRj, INIT } from '.'
import {
  RjBaseActionCreators,
  Action,
  OptimisticActionLog,
  RjStateRootShape,
} from './core/types'
import rjPlainList from './plugins/plainList'
import rjList, { nextPreviousPaginationAdapter } from './plugins/list'
import { BoundActionCreatorsWithBuilder } from './core/actions/bindActionCreators'
import { map, withLatestFrom } from 'rxjs/operators'
import { useRj, useRunRj } from './react'

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

function sideEffectConfigurations() {
  const obj = rj({
    effect: () => Promise.resolve(99),

    takeEffect: 'every',

    effectCaller: (fn, ...args) =>
      (fn(...args) as Promise<any>).then(() => 'Hello!'),

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
  const testData: TEST_DATA_TYPE = state.root.data
  state.root.data?.concat(88)
}

function pluginPlainListComputedBuilder() {
  const obj = rj()
    .plugins(rjPlainList())
    .computed({
      hello: 'getList',
    })
    .effect({
      effect: () => Promise.resolve(88),
    })

  const state = obj.reducer(undefined, { type: INIT })
  const cstate = obj.computeState(state, obj.makeSelectors())
  type TEST_DATA_TYPE = any[] | null
  const testCState: TEST_DATA_TYPE = cstate.hello
  cstate.hello?.concat(23)
}

function pluginListComputedBuilder() {
  const obj = rj()
    .plugins(
      rjList({
        pageSize: 99,
        pagination: nextPreviousPaginationAdapter,
      })
    )
    .computed({
      hello: 'getList',
      pagination: 'getPagination',
    })
    .effect({
      effect: () => Promise.resolve(88),
    })

  const state = obj.reducer(undefined, { type: INIT })
  const cstate = obj.computeState(state, obj.makeSelectors())
  type TEST_DATA_TYPE = any[] | null
  const testCState: TEST_DATA_TYPE = cstate.hello
  cstate.hello?.concat(23)
  let ccc: number | null = cstate.pagination.count
}

function pluginListVanillaVsBuilder() {
  const objVanilla = rj(
    rjList({
      pageSize: 10,
      pagination: nextPreviousPaginationAdapter,
    }),
    {
      selectors: (se) => ({
        // NOTE: In vanilla mode TS can't infer
        // "getPagination" i think the cause in always
        // see: https://github.com/microsoft/TypeScript/issues/41396
        gang: (s) => se.getData(s),
      }),
      effect: () => Promise.resolve(88),
    }
  )

  const objBuilder = rj()
    .plugins(
      rjList({
        pageSize: 10,
        pagination: nextPreviousPaginationAdapter,
      })
    )
    .selectors((se) => ({
      // NOTE: My FUCKING GOOD BOY BUILDER CAN INFER THE WHOLE HELL
      // After .plugins() call TS ha infered the new state and selectors
      gang: (s) => (se.getPagination(s).count ?? 0) * 2,
    }))
    .effect({
      effect: () => Promise.resolve(88),
    })

  const state = objBuilder.reducer(undefined, { type: INIT })
  objBuilder.makeSelectors().gang(state).toFixed(2)
}

function mutationsState() {
  const o1 = rj({
    mutations: {
      muta: {
        updater: (s) => s,
        reducer: () => ({
          drago: 23,
          kill: 'Humans',
        }),
        effect: () => Promise.resolve(1),
      },
    },
    effect: () => Promise.resolve(88),
  })
  const state = o1.reducer(undefined, { type: INIT })

  const o2 = rj()
    .mutations({
      muta: {
        updater: (s) => s,
        reducer: () => ({
          drago: 23,
          kill: 'Humans',
        }),
        effect: () => Promise.resolve(1),
      },
    })
    .effect(() => Promise.resolve(88))
  const state2 = o2.reducer(undefined, { type: INIT })

  type TEST_MUTATION_SHAPE = {
    drago: number
    kill: string
  }

  let stateT: TEST_MUTATION_SHAPE = state.mutations.muta
  stateT = state2.mutations.muta
}

function useRjBasicTypes() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ pending }, { run }] = useRj(obj)
  const flag: boolean = pending
}

function useRjBasicTypesEdge() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ pending }, { run }] = useRj(obj, undefined)
  const flag: boolean = pending
}

function useRjBasicTypesWithSelectState() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ flag, pizzaDay }, { run }] = useRj(obj, (state) => {
    return {
      flag: state.root.pending,
      pizzaDay: new Date(),
    }
  })
  const flagU: boolean = flag
  const dayPizzaDayIs: Date = pizzaDay
}

function useRunRjBasicTypes() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ pending }, { run }] = useRunRj(obj, [], true)
  const flag: boolean = pending
}

function useRunRjBasicTypesEdge() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ pending }, { run }] = useRunRj(obj, [23, 88], true, undefined)
  const flag: boolean = pending
}

function useRunRjBasicTypesWithSelectState() {
  const obj = rj({
    effect: () => Promise.resolve(3),
  })

  const [{ flag, pizzaDay }, { run }] = useRunRj(obj, [], false, (state) => {
    return {
      flag: state.root.pending,
      pizzaDay: new Date(),
    }
  })
  const flagU: boolean = flag
  const dayPizzaDayIs: Date = pizzaDay
}

function effectCallerEasyString() {
  const obj = rj({
    effectCaller: 'configured',
    effect: () => Promise.resolve(3),
  })
}

function oldEffectCallerDeprecated() {
  const obj = rj({
    effectCaller: rj.configured(),
    effect: () => Promise.resolve(3),
  })
}

function rjPluginBuilderRootRedcuer() {
  const p = rjPlugin()
    .reducer(() => () => new Date())
    .build()

  const obj = rj()
    .plugins(p)
    .effect(() => Promise.reject())

  let date: Date
  date = obj.reducer(undefined, { type: INIT }).root
}

function rjPluginBuilderRootRedcuerWithOldReducer() {
  const p1 = rjPlugin()
    .reducer(() => (state: number | undefined, action) => 99)
    .build()

  const p = rjPlugin()
    .plugins(p1)
    .reducer((r) => (state: any, action) => ({
      n: r(state, action).toFixed(2),
      d: new Date(),
    }))
    .build()

  const obj = rj()
    .plugins(p)
    .effect(() => Promise.reject())

  const state = obj.reducer(undefined, { type: INIT })

  const date: Date = state.root.d
  const n: string = state.root.n
}

function rjPluginBuilderSelectorsWithState() {
  const p1 = rjPlugin()
    .combineReducers({
      drago: () => 99,
      now: () => new Date(),
    })
    .build()

  const p = rjPlugin()
    .plugins(p1)
    .combineReducers({
      miao: () => ({ name: 'Gio Va' }),
    })
    .selectors((s) => ({
      j3: (state) => state.drago,
      ju: (state) => state.now,
      jj: (state) => state.miao.name,
    }))
    .build()

  const obj = rj()
    .plugins(p)
    .effect(() => Promise.reject())
  const state = obj.reducer(undefined, { type: INIT })

  const sel = obj.makeSelectors()

  const d: Date = sel.ju(state)
  const n: number = sel.j3(state)
  const s: string = sel.jj(state)
}

function optMutationsStateBuilder() {
  const obj = rj()
    .mutations({
      drago: {
        effect: () => Promise.reject(),
        updater: 'updateData',
      },
      fuma: {
        effect: () => Promise.reject(),
        updater: 'updateData',
      },
    })
    .effect(() => Promise.reject())

  const state = obj.reducer(undefined, { type: INIT })
  let x: {
    root: RjStateRootShape
  } = state
  // This raise an error i can't found a way to test it lol
  // state.optimisticMutations

  const objOpt = rj()
    .mutations({
      drago: {
        effect: () => Promise.reject(),
        updater: 'updateData',
        optimisticResult: (a) => a,
      },
      fuma: {
        effect: () => Promise.reject(),
        updater: 'updateData',
      },
    })
    .effect(() => Promise.reject())

  const stateO = objOpt.reducer(undefined, { type: INIT })
  const logs: OptimisticActionLog[] = stateO.optimisticMutations.actions
}
