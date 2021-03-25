---
id: plugin_system
title: Plugin System
sidebar_label: Plugin System
slug: /plugin-system
---

RocketJump help you reusing you RjObject logic using an advanced plugin system.

You can use write your own plugins ore use some good plugins provided by the library.

To write a RocketJump plugin you should use the `rjPlugin` function, it accepts
the same parameters of `rj` function except for `effect`, `mutations` and `computed`
theese options are only allowed in the `rj` functions.

To use a plugin pass them to the `rj` function before the config object.

## Your first plugin

Try to explain the concepts above with a basic example. <br />
You a write a simple RjObject to handle a todo list:

```js
import { rj } from 'react-rocketjump'

const TodosState = rj({
  mutations: {
    addTodo: {
      effect: (todo) =>
        fetch(`/todos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todo),
        }).then((r) => r.json()),
      updater: (state, newTodo) => ({
        ...state,
        data: state.data.concat(newTodo),
      }),
    },
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

You have to write another RjObject to handle for example a list of users.
You notify that the `updater` to append new a item to a list of todos or user
is the same.

First, extract updater logic to an action creator an handle them with `composeReducer`:

```js
import { rj } from 'react-rocketjump'

const TodosState = rj({
  actions: () => ({
    insertItem: (item) => ({ type: 'APPEND', payload: item }),
  }),
  composeReducer: (state, action) => {
    if (action.type === 'APPEND') {
      return state.data.concat(action.payload)
    }
    return state
  },
  mutations: {
    addTodo: {
      effect: (todo) =>
        fetch(`/todos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todo),
        }).then((r) => r.json()),
      updater: 'insertItem',
    },
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

Now it's time to make it reausable extract it as a RocketJump Plugin!

```js
import { rj, rjPlugin } from 'react-rocketjump'

// Define plugin
const appendPlugin = rjPlugin({
  actions: () => ({
    insertItem: (item) => ({ type: 'APPEND', payload: item }),
  }),
  composeReducer: (state, action) => {
    if (action.type === 'APPEND') {
      return state.data.concat(action.payload)
    }
    return state
  },
})

// Use it to make your RjObject
const TodosState = rj(appendPlugin, {
  mutations: {
    addTodo: {
      effect: (todo) =>
        fetch(`/todos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todo),
        }).then((r) => r.json()),
      updater: 'insertItem',
    },
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

Now everytime you need to insert an item you can your awesome `appendPlugin`!

## Compose plugins

One of the wonderful property about plugins is that you can compose them.
For example you are very entusiast about plugins and you also write
the `removePlugin` to remove an item from a list and the `updatePlugin` to update
an time from a list.
You can use all of them with the `rj` function:

```js
import { rj } from 'react-rocketjump'
import { appendPlugin, removePlugin, updatePlugin } from './myPlugins'

const MyObj = rj(appendPlugin, removePlugin, updatePlugin, {
  // ... Your config ...
})
```

Or you can compose plugin toghter and make an unique plugin!

```js
import { rjPlugin } from 'react-rocketjump'

const listOperatiosPlugin = rjPlugin(appendPlugin, removePlugin, updatePlugin, {
  // ...You eventual config for listOperatiosPlugin plugin...
})

// NOTE: This is equal to the example above
const MyObj = rj(listOperatiosPlugin, {
  // ... Your config ...
})
```

You can compose plugin togher with no limitations, only you fantasy is the limit!

## How does composition work?
Consider the following example

```js
const p0 = rjPlugin({ /* config R */ });
const p1 = rjPlugin(p0, { /* config O */ });
const p2 = rjPlugin({ /* config C */ });
const final = rj(p1, p2, { /* config K */ });
```

The composition order goes from top to bottom and from left to right. Hence, in our example, we have the following composition order: `config R > config O > config C > config K`.

### Different composition strategies
Due to the wide variety of available configuration properties, it is not possible to define a global composition strategy. Instead, we can describe some composition strategies which describe how different properties are composed

#### Chain properties

> Chain properties are *actions* , *selectors*, *effectPipeline*

Chain properties are so called because they are functions that are invoked in chain (i.e. the output of the previous one is the input of the second one) in composition order at composition time. The argument of the first call is the default value. At the end, the RocketJump Object will contain only the output of the last call.

In our example, let's pretend that all the four config objects (R, O, C, K) define the *actions* property. Composition works like this:
- the default action bag is generated
- the *actions* transform of `configR` is called with the default action bag as parameter, and its output merged with the default action bag to produce `tempActionBag1`
- the *actions* transform of `configO` is called with `tempActionBag1` as parameter, and its output is merged with `tempActionBag1` to create `tempActionBag2`
- - the *actions* transform of `configC` is called with `tempActionBag2` as parameter, and its output is merged with `tempActionBag2` to create `tempActionBag3`
- - the *actions* transform of `configK` is called with `tempActionBag3` as parameter, and its output is merged with `tempActionBag3` to create `tempActionBag4`
- `tempActionBag4` is the final action bag

#### Recursive properties

> Recursive properties are *reducer*, (*composeReducer*), *effectCaller*

Recursive properties are so called because they involve runtime function composition: the final value is a function which is the mathematical composition of the functions defined in the merged configurations in composition order.

*composeReducer* here is put in parenthesis because it is not involved directly in composition, being squashed onto the *reducer* property before composition starts (i.e. with respect to composition, there is no *composeReducer* property, but only *reducer*, which contains also all the composed reducers)

Let's pretend that all the four config objects (R, O, C, K) define the *reducer* property. Composition works like this:
- the default reducer is generated
- a new reducer is created by transforming the default reducer as stated in `configR` to create `tempReducer1`
- a new reducer is created by transforming `tempReducer1` as stated in `configO` to create `tempReducer2`
- a new reducer is created by transforming `tempReducer2` as stated in `configC` to create `tempReducer3`
- a new reducer is created by transforming `tempReducer3` as stated in `configK` to create `tempReducer4`
- `tempReducer4` is the final reducer

Let's pretend that all the four config objects (R, O, C, K) define the *effectCaller* property. Composition works like this:
- the default effectCaller is generated
- when the user triggers an effect run, the following things happen:
  - the `effectCaller` specified in `configR` is called, with its `effect` argument set to a fake effect function
  - when the fake effect function is called with `...args`, the `effectCaller` set in `configO` is called with `...args` and with a second fake effect function
  - when this second fake effect function is called with `...args`, the `effectCaller` set in `configC` is called with `...args` and with a third fake effect function
  - when this third fake effect function is called with `...args`, the `effectCaller` set in `configK` is called with `...args` and with a the default effect caller as its `effect` parameter

### Merged properties

> Merged property is only *combineReducers*

Merged properties are merged using plain object assignment in composition order.

### Overwrite properties

> Overwrite properties are *takeEffect*, *name*

Overwrite properties are not merged, the last configuration in composition order defining it wins.

### `addSideEffect`

Finaly `addSideEffect` collect the list of result Observables using the composition
order describe above and finally create an unique
Observable using the RxJS [merge function](https://rxjs.dev/api/index/function/merge).
