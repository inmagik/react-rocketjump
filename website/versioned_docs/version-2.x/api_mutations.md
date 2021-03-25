---
id: api_mutations
title: Mutations
sidebar_label: "Extension: mutations"
slug: /api-mutations
---
## Generalities
Mutations are a way to easily combine multiple side-effectful operation working on the same data. For instance, when we deal with a REST resource, it's highly recommended to keep the representation of your resource in a single state and to update it with mutations, that in turn map to HTTP verbs.

There are solutions to problems of this kind even without mutations (for instance, a possible solution is [this](tips_and_tricks.md)), but using mutations allows you to better group conceptually related functionalities together, to keep your application state clean, and to use a declarative pattern.

A mutation is essentially defined by two elements:
- the effect to run (*effect*)
- the logic to update the shared state given the result of the effect (*updater*)

Then we can add some accessory elements:
- some logic used to invoke the effect (*effectCaller*)
- some logic used to keep a mutation state (for instance, to track when the effect is running) (*reducer*)
- some logic used to describe what to do when multiple runs of a mutation are asked by user (*takeEffect*)

Given this, React RocketJump can create a full mutation workflow:
1. For each mutation, a special RocketJump Action is created and injected in the action bag
2. Calling the injected action causes the *effectCaller* to be invoked
3. The *effectCaller* is in turn expected to invoke the *effect*
4. As long as the *effect* proceeds, some plain actions can be intercepted by the *reducer*, if defined
5. When the *effect* resolves successfully, the *updater* is called with the previous state and the *effect* result in order to compute the next state

## Defining mutations
Mutations can be defined for a RocketJump Object by adding a *mutations* configuration property as a sibling of the *effect* property. The *mutations* property contains an Object whose property names are mutation names, and the corresponding values are mutation descriptors, like this

```js
const SomeRjObject = rj({
    effect: id => fetchPlayerById(id),
    mutations: {
        update: UpdateMutationDescriptor,
        ban: BanMutationDescriptor,
        reward: RewardMutationDescriptor,
        ...
    }
})
```

A mutation descriptor is nothing more than a plain JavaScript object with some configuration in. In the following, we are going to describe all the available configuration options

### effect

`(...args) => Promise | (...args) => Observable`

