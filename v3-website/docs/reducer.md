---
id: reducer
title: Reducer
sidebar_label: Reducer
slug: /reducer
---

### Default reducer

If you don't specify anything the default reducer crafted when creating a RjObject has this state shape:

```ts
{
  root: {
    data: any
    error: any
    pending: boolean
  }
}
```

:::info
When consuming an RjObject the default computed state is the state under **root** key.
:::

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
the `data` key on `payload` contains the effectresult.
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
the `payload` key on action contains the error generated from effect.
Default root reducer implementation make *pending* `false` and fill the `error` key with payload from action.

- **UPDATE_DATA**

```ts
interface UpdateDataAction {
  type: 'UPDATE_DATA'
  payload: any
}
```

**UPDATE_DATA** action is dispatched from default action creator `updateData`.
Default root reducer implementation set the `payload` as new data.

- **CANCEL**

```ts
interface CancelAction {
  type: 'CANCEL'
  payload: any
}
```

**CANCEL** action is dispatched from default action creator `cancel`.
Default root reducer implementation set the `pending` to `false`.

- **CLEAN**

```ts
interface CancelAction {
  type: 'CLEAN'
  payload: any
}
```

**CLEAN** action is dispatched from default action creator `clean`.
Default root reducer implementation set reset `pending`, `data` and `error` to
default state:
```js
{
  pending: false,
  data: null,
  error: null,
}
```


In addition when your RjObject is initialized the **INIT** action is also dispatched.

```ts
interface InitAction {
  type: 'INIT'
}
```

Finally the last RocketJump core action is the `RUN` action.
Dispathed when the **effect** is triggered.

```ts
interface RunAction {
  type: 'RUN',
  payload: {
    params: any[]
  },
  meta: Record<string, any>
}
```
Default root reducer implementation doesn't listen to this action.


**INIT**, **RUN**, **CANCEL**, **CLEAN**, **PENDING**, **SUCCESS**, **FAILURE**
and **UPDATE_DATA** action types are all export from `'react-rocketjump'` module:

```js
import {
  INIT,
  RUN,
  CANCEL,
  CLEAN,
  PENDING,
  SUCCESS,
  FAILURE,
  UPDATE_DATA
} from 'react-rocketjump'
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
