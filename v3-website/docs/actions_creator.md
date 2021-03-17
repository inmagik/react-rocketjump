---
id: action_creators
title: Action Creators
sidebar_label: Action Creators
slug: /actionCreators
---

## Plain and effect action creators

In RocketJump there is two type of action creators:

### Plain action creators

Plain action creators returns plain actions and theese actions are
dispatched on the reducer.

### Effect action creators

Effect action creators returns special actions that are passed as input
to side effect the side effect will emit action dispatched on the reducer.

You can find action creators under `actionCreators` property in your RjObject.

```js
const obj = rj(() => Promise.resolve('Hello'))
const state = obj.actionCreators
```

When you consume an RjObject using RocketJumps hooks or HOCs theese actions creators
are atomatically bind to reducer dispatch and side effects.

```js
const obj = rj(() => Promise.resolve('Hello'))
const [state, bindActionsCreators] = useRj(obj)
```

## Adding plain actions

To adding plain actions you can use the `actions` property in **rj** constructor
or the `actions` method when using **Builder** syntax,
[learn more about builder invocation vs function invocation](/).

The `actions` method should be a function with this signature:

```
(currentActions) => nextActions
```

:::note
Next actions are merged to final actions.
:::

So combining the concept learned in previous chapter let's build a counter using
RocketJump!

```jsx
import { rj, useRj } from 'react-rocketjump'

const CounterState = rj({
  // NOTE: In this example we ignore effect
  effect: () => Promise.reject(),
  // Add inc() and dec() action creators
  actions: (currentActions) => ({
    dec: () => ({ type: 'DEC' }),
    inc: () => ({ type: 'INC' }),
  }),
  // Swap default root reducer implementation with a simple counter
  reducer: (currentReducer) => (state = 0, action) => {
    if (action.type === 'INC') {
      return state + 1
    }
    if (action.type === 'DEC') {
      return state - 1
    }
    return state
  },
})

function Counter() {
  const [counter, { inc, dec }] = useRj(CounterState)
  return (
    <div>
      <button onClick={dec}>-</button>
      <h1>{counter}</h1>
      <button onClick={inc}>+</button>
    </div>
  )
}
```

## Adding effect actions

To create an effect action you can use an helper from RocketJump called
`makeEffectAction` that has this signature:

```ts
<T extends string>(type: T, params?: any[], meta?: Record<string, any>) =>
  EffectAction<T>
```

When your EffectAction is emitted to your side effect the shape you can expect is:

```ts
{
  type: T,
  payload: {
    params: any[],
  },
  meta: Record<string, any>
}
```

The default `run()` action creator will create an effect action `EffectAction<'RUN'>`
In the default side effect model the `RUN` effect action will emit a **PENDING** action,
then invoke the **effect** function using `params` as inputs.

:::note
The meta passed to your `makeEffectAction` are injected in all related
effect action.
:::

```ts
{
 type: PENDING,
 meta: Record<string, any>
}
```

If the effect *resolves* / *complete* a **SUCCESS** action will emitted.
The `payload.data` contains the result of **effect**.

```ts
{
 type: SUCCESS,
 payload: {
   params: any[],
   data: any
 },
 meta: Record<string, any>
}
```

If the effect *rejects* / *errors* a **ERROR** action will emitted.
The `payload` contains the error generated from **effect**.

```ts
{
 type: FAILURE,
 payload: any,
 meta: Record<string, any>
}
```

When creating new effect action creators using the **rj** constructor you can
add *meta* to current actions using the special `withMeta` method.

In this exaple with use the *meta* `append` to append to our data instead
of replace them:

```js
import { rj, useRj, SUCCESS } from 'react-rocketjump'

const InfiniteListState = rj({
  effect: (page = 1) => fetch(`/api/products?=${page}`).then(r => r.json()),
  actions: ({ run }) => ({
    fetchMore: (...args) => run(...args).withMeta({ append: true })
  }),
  reducer: (oldReducer) => (state, action) => {
    if (action.type === SUCCESS) {

    }
  }
})
```
