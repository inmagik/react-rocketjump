---
id: api_rj
title: RocketJump constructor
sidebar_label: RocketJump constructor
slug: /api-rj
---

```js
import { rj } from 'react-rocketjump'
```

The RocketJump Constructor is the a multi-purpose tool, as it can be used to craft two different (yet similar) kinds of objects:
- RocketJump Objects are full-fledged ready-to-use objects you can import and exploit in your components
- RocketJump Partials are not ready to use, and are primarily intended to share configuration between different RocketJump Objects

To clarify the difference, we can state this parallelism with OOP:
- RocketJump Objects play the same role as classes (can be istantiated, for instance)
- RocketJump Partials play the same role as abstract classes (cannot be instantiated, but can be composed)
- ...and React RocketJump provides multiple inheritance
- but you can only inherit from abstract classes (i.e. every non-abstract class is sealed)

Beware, this is not a strict parallelism, it is just to clarify the difference between RocketJump Objects and RocketJump Partials. In practice, when we use the RocketJump Constructor what happens behind the curtains is that configuration objects are squashed into a single one, that is then used as a recipe to instruct the engine about how to deal with a side-effectful operation. You can find more details later, in the [composition section](api_composition.md)

The RocketJump constructor takes an arbitrary number of arguments

```js
const someState = rj(partial1, partial2, ..., partialN, config)
```

each of which is a RocketJump `partial` except for the last one, which is a plain object.

The only required argument is the config object, hence it is allowed to call the `rj` constructor without any partial in it.

The kind of output (RocketJump Object vs RocketJump Partial) depends only on the `config` parameter: if it contains an `effect` property (see later), the output will be a RocketJump Object, otherwise it will be a RocketJump Partial

In the rest of this document, we will describe the properties you can use when writing a `config` object.

## The config object

The config object can contain the following properties

### effect

`(...args) => Promise | (...args) => Observable`

The `effect` configuration property is very important, since when you set it the library will create a RocketJump Object instead of a Partial. This property is expected to contain the async task you want to manage: this can be any function you wish, provided that you return a `Promise` or an `Observable` provided by [rxJS](https://rxjs-dev.firebaseapp.com/). The rest is up to you.

Parameters of the function you pass are in principle up to you: you are free to define them as you wish, but please note that some other configuration properties (like *effectCaller*) may influence the way parameters are passed to your function.

**Example**

Making a simple RocketJump Object that makes a GET request (using SuperAgent in our example, but you can use any library of choice) to some host

```js
import { rj } from "react-rocketjump"
import request from "superagent"

const rjObject = rj({
  effect: id =>
    request
      .get(`https://my.host.dev/api/resource/${id}/`)
      .then(({ body }) => body),
})
```

**Example**

Making a simple RocketJump Object that retrieves data about a user using rxJS Ajax tools

```js
import { rj } from "react-rocketjump"
import { ajax } from "rxjs/ajax"

const rjObject = rj({
  effect: () => {
    return ajax({
      url: 'https://my.api.dev/users/Alice',
      method: 'GET',
      headers: {
        /*some headers*/
      },
    })
  },
})
```

There are some situations in which you may want to create a bare RocketJump Object wrapping a single task without extending any RocketJump Partial and without settings other configuration options apart from *effect*. In this case, there is a shortcut syntax that allows you to invoke the RocketJump Constructor like this

```js
const effect: (...args) => Promise | Observable

const rjObject = rj(effect)
```

**Example**

Making a simple RocketJump Object that makes a GET request (using SuperAgent in our example, but you can use any library of choice) to some host


```js
import { rj } from "react-rocketjump"
import request from "superagent"

