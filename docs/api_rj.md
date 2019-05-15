---
id: api_rj
title: RocketJump constructor
sidebar_label: RocketJump constructor
---

```js
import { rj } from 'react-rocketjump'
```

The RocketJump constructor is the entry point of the library, and allows the definition of RocketJump `objects` and RocketJump `partials`. The only difference between an `object` and a `partial` is that the object is tied to a task and can be connected to a component, while a `partial` is a reusable logic that can be embedded in other `partial`s or `object`s but not connected to a component.

The RocketJump constructor takes an arbitrary number of arguments

```js
const someState = rj(partial1, partial2, ..., partialN, config)
```

each of which is a RocketJump `partial` except for the last one, which is a `config` object. The only required argument is the config object, hence it is allowed to call the `rj` constructor without any partial in it.

## The config object
The config object can contain the following properties

### actions
`Object<Action> => Object<Action>`

This function is used to transform predefined actions, or add custom ones. It is passed an object containing the actions defined in nested partials and the two predefined `run` and `clean` actions, and it is expected to return an object containing other actions (the keys in the object are the names of the actions). The returned object is merged with the previous one before being passed down along the chain. Each partial can, in fact, customize actions freely, and customization is applied recursively from the most to the least nested partial, and from left to right in case of siblings.

__Example__

This partial is used to change the behaviour of the run function so as to copy the first param into the metadata associated with the action

```js
const rjPart = rj({
    actions: ({ run }) => ({
        run: param => run(param).withMeta({ myParam : param })
    })
})
```

### selectors
`Object<Selector> => Object<Selector>`

This function is used to transform predefined selectors, or to add new ones. It is passed an object containing the selectors defined in nested partials and the predefined selectors `getData`, `isPending` and `getError`, and it is expected to return an object containing other selectors to be merged with them. Overwriting is possibile. Each partial can customize selectors freely, and customization is applied recursively from the most to the least nested partials, and from left to right in case of siblings.

__Example__

This partial is used to create a selector that changes some strings to upper case

```js
const rjPart = rj({
    selectors: ({ getData }) => ({
        getUpperData: state => {
            const data = getData(state)
            return {
                ...data,
                name: data.name.toUpperCase(),
                surname: data.surname.toUpperCase()
            }
        }
    })
})
```


### reducer
`((state, action) => state) => ((state, action) => state)`

This configuration option allows the transfomation of the reducer, usually with the intent of adding support for new actions. Is set, this property must point to a function which is invoked with the previous reducer as parameter and that is expected to return the new reducer. As for actions and selectors, transformations are composed from the most to the least nested RocketJump `partial`, and from left to right in case of siblings. Hence, the returned reducer could in principle be used to feed another reducer transformation. In order to grant composability, the returned reducer is expected to call the older one for any action it is not capable of dealing with. 

__Example__

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
                    name: surname
                }
            }
        }
        return oldReducer(state, action)
    }
})
```

### composeReducer
`((state, action) => state)[]`

This setting can be confused with the previous one, as it again modifies the reducer, but the way it operates is quite different. The `reducer` key allows to replace the old reducer with a completely new, custom reducer, while `composeReducer` produces a new reducer that chains its arguments (the first implicit argument is the old reducer we dealt with when talking about the `reducer` setting). Chaining means that the state object is at first passed to the first reducer (the old reducer), which will produce another state object, which will be in turn passed on to the second reducer in the list (the first in the array), and so on and so forth. The next state is the output of the last reducer in the array. The `reducer` setting has priority over this setting, but the two can be used together: the original reducer will be transformed according to the `reducer` setting, and then will be used for composition.

This setting has also a quick overload signature to avoid passing arrays of just one element, which is
`(state, action) => state`. The behaviour of the following descriptions is the same

```js
const rjPart = rj({
    composeReducer: (state, action) => produceNextState(state, action)
})

const rjPart = rj({
    composeReducer: (state, action) => [produceNextState(state, action)]
})
```

__Example__

This configuration describes the extension of a reducer to add support for a new action

```js
const rjPart = rj({
    composeReducer: [(state, action) => {
        if (action.type === 'SWAP') {
            const { name, surname } = state.data
            return {
                ...state,
                data: {
                    ...state.data,
                    surname: name,
                    name: surname
                }
            }
        }
        return state  /* Look at the difference with the reducer setting */
    }]
})
```

### effectCaller
`(effect, ...params) => Promise`

This setting is used to hook into the process of launching the effect, and can be used to alter its params or to add some more of them. The first argument is the `effect` to be called, and the subsequent arguments are the arguments the user sent in the `run` action. You can do everything you need here, the important thing is that you call the effect and return the Promise used to await for task completion.

__Example__

Injecting a new argument, for instance an authentication token

```js
const TOKEN = 'somesecretyoudontwanttocommittogithub'

const rjPart = rj({
    effectCaller: (effect, ...params) => effect(TOKEN, ...params)
})
```

### takeEffect
`[policy, ...arguments]`

This setting is used to control what to do when more instances of a task are spawned concurrently. The `policy` argument is a `String`, and can assume one of the following values

* `latest`: cancel any pending task except for the latest, or, in other words, when a task is launched kill all the pending instances before launching it
* `every`: never cancel a task, just await all of them to complete. No grants about order of completion is set.
* `queue`: manage task start operations using a queue: when a task is launched, it is enqueued waiting for all the previous (pending) instances to complete (or fail). Order of completion is granted to be the launch order.
* `exhaust`: if there is a pending instance of the task, it ignores any other attempt to spawn other instances of the same task
* `groupBy`: compute a key for each task invocation, and behaves like the `latest` policy with respect to tasks with the same key.

The only case in which it is required to pass an argument is the `groupBy` case, where a key making function is required. The key making function is called with the `run` action object as a parameter, and is expected to return a scalar (int or string does not matter)

__Example__

Group tasks by a meta key

```js

const rjPart = rj({
    takeEffect: ['groupBy', action => action.meta.id]
})
```

