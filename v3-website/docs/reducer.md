---
id: reducer
title: Reducer
sidebar_label: Reducer
slug: /reducer
---

### Default reducer

If you don't specify anything the default reducer crafted when creating a RjObject has this shape:

```ts
{
  root: {
    data: any
    error: any
    pending: boolean
  }
}
```

RocketJump use _redux style actions_:

```ts
interface Action<T extends string> {
  type: T
  [extraProps: string]: any
}
```

The action types handled by this reducer are:

- **PENDING**

```ts
interface PendingAction {
  type: 'PENDING'
  meta: Record<string, any>
}
```

**PENDING** action is dispatched when your **effect** starts default root reducer implementation make *pending* `true`.

- **SUCCESS**

```ts
interface SuccessAction {
  type: 'SUCCESS'
  payload: {
    params: any[]
    data: any
  }
  meta: Record<string, any>
}
```

**SUCCESS** action is dispatched when your **effect** *resolves / complete*
the `data` key on `payload` contains the result data.
Default root reducer implementation make *pending* `false` and fill the `data` key with `payload.data` from action.

- **FAILURE**

```ts
interface FailureAction {
  type: 'FAILURE'
  payload: any
  meta: Record<string, any>
}
```

**FAILURE** action is dispatched when your **effect** *rejects / error*
the `payload` key on action contains the error data.
Default root reducer implementation make *pending* `false` and fill the `error` key with payload from action.

In addition when your RjObject is initialized the **INIT** action is also dispatched.
```ts
interface InitAction {
  type: 'INIT'
}
```

We call the reducer under the `root` key the **root reducer**, you can extend the root reducer or add others reducers under specific keys.

You can find reducer under `reducer` property in your RjObject.

```js
const obj = rj(() => Promise.resolve('Hello'))
const state = obj.reducer(undefined, { type: 'INIT' })
```

### Extending root reducer

Your can extend the root reducer using the `reducer` property in **rj** constructor or the `reducer` mehtod when using **Builder** syntax, [learn more about builder invocation vs function invocation](/).

This option is passed the base root reducer and it is expected to return the new reducer.

```js {12}
function counterReducer(state = { counter: 0 }, action) {
  if (action.type === 'INCREMENT') {
    return {
      counter: state.counter + 1,
    }
  }
  return state
}

rj({
  effect: () => Promise.resolve('Hello'),
  reducer: (baseRootReducer) => counterReducer,
})
```

Tipically the `reducer` option is used when you want overwrite the default reducer or your want to change default behaviour.

If your only need is to add a new action handled by default reducer you can use the `composeReducer` option.

Thi option must be a reducer with the same shape of default reducer and is used to *compose* your reducer.

```js {3-11}
rj({
  effect: () => Promise.resolve('Hello'),
  composeReducer: (state, action) => {
    if (action.type === 'APPEND' && state.data) {
      return {
        ...state,
        data: state.data.concat(action.payload)
      }
    }
    return state
  }
})
```

The final reducer has the default reducer plus can handle the **APPEND** action type.

### Adding new reducers

You can adding new reducers next to root reducer using `combineReducers` option, this option must be an object indexed by the reducers you want to add, under the hood the old but good redux *combineReducers* is used.

```js {19-22}
function counterReducer(state = 0, action) {
  if (action.type === 'INCREMENT') {
    return {
      counter: state + 1,
    }
  }
  return state
}

function lastSuccessAtReducer(state = null, action) {
  if (action.type === 'SUCCESS') {
    return new Date().getTime()
  }
  return state
}

rj({
  effect: () => Promise.resolve('Hello'),
  combinerReducers: {
    counter: counterReducer,
    lastSuccessAt: lastSuccessAtReducer
  }
})
```

> Reducers provided in combinerReducers still has access to ALL actions.