const rjObject = rj(id =>
  request
    .get(`https://my.host.dev/api/resource/${id}/`)
    .then(({ body }) => body)
)
```

### name

`string`

A simple name for the RocketJump Object. This should be defined only when *effect* is defined, and its only effect is to include actions passing through any instance of the RocketJump Object in the [logger](debug_logger.md). That means that, whenever you instantiate a RocketJump Object with the *name* property set, it will attach to the logger and stream actions to it so that these are logged properly

In composition, this property is a *overwrite* property (more info in [composition section](api_composition.md))

### actions

`Object<Action> => Object<Action>`

React-RocketJump creates some predefined actions to manage asynchronous tasks. These actions are

- `run`, which starts a run of the task
- `cancel`, which drops any pending run of the task
- `clean`, which is like `cancel` but also cares of resetting the state
- `updateData`, which is not asynchronous and is just used to replace the data contained in the state with some other data

This function is used to transform predefined actions, or to add custom ones. It is passed an object containing the actions defined in imported RocketJump Partials and the predefined `run`, `cancel`, `clean` and `updateData` actions, and it is expected to return an object containing other actions (the keys in the object are the names of the actions). The output of the function is then merged with its input: this allows you to overwrite some action, while keeping other actions untouched, without writing plenty of boilerplate code. A common use for this is to change the way in which the predefined actions are run, or to add completely custom actions.

An action is nothing more than a function returning either a JS object or a RocketJump Action.
- If the return value is a plain JS object, it is treated as a plain, synchronous action, and dispatched without further treatment to the reducer defined for the RocketJump Object. When you define some action of this class, you will probably want to configure the *reducer* that manages the state to handle your custom action
- RocketJump Actions are instead created with the `makeAction` helper provided by the library, and their intrinsic feature is that they are not sent to the reducer, but to the effect pipeline, which in turn decides which action(s) send to the reducer. The effect pipeline is the only place you can work with asynchronous code, await for tasks to complete, and trigger plain actions on the reducer. You may hook into the side effect management with the *effectPipeline* configuration property.

Just to make some examples:
- `run`, `clean` and `cancel` are RocketJump Actions created with `makeAction` and handled by the default effect pipeline
- `updateData` is a plain action handled by the default reducer

In composition, this property is a *chain property* (more info in [composition section](api_composition.md))

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

When you instantiate a RocketJump Object in a React Component, one of the things you get is a state object, which contains some data. The exact structure of the state object is discussed [here](api_rj.md), but for the sake of this property we can treat it as a black box. Selectors are in fact a way to drill data out from the state object. A selector is hence a function that takes a state object and returns some property of it.

This configuration property can be used to transform predefined selectors or to add new ones. It is passed an object containing some selectors and it is expected to return, again, an object containing some other selectors. The keys of those objects are the name of the selectors. The selector bag returned by the function is merged with that given as input: this allows you to pass some selectors untouched while overwriting or adding other ones. When creating new selectors, you may want to leverage some of the default ones, like in the example below.

Default selectors are
- *getData*, which extracts from the state the resolved value of the last (successful) effect execution
- *getError*, which extracts from the state the error value of the last (rejected) effect execution
- *isPending*, which extracts from the state a boolean value that is true when some instance of the effect is running

In composition, this property is a *chain property* (more info in [composition section](api_composition.md))

**Example**

This partial is used to create a selector that converts a string from the state to upper case before returning it to the component

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

When you instantiate a RocketJump Object in a React Component, one of the things you get is a state object, which contains some data. How these data are structured and how these data transformed along time is up to the Reducer function: a reducer is a ***pure*** function (i.e. same input means same output, no side effects, no asynchronous code, nothing more). When some events happen, an action object is generated and the reducer is asked to compute next state starting from the previous state and the action.

By default, React RocketJump provides a reducer that handles some actions/events related to task management:
- user asks to trigger a new effect execution
- a new effect execution is started
- an effect execution completes
- an effect execution rejects with some error

You can customize or extend the base reducer with the *reducer* configuration option. This option is passed the base reducer and it is expected to return the new reducer. You are invited to use this property wisely: if you need to handle some custom plain actions, provide a reducer that handles them and call the base reducer that is passed to you as a parameter for any other action (this, for instance, ensures that library actions are handled by the default reducer)

When writing a reducer you should have a deep knowledge of the state of the component. We recall the default state shape here
```js
{
  "data": any,
  "error": any,
  "pending": boolean
}
```
Note that RocketJump Partials (or plugins, which are in the end implemented as RocketJump Partials), may change this shape


In composition, this property is a *recursive* property (more info in [composition section](api_composition.md))

**Example**

This configuration describes the extension of a reducer to add support for a new action, whose behaviour is to swap the surname and the name of a person

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
    return oldReducer(state, action) // forward any other action to the default reducer
  },
})
```

In some situations, you may need to hook into the handling of a library action like the ones defined above. Those actions are objects with the following shape:

