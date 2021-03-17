---
id: computed_state_selectors
title: Computed state and selectors
sidebar_label: Computed state and selectors
slug: /computedStateAndSelectors
---

## Default selectors

When you crafting a new RjObject default selectors are generated.
Default selectors are designed to work with default state shape and are:

- **getRoot** select the root state.
- **isPending**: select pending state from root state.
- **isLoading**: alias for isPending
- **getError**: select error state from root state.
- **getData**: select data state from root state.

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

> A note about memoization

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

The default computeState implementation simply slice the root state.

You can change the value returned from computeState using **computed** option, an object that map out property with internal RocketJump state.
Computed values can be inline selectors or _string_ that refernces selectors names.

Using configuration from previous example.

```js {3-7}
const CoolState = rj({
  // ...
  computed: {
    name: 'getName',
    counter: 'getCounter',
    loading: (state) => state.root.pending,
  },
  effect: () => Promise.resolve({ name: 'Gio Va' }),
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
