---
id: mutations
title: Mutations
sidebar_label: Mutations
slug: /mutations
---

Mutations are a first class api of RocketJump to describe asynchronous "mutation"
of your root state. <br />
You can add mutations to your RjObject with the `mutations` config option, an object
where the _keys_ are the **mutation names** and the values are the your mutation config.

A mutation is essentially defined by two elements:

- the effect (that follow the same rules as main RocketJump effect).
- the logic to update the root state given the result of the effect (**updater**).

Then we can add some accessory options:

- The [effectCaller](effect_caller.md) for the mutation effect.
- The [takeEffect](side_effects.md) to describe the mutation side effect.
- The reducer to track mutation state.

Mutation are based to the other RocketJump elements. So for each mutation
RocketJump perform the following task:

- Create a side effect with the same rules of RocketJump side effects using mutation
  settings `effect`, `effectCaller` and `takeEffect`.
- Add an [effect action creator](action_creators.md) using the mutation name (the key of your configuration).
- If the `reducer` mutation option is given create a reducer under the key: `mutations.[mutationName]`.
- Apply the `updater` function to your root state when effects resolves.

Here an example of a simple mutation:

```js

```

## Writing mutations

Now we go in deep of how confguring mutations.

### `effect`

The effect of the mutation, works as RocketJump effect.

### `updater`

A **pure function** used to update your [root state](reducer.md) in response
of the mutation effect completation.

<!-- prettier-ignore -->
```js
(rootState, result) => nextRootState
```

Otherwise you can provide a _string_ refer a action creator name.
For example we can use the built-in `updateData` action creator to simple
update the `data` when mutation complete:

```js

```

### `reducer`

action are decopled ecc

### `effectCaller`

false vs inherit ecc


### `takeEffect`
Default but default is `every`

### Consume mutation state

### Standard mutations

### Optimistic mutations