```js
import { PENDING, SUCCESS, ERROR, UPDATE_DATA } from "react-rocketjump"

const effectIsStartedAndEntersPendingState = {
  type: PENDING,
  meta: /* metadata you attached to the call that triggered the side effect */
}

const effectHasCompletedSuccessfully = {
  type: SUCCESS,
  payload: {
    data: /* the resolve value of the effect */,
    params: /* args passed to the call that triggered the side effect */
  },
  meta: /* metadata you attached to the call that triggered the side effect */
}

const effectHasRejected = {
  type: ERROR,
  meta: /* metadata you attached to the call that triggered the side effect */
  payload: {
    error: /* the error with which the effect rejected */
  }
}

const someoneAskedToUpdateDataInTheState = {
  type: UPDATE_DATA,
  payload: /* data to replace in the `data` property of the state */
}

```

### computed

`{ [key: string]: string }`

This configuration option allows to transform the state shape that will be exposed to the outside world (i.e. the React world) when a RocketJump object carrying it is connected (keep on reading, connection is explained in the next section). The value accepted by this property is a plain JavaScript objects whose keys are arbitrary strings and whose values are selector names (i.e. keys of the selector bag defined a couple of paragraphs above). From the engine point of view, setting this key means asking him to provide the outside world with a shadow state object. This object is derived from the original state (which is kept untouched behind the curtains) with the following logic: for each key in the `computed` property, take the associated selector and invoke it on the original state object; the output of this invocation will be the value associated to the current key in the shadow state.

The computed prop is a opt-in prop: if the configuration object or any plugin defines it, the shadow state is created and there is no way to access props that the shadow state does not expose (except when using the `mapStateToProps` parameter in the RocketJump Object connection, see [here](connect_generalities.md)). If otherwise neither the config nor any plugin define it, the original state is directly exposed. Hence, when working with plugins, pay attention whether this prop is defined or not.

Beware that you cannot bind a selector multiple times: if you do it, the latest binding in composition order wins.

In composition, this property is a *merged* property (more info in the [composition section](api_composition.md))

**Example**

In this example, we create a shadow state object with only the output of `getData(originalState)` exposed as a `result` property. This means we won't be able to access `isPending` or `error` without sing the `mapStateToProps` parameter in the RocketJump Object connection, see [here](connect_generalities.md).

```js
const myRjObject = rj({
  effect: doSomethingAsync,
  computed: {
    result: 'getData'
  }
})
```

**Example**

In the following example, only `yyy` will be defined in the connected `RocketJump Object` (this is done to prevent multiple evaluations of the same selector)

```js
const RjPart = ({
  computed: {
    xxx: 'getData'
  }
})

const RjObject = (
  RjPart,
  {
    effect: doSomethingAsync,
    computed: {
      yyy: 'getData'
    }
  }
)

```

### composeReducer

`((state, action) => state)[]`

This setting can be confused with the *reducer* one, as it again modifies the reducer, but the way it operates is quite different. The `reducer` key allows to replace the old reducer with a completely new, custom reducer, while `composeReducer` produces a new reducer that chains its arguments (the first implicit argument is the base reducer we dealt with when talking about the `reducer` setting). When an action is dispatched to an instantiated RocketJump Object (i.e. a RocketJump object inserted into a React Component, refer to [this](connect_generalities.md) for more information), the reducer is in charge of computing the next state. If this configuration option is set, every reducer in the array it provides is involved in the computation: the i-th element in the array is invoked with the output of the (i-1)-th item as the old state and the dispatching action as arguments, and its return value becomes the old state for the (i+1)-th reducer. The old state for the first item in the array is the output of the reducer created with the *reducer* configuration property (or by the default reducer if the *reducer* configuration is not given), and the state that will be persisted at the end of the computation is the output of the last reducer in the array.

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

In composition, this property is (indirectly) a *recursive* property (more info in the [composition section](api_composition.md)). We say "indirectly" because this property is squashed onto the *reducer* property before composition applies (i.e. composition sees a opaque reducer function, which inside implements the described behaviour).

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

`(effect, ...params) => Promise | (effect, ...params) => Observable`

This setting is used to hook into the process of launching the effect, and can be used to alter its params or to add some more of them. The first argument is the `effect` to be called, and the subsequent arguments are the arguments the user sent in the `run` action. You can do everything you need here, the important thing is that you call the effect and return the Promise used to await for task completion, or an Rx Observable (this is useful if you are using rxJS Ajax).

In composition, this peroperty is a *recursive* property (more info in the [composition section](api_composition.md))

**Example**

Injecting a new argument, for instance an authentication token

