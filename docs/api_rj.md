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

### `actions: Object<ActionCreator> => Object<ActionCreator>`
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

### `selectors: Object<Selector> => Object<Selector>`

### `reducer: ((state, action) => state) => ((state, action) => state)`

### `composeReducer: ((state, action) => state)[]`

### `effectCaller: (effect, ...params) => Promise`

### `takeEffect: [policy, ...arguments]`



