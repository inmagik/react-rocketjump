---
id: action_creators
title: Action Creators
sidebar_label: Action Creators
slug: /action-creators
---

Every RjObject has its own action creators: a collection of functions that trigger
state updates and/or side effects.

## Plain and effect action creators

In RocketJump there is two type of action creators:

#### Plain action creators

Plain action creators returns plain actions and theese actions are
dispatched on the reducer.

#### Effect action creators

Effect action creators returns special actions.
This actions becomes a **stream**, side effects take this stream as inputs
and emit plain actions dispatched on the reducer.

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

## Default action creators

When you crafting a new RjObject default action creators are generated.
Default action creators are designed to work with default state shape and side effects, and are:

- `updateData(data: any): { type: 'UPDATE_DATA' }`:
A plain action creator that update your data state.
- `run(...args: any[]): EffectAction<'RUN'>`:
An effect action creator that run your effect.
- `cancel(): EffectAction<'CANCEL'>`:
An effect action creator that cancel your effect.
- `clean(): EffectAction<'CLEAN'>`:
An effect action creator that cancel your effect and reset your root state.

## Adding plain actions

To adding plain actions you can use the `actions` property in **rj** constructor
or the `actions` method when using **Builder** syntax,
[learn more about builder invocation vs function invocation](/).

The `actions` method should be a function with this signature:

```
(currentActions) => nextActions
```

`nextActions` are merged to `currentActions`.

So combining the concept learned in the previous chapters let's build a counter using
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
`makeEffectAction`:

```js
import { makeEffectAction } from 'react-rocketjump'
```

The signature of makeEffectAction is:

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

The default `run()` effect action creator will create an effect action `EffectAction<'RUN'>`.

Side effects dispatch the `RUN` action immediately:

```ts
{
  type: 'RUN',
  payload: {
    params: any[],
  },
  meta: Record<string, any>
}
```

:::note
The meta passed to your `makeEffectAction` are injected in all emitted action.
:::

Then depending of your side effect configuration when the **effect** is executed,
using `params` as input, the **PENDING** action is dispatched:

```ts
{
 type: 'PENDING',
 meta: Record<string, any>
}
```

If the effect _resolves_ / _complete_ a **SUCCESS** action will emitted.
The `payload.data` contains the result of **effect**.

```ts
{
 type: 'SUCCESS',
 payload: {
   params: any[],
   data: any
 },
 meta: Record<string, any>
}
```

If the effect _rejects_ / _errors_ a **ERROR** action will emitted.
The `payload` contains the error generated from **effect**.

```ts
{
 type: 'FAILURE',
 payload: any,
 meta: Record<string, any>
}
```

When creating new effect action creators using the **rj** constructor you can
add _meta_ to current actions using the special `withMeta` method.

In this exaple we use the _meta_ `append` to append to our data instead
of replace them.

For this example our immaginary REST API `/api/products` will return a JSON
with the following shape:

```ts
{
  results: any[],
  nextPage: number | null
}
```

```jsx
import { rj, useRj, SUCCESS } from 'react-rocketjump'

const InfiniteListState = rj({
  effect: (page = 1) => fetch(`/api/products?=${page}`).then((r) => r.json()),
  actions: ({ run }) => ({
    fetchMore: (...args) => run(...args).withMeta({ append: true }),
  }),
  reducer: (oldReducer) => (state, action) => {
    // Append effect result to our data
    if (action.type === SUCCESS && action.meta.append === true) {
      return {
        ...state,
        data: (state.data?.results ?? []).concat(action.payload.data),
      }
    }
    // Use default reducer implementation
    return oldReducer(state, action)
  },
})

function MyList() {
  // Starts with default page: 1
  const [{ data }, { fetchMore }] = useRunRj(InfiniteListState)

  return (
    <div>
      {/** ... render your data ... **/}
      <button
        disabled={!data?.nextPage}
        onClick={() => {
          // Fetch next page
          fechMore(data.nextPage + 1)
        }}
      >
        More
      </button>
    </div>
  )
}
```