```js
const TOKEN = 'somesecretyoudontwanttocommittogithub'

const rjPart = rj({
  effectCaller: (effect, ...params) => effect(TOKEN, ...params),
})
```

### mutations

`Object`

This setting is used to combine multiple side-effects working on the same data, like a bunch of tasks that write to a common state. This is useful, for instance, when you deal with REST APIs: you put as `effect` the `GET` call, and map all the other HTTP verbs on mutations, since, at the end, they are all tasks that write the same state.

[Read the complete documentation about mutations](api_mutations.md)

This property can be defined only in the same object defining the `effect` configuration property, so they are not involved in composition.

### takeEffect

`string | [policy: string, ...arguments] | (observable: RxObservable, mapTo: action => RxObservable) => RxObservable`

This setting is used to control what to do when more instances of a task are spawned concurrently. The `policy` argument is a `String`, and can assume one of the following values

- `latest`: cancel any pending task except for the latest, or, in other words, when a task is launched it tells the engine to kill all the pending instances before launching it
- `every`: never cancel a task, just await all of them to complete. No grants about order of completion is set.
- `exhaust`: if there is a pending instance of the task, it ignores any other attempt to spawn other instances of the same task
- `groupBy`: compute a key for each task invocation, and behaves like the `latest` policy with respect to tasks with the same key.
- `groupByExhaust`: compute a key for each task invocation, and behaves like the `exhaust` policy with respect to tasks with the same key.

The only case in which it is required to pass an argument is the `groupBy` case, where a key making function is required. The key making function is called with the `run` action object as a parameter, and is expected to return a scalar (int or string does not matter).

The run action object has the following shape
```js
import { RUN } from "react-rocketjump"
const UserHasTriggeredTheTask = {
  type: RUN,
  payload: {
    params: /* array of arguments the user passed to the call that triggered the side effect */
  },
  meta: /* metadata the user attached to the call that triggered the side effect */
}
```

You can also pass a function to this configuration property in order to define your own policy. This function is called with the following arguments:

- `action$`
- `mergeObservable$`
- `state$`
- `extraSideEffectObs$`
- `mapActionToObserable`
- `prefix`

This function is expected to return an `Observable` provided by rxJS

**Example**

Group tasks by a meta key

```js
const rjPart = rj({
  takeEffect: ['groupBy', action => action.meta.id],
})
```

In composition, this is a *overwrite* property (more info in the [composition section](api_composition.md))

### effectPipeline

`(actionObservable: RxObservable, stateObservable: RxObservable) => RxObservable`

This is used to customize the pipeline used to dispatch actions to observables. It is passed in a function that is called with the action stream and the state stream and it is expected to return again an RxObservable. This configuration setting is useful to introduce some transformations supported by RxJs, for instance `debounce`

**Example**

Debounce an API call

```js
import { rj } from 'react-rocketjump'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

const TypeaheadState = rj({
  effectPipeline: (action$, state$) =>
    action$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ),
  effect: search => {
    return fetch(`/api/users?search=${search}`).then(r => r.json()),
  }
})
```

State Observable also expose a `.value` field to access the current state value.

**Example**

Pass to effect the current next token.


```js
import { rj, RUN } from 'react-rocketjump'
import { map } from 'rxjs/operators'

const WithNextToken = rj({
  effectPipeline: (action$, state$) =>
    action$.pipe(
      map(action => {
        if (
          action.type === RUN &&
          state$.value.data &&
          state$.value.data.nextToken !== null
        ) {
          return {
            ...action,
            payload: {
              params: action.payload.params.concat(state$.value.data.nextToken),
            },
          }
        }
        return action
      })
    ),
  effect: (nextToken = '') => {
    return fetch(`/api/users?nextToken=${nextToken}`).then(r => r.json()),
  }
})
```

Or if your prefer a more reactive approach:

```js
import { rj, RUN } from 'react-rocketjump'
import { map, withLatestFrom } from 'rxjs/operators'

const WithNextToken = rj({
  effectPipeline: (action$, state$) =>
    action$.pipe(
      withLatestFrom(state$),
      map(([action, state]) => {
        if (
          action.type === RUN &&
          state.data &&
          state.data.nextToken !== null
        ) {
          return {
            ...action,
            payload: {
              params: action.payload.params.concat(state.data.nextToken),
            },
          }
        }
        return action
      })
    ),
  effect: (nextToken = '') => {
    return fetch(`/api/users?nextToken=${nextToken}`).then(r => r.json()),
  }
})
```
