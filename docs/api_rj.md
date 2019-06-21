---
id: api_rj
title: RocketJump constructor
sidebar_label: RocketJump constructor
---

```js
import { rj } from 'react-rocketjump'
```

The RocketJump constructor is the entry point of the library, and allows the definition of RocketJump `objects` and RocketJump `partials`. The only difference between an `object` and a `partial` is that the object is tied to a task and can be connected to a component, while a `partial` is a reusable logic that can be embedded in other `partials` or `objects` but not connected to a component.

The RocketJump constructor takes an arbitrary number of arguments

```js
const someState = rj(partial1, partial2, ..., partialN, config)
```

each of which is a RocketJump `partial` except for the last one, which is a `config` object. The only required argument is the config object, hence it is allowed to call the `rj` constructor without any partial in it.

## The config object

The config object can contain the following properties

### effect

`(...args) => Promise | (...args) => Observable`

This function is the asynchronous task that we are creating a RocketJump for. Settings this property is very important, since its presence means that a RocketJump object will be created, and not a RocketJump partial. When creating plugins, just avoid setting this in order to make the plugin reusable!

**Example**

Making a simple RocketJump Object that makes a GET request (using SuperAgent syntax in our example) to some host

```js
const rjObject = rj({
  effect: id =>
    request
      .get(`https://my.host.dev/api/resource/${id}/`)
      .then(({ body }) => body),
})
```

**Example**

Using RXjs ajax

```js
import { ajax } from 'rxjs/ajax'

const rjPart = rj({
  effect: (...params) => {
    return ajax({
      url: 'https://my.api.dev/users/Alice',
      method: 'GET',
      headers: {
        /*some headers*/
      },
      body: {
        params,
      },
    })
  },
})
```

There is also a shortcut syntax in case the `effect` option is the only option you need to set

```js
const rjObject = rj(id =>
  request
    .get(`https://my.host.dev/api/resource/${id}/`)
    .then(({ body }) => body)
)
```

### actions

`Object<Action> => Object<Action>`

React-RocketJump creates some predefined actions to manage asynchronous tasks. These actions are

- `run`, which starts a run of the task
- `cancel`, which drops any pending run of the task
- `clean`, which is like `cancel` but also cares of resetting the state

This function is used to transform predefined actions, or add custom ones. It is passed an object containing the actions defined in nested partials and the predefined `run`, `cancel` and `clean` actions, and it is expected to return an object containing other actions (the keys in the object are the names of the actions). The returned object is merged with the previous one before being passed down along the chain. Each partial can, in fact, customize actions freely, and customization is applied recursively from the most to the least nested partial, and from left to right in case of siblings.

**Example**

This partial is used to change the behaviour of the run function so as to copy the first param into the metadata associated with the action

```js
const rjPart = rj({
  actions: ({ run }) => ({
    run: param => run(param).withMeta({ myParam: param }),
  }),
})
```

### selectors

`Object<Selector> => Object<Selector>`

This function is used to transform predefined selectors, or to add new ones. It is passed an object containing the selectors defined in nested partials and the predefined selectors `getData`, `isPending` and `getError`, and it is expected to return an object containing other selectors to be merged with them. Overwriting is possibile. Each partial can customize selectors freely, and customization is applied recursively from the most to the least nested partials, and from left to right in case of siblings.

**Example**

This partial is used to create a selector that changes some strings to upper case

```js
const rjPart = rj({
  selectors: ({ getData }) => ({
    getUpperData: state => {
      const data = getData(state)
      return {
        ...data,
        name: data.name.toUpperCase(),
        surname: data.surname.toUpperCase(),
      }
    },
  }),
})
```

### reducer

`((state, action) => state) => ((state, action) => state)`

This configuration option allows the transfomation of the reducer, usually with the intent of adding support for new actions. Is set, this property must point to a function which is invoked with the previous reducer as parameter and that is expected to return the new reducer. As for actions and selectors, transformations are composed from the most to the least nested RocketJump `partial`, and from left to right in case of siblings. Hence, the returned reducer could in principle be used to feed another reducer transformation. In order to grant composability, the returned reducer is expected to call the older one for any action it is not capable of dealing with.

**Example**

This configuration describes the extension of a reducer to add support for a new action

```js
const rjPart = rj({
  reducer: oldReducer => (state, action) => {
    if (action.type === 'SWAP') {
      const { name, surname } = state.data
      return {
        ...state,
        data: {
          ...state.data,
          surname: name,
          name: surname,
        },
      }
    }
    return oldReducer(state, action)
  },
})
```

### composeReducer

`((state, action) => state)[]`

This setting can be confused with the previous one, as it again modifies the reducer, but the way it operates is quite different. The `reducer` key allows to replace the old reducer with a completely new, custom reducer, while `composeReducer` produces a new reducer that chains its arguments (the first implicit argument is the old reducer we dealt with when talking about the `reducer` setting). Chaining means that the state object is at first passed to the first reducer (the old reducer), which will produce another state object, which will be in turn passed on to the second reducer in the list (the first in the array), and so on and so forth. The next state is the output of the last reducer in the array. The `reducer` setting has priority over this setting, but the two can be used together: the original reducer will be transformed according to the `reducer` setting, and then will be used for composition.

This setting has also a quick overload signature to avoid passing arrays of just one element, which is
`(state, action) => state`. The behaviour of the following descriptions is the same

```js
const rjPart = rj({
  composeReducer: (state, action) => produceNextState(state, action),
})

