---
id: computed_state_selectors
title: Computed state and selectors
sidebar_label: Computed state and selectors
slug: /computed-state-and-selectors
---

Every RjObject has its own selectors: a collection functions used to select a piece of
internal state. In addition the RjObject olds a function to compute the state
given to its consumers.

## Default selectors

When you crafting a new RjObject default selectors are generated.
Default selectors are designed to work with default state shape and are:

- **getRoot**: select the root state.
- **isPending**: select the pending state from root state.
- **isLoading**: alias for isPending
- **getError**: select the error state from root state.
- **getData**: select the data state from root state.

You can access selectors using the **makeSelectors** function on RjObject.

```js {3}
const obj = rj(() => Promise.resolve(99))
const state = obj.reducer(undefined, { type: 'INIT' })
const selectors = obj.makeSelectors()
const data = selectors.getData(state)
```

## Extending selectors

You can use **selectors** option on RocketJump constructor to add custom selectors and compose with defaults.

```js
function counterReducer(state = 0, action) {
  if (action.type === 'INCREMENT') {
    return state + 1
  }
  return state
}

const CoolState = rj({
  selectors: (defaultSelectors) => ({
    getCounter: (state) => state.counter,
    getName: (state) => defaultSelectors.getData(state)?.name ?? 'NONAME',
  }),
  combineReducers: {
    counter: counterReducer,
  },
  effect: () => Promise.resolve({ name: 'Gio Va' }),
})
```

The final `CoolState` RjObject has default selectors plus `getCounter` and `getName`.

## Compute state

When a RjObject is consumed the state from reducer isn't used directly, but the consumer use a function called **computeState** on RjObject itself.
The computeState function take the state from reducer and the RjObject selectors to provide you the **computed state**.

```js
const obj = rj(() => Promise.resolve(99))
const state = obj.reducer(undefined, { type: 'INIT' })
const selectors = obj.makeSelectors()
const computedState = obj.computeState(state, selectors)
```

When you use consumers such `useRj` this is done for you:

```js
const [computedState, actions] = useRj(obj)
```

The default computeState implementation simply select the root state.

You can change the value returned from computeState using **computed** option, an object that map out property with internal RocketJump state.
Computed values can be inline selectors or _strings_ that refernces selectors names.

Using configuration from previous example.

```js {10-14}
const CoolState = rj({
  effect: () => Promise.resolve({ name: 'Gio Va' }),
  combineReducers: {
    counter: counterReducer,
  },
  selectors: (defaultSelectors) => ({
    getCounter: (state) => state.counter,
    getName: (state) => defaultSelectors.getData(state)?.name ?? 'NONAME',
  }),
  computed: {
    name: 'getName',
    counter: 'getCounter',
    loading: (state) => state.root.pending,
  },
})

const state = obj.reducer(undefined, { type: 'INIT' })
const computedState = obj.computeState(state, obj.makeSelectors())
```

The `computedState` has this shape:

```ts
{
  name: string | null,
  counter: number,
  loading: boolean,
}
```

## Memoizing selectors

:::caution
In most of apps you dont' need to memoize RocketJump selectors.
You can simply rely on React's `useMemo` inside your components.
:::

RocketJump selectors are created per instance when you consume your RjObject.
So you can create per instance memoizing version of your selectors:

```js
import { rj } from 'react-rocketjump'
import memoize from 'memoize-one'

const TodosState = rj({
  // ...
  selectors: (prevSelectors) => {
    // filterDoneTodos is created per instance
    const filterDoneTodos = memoize((todos) =>
      todos ? todos.filter((todo) => todo.done) : []
    )
    return {
      // memoize "per todos"
      // (filterDoneTodos is re-executed only when data actually changes)
      getDoneTodos: (state) => filterDoneTodos(prevSelectors.getData(state)),
    }
  },
  computed: {
    doneTodos: 'getDoneTodos',
    // ..
  }
})

function Todos() {
  const [{
    // doneTodos is memoized
    doneTodos,
  }] = useRj(TodosState)

  // ...
}
```