The `effect` configuration describes the side effect performed by the mutation: this can be any function you wish, provided that you return a `Promise` or an `Observable` provided by [rxJS](https://rxjs-dev.firebaseapp.com/). The rest is up to you.

Parameters of the function you pass are in principle up to you: you are free to define them as you wish, but please note that some other configuration properties (like *effectCaller*) may influence the way parameters are passed to your function.

### updater

`string | (state: Object, effectResult: Object) => Object`

The `updater` configuration property describes how to update the shared state given the result of a run of the mutation: each time the mutation completes, this function is called to reconcile the state. In order to write it properly, you must have a knowledge of the state shape. The default state shape in React RocketJump is

```js
{
    data: /* result of the last successful (main) effect run */,
    error: /* error of the last rejected (main) effect run */,
    pending: /* bool telling if the (main) effect is running */,
}
```

where with *main* effect is the one defined in the configuration object, not that defined in the mutation. Anyway, remember that you can change it by setting a *reducer* property on your configuration, or by using some plugin, or again by extending some RocketJump Partials, ... Summing up, refer to the documentation of the options you are using to deduce to know the right state shape.

The *updater* function must be *pure*: given the same params, it must produce the same result. No side effects here. Forget them.

As a shortcut, you can also set the *updater* to the name of any action present in the action bag: the action will be invoked with the effect result as a parameter and will be delegated to update the state

### effectCaller

```ts
type Effect = Function<Promise | Observable>
effectCaller: false |
              rj.configured() |
              (effect: Effect, ...params: any[]) => Promise | Observable
```

This setting is used to hook into the process of launching the effect, and can be used to alter its params or to add some more of them. The first argument is the `effect` to be called, and the subsequent arguments are the arguments the user sent in the action associated to the mutation. You can do everything you need here, the important thing is that you call the effect and return the Promise used to await for task completion, or an Rx Observable (this is useful if you are using rxJS Ajax).

This is an optional setting:
- if you don't set it, the RocketJump Object `effectCaller` is used to invoke the effect (it is inherited)
- if you set it to `false`, the default effect caller is used (simply, the effect is called with the given arguments)
- if you set it to `rj.configured()` the `effectCaller` is taken from the nearest `<ConfigureRj />` component up in the tree
- if you set it to a function, that function is used

### takeEffect

`string | [policy: string, ...arguments] | (observable: RxObservable, mapTo: action => RxObservable) => RxObservable`

This setting is used to control what to do when more instances of a task are spawned concurrently. Its usage is identical to the omonimuos setting of the main RocketJump definition, so please refer to the description in the [rj constructor section](api_rj.md#takeeffect)

### reducer

`(state: Object, action: Object) => Object`

This setting can be used to give a mutation some state, for instance to track if it is running or not, or to read errors.

Shaping the state here is up to you, there is no default state

The actions that this reducer is expected to recognize are:
- *INIT*, dispatched when the state is mounted
- *RUN*, dispatched when a run of the mutation is scheduled
- *PENDING*, dispateched when a run of the mutation starts
- *SUCCESS*, dispatched when a run of the mutation resolves
- *FAILURE*, dispatched when a run of the mutation rejects with some error

Their shape is the following:
```js
import { INIT, RUN, PENDING, SUCCESS, FAILURE } from "react-rocketjump"

{
  type: INIT
}

{
  type: RUN,
  payload: {
    params,         // the params your side effect was invoked with
  }
  meta: {
    params          // the params your side effect was invoked with
  },
}

{
  type: PENDING,
  meta: {
    params,         // the params your side effect was invoked with
  },
}

{
  type: SUCCESS,
  meta: {
    params,
  },
  payload: {
    data,           // the result of your mutation side effect
    params,         // the params your side effect was invoked with
  }
}

{
  type: FAILURE,
  meta: {
    params,         // the params your side effect was invoked with
  },
  payload           // the rejection value of your side effect
}
```

## Mutation wrappers
React RocketJump provides some utilities to setup sensible defaults on *takeEffect* and *reducer* for the most common cases

### Single mutation
This options set is thought for mutations that have no overlapping or concurrent runs. A common use case, for instance, is a form submission.

This preset sets *takeEffect* to *exhaust* and configures the reducer to mantain a state with the following shape:
```js
{
    pending: bool,  // is the mutation running?
    error: any      // rejection value of last failing run
}
```

You can apply it to a mutation like this
```js
const TodosStateRj = rj({
  effect: () => fetch(`/user`).then(r => r.json()),
  mutations: {
    updateUserProfile: rj.mutation.single({
      // takeEffect and reducer are injected for you
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
    })
  },
})
```

### Multiple mutation
This option set is designed for mutations that have multiple concurrent runs. Furthermore, it applies a grouping logic: runs belonging to the same group cannot be parallel and only one run per group can be active at a time.

The application of this preset requires the user to define a key derivation function, that is a function that computes a key from the params fed into the mutation call. Runs with the same key are inserted in the same group, with the logic stated above.

This preset sets *takeEffect* to *groupByExhaust*, and the reducer is configured to mantain a state with the following shape:
```ts
{
  pendings: {
    [key]: true | undefined,
  },
  errors: {
    [key]: any | undefined
  }
}
```

You can apply it to a mutation like this
```js
const TodosState = rj(
  rjPlainList(),
    {
    mutations: {
      toggleTodo: rj.mutation.multi(
        todo => todo.id,     // Key derivation function
        {
          effect: todo => fetch(`/todos/${todo.id}`, {
             method: 'PATCH',
             body: { done: !todo.done }
          }).then(r => r.json()),
          updater: 'updateItem'
        }
      )
    },
    effect: () => fetch(`/todos`).then(r => r.json()),
  }
)
```

## Using the mutations state

> Mutation state is defined only for mutations with a *reducer* configured
> If you use rj.mutation.single or rj.mutation.multi a *reducer* is automatically provided, otherwise you need to define your own

When you configure mutations in the context of a RocketJump Object, any instance of it will have the state sliced in two parts
- a slice holds the main state (i.e. the state you would have had if you did not define mutations)
- the other slice holds a state object for any defined mutation

Selectors have been put in place to deal with this situation
- *getRoot* extracts the main state from the (opaque) state object
- *getMutation* extracts the state of a mutation

You can use them like in these examples

```js
const [state, actions] = useRunRj(RjObject, (state, { getRoot, getData }) => ({
  mainState: getData(getRoot(state)),
}))
```

```js
const [state, actions] = useRunRj(MaRjObject, (state, { getMutation }) => ({
  pending: getMutation(state, 'mutationName.path.to.your.state.as.deep.as.you.want'),
}))
```

Furthermore, you can refer to mutations' states in *computed* section using a special selector `@mutation`, like the following example:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile: rj.mutation.single({
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
    })
  },
  effect: () => fetch(`/user`).then(r => r.json()),
  computed: {
    // Select data from your root state
    todos: 'getData',
    // Select data from a mutation state (`updateUserProfile`) is the name of the mutation
    // followed by the path, relative to mutations state root, of the data you want to extract
    updatingProfile: '@mutation.updateUserProfile.pending',
  },
})
```