const rjPart = rj({
  composeReducer: (state, action) => [produceNextState(state, action)],
})
```

**Example**

This configuration describes the extension of a reducer to add support for a new action

```js
const rjPart = rj({
  composeReducer: [
    (state, action) => {
      if (action.type === 'SWAP') {
        const { name, surname } = state.data
        return {
          ...state,
          data: {
            ...state.data,
            surname: name,
            name: surname,
          },
        }
      }
      return state /* Look at the difference with the reducer setting */
    },
  ],
})
```

### effectCaller

`(effect, ...params) => Promise | (effect, ...params) => Observable | "noop"`

This setting is used to hook into the process of launching the effect, and can be used to alter its params or to add some more of them. The first argument is the `effect` to be called, and the subsequent arguments are the arguments the user sent in the `run` action. You can do everything you need here, the important thing is that you call the effect and return the Promise used to await for task completion, or a Rx Observable (this is useful if you are using Rx Ajax API). In order to force the RocketJump Object to use the default `effectCaller` you can also pass the string `"noop"`. You may want to do this to opt-out a [shared configuration](api_configure.md)

**Example**

Injecting a new argument, for instance an authentication token

```js
const TOKEN = 'somesecretyoudontwanttocommittogithub'

const rjPart = rj({
  effectCaller: (effect, ...params) => effect(TOKEN, ...params),
})
```

### takeEffect

`[policy, ...arguments] | (observable: RxObservable, mapTo: action => RxObservable) => RxObservable`

This setting is used to control what to do when more instances of a task are spawned concurrently. The `policy` argument is a `String`, and can assume one of the following values

- `latest`: cancel any pending task except for the latest, or, in other words, when a task is launched kill all the pending instances before launching it
- `every`: never cancel a task, just await all of them to complete. No grants about order of completion is set.
- `exhaust`: if there is a pending instance of the task, it ignores any other attempt to spawn other instances of the same task
- `groupBy`: compute a key for each task invocation, and behaves like the `latest` policy with respect to tasks with the same key.
- `groupByExhaust`: compute a key for each task invocation, and behaves like the `exhaust` policy with respect to tasks with the same key.

The only case in which it is required to pass an argument is the `groupBy` case, where a key making function is required. The key making function is called with the `run` action object as a parameter, and is expected to return a scalar (int or string does not matter).

You can also pass a function to this key in order to define your own policy. This function is called with two arguments:

- `observable` is the stream of dispatched actions
- `mapTo` is a function used to convert an asynchronous action (like the calling of the effect) in a proper stream

This function is expected to return itself a `RxObservable`

**Example**

Group tasks by a meta key

```js
const rjPart = rj({
  takeEffect: ['groupBy', action => action.meta.id],
})
```

### effectPipeline

`(observable: RxObservable) => RxObservable`

This is used to customize the pipeline used to dispatch actions to observables. It is passed in a function that is called with the action stream and it is expected to return again an RxObservable. This configuration setting is useful to introduce some transformations supported by RxJs, for instance `debounce`

**Example**
Debounce an API call

```js
import { rj } from 'react-rocketjump'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

const TypeaheadState = rj({
  effectPipeline: $s =>
    $s.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ),
  effect: search => {
    return fetch(`/api/users?search=${search}`).then(r => r.json()),
  }
})
```