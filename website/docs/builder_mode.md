---
id: builder_mode
title: Builder Mode
sidebar_label: Builder Mode
slug: /builder-mode
---

## Motivation

The main point of v3 is the ability to inferring the type of `RjObject` by your
configuration and plugins.

When using the standard rj constructor `rj(...plugins, config)` some stuff can't be
infered Es.. (the type of state in selectors) to avoid bad types in some situation
we give up and we fallback to `any`.

We expected that in future version of Typescript we can improve the types experience.

If your are interessed there is an open [issue](https://github.com/microsoft/TypeScript/issues/41396).

Here at [InMagik Labs](https://inmagik.com) we follow this mantra:

> Mater artium necessitas

So to have the maxium from Typescript we introduce the Builder Mode!

## Use builder mode

When you invoke `rj()` or `rjPlugin()` without parameters you enter the builder mode.

Instead of providing big object of options you chain the same option as builder
and when your are done call `.effect({ ... })` on `rj()` to build an `RjObject` or
`.build()` on `rjPlugin()` to build a plugin.

### rj builder mode

When use the builder mode with `rj` you should a logic order to permit the
library to infer good types.<br />
First, if you need them, you can to specify `.plugins()`.

```js
rj().plugins(p1, p2)
```

Then, if you need them , you can specify `.reducer()`,
`.composeReducer()`, `.combineReducers()` and `.actions()`.

```js
rj()
  .reducer((oldReducer) => newReducer)
  .composeReducer((state, action) => nextState)
  .actions((prevActions) => ({
    myAwesomeAction: () => {},
  }))
```

At this point you can define `.mutations()`.
Why now? Simple now RocketJump can infer the **REAL** state in your updater
function and suggest the string names infered from your previous `.actions()`
configure and even from your plugins! I encourge you to try the following example
in vscode:

```js
rj()
  .actions(() => ({
    bu: () => ({ type: 'BU' }),
  }))
  .reducer(() => () => 99)
  .mutations({
    myMutation: {
      effect: () => Promise.reject(),
      // number type is infered!
      updater: (state) => state.toFixed(2),
      // 'bu' type is suggest to you if you try insert a string!
      updater: 'bu',
    },
  })
```

Ok, now you can provide `.selectors()` and have the state infered by RocketJump.

```js
rj()
  .combineReducers({
    dragon: () => new Date(),
  })
  .mutations({
    rejectAliens: {
      effect: () => Promise.reject(),
      updater: 'updateData',
      reducer: () => ({ pending: true }),
    },
  })
  .selectors(() => ({
    // Oh yes baby state.dragon is infered as Date
    getYearOfDragon: (state) => state.dragon.getFullYear(),
    // ... And yes also mutations state is infered!
    // state.mutations.rejectAliens.pending is boolean
    isRejectingAliens: (state) => state.mutations.rejectAliens.pending,
  }))
```

The last possible configuration before closing the builder is `.computed()`.
...And yes what you think is exact we can infer both selector names and
the final state!

```js
rj()
  .combineReducers({
    dragon: () => new Date(),
  })
  .mutations({
    rejectAliens: {
      effect: () => Promise.reject(),
      updater: 'updateData',
      reducer: () => ({ pending: true }),
    },
  })
  .selectors(() => ({
    getYearOfDragon: (state) => state.dragon.getFullYear(),
  }))
  .computed({
    // All merged selector are provided as union!
    dragonYear: 'getYearOfDragon',
    // ... Finally yes all the state with mutations is infered!
    rejectingAliens: (state) => state.mutations.rejectAliens.pending,
  })
```

Where at the end, to close builder inovke the `.effect()` method and the
RjObject is returned!

You call `.effect()` with a function it's used as short cat as effect function:

```js
const MyObj = rj().effect(() => Promise.resolve('XD'))
// very close to
const MyObj = rj(() => Promise.resolve('XD'))
```

Otherwise you can provide all effect related property:

```ts
{
  effect: EffectFn,
  takeEffect?: TakeEffects,
  effectCaller?: RjEffectCaller,
  effectPipeline?: RjEffectPipeliner,
  addSideEffect?: TakeEffectHanlder,
  name?: string,
}
```

### rj plugin builder mode

All rules described for the rj builder also applied to the rj plugin builder.
Logic, for plugin builder plugins rules are applied. So `.computed()` and `.mutations()`
methods are not available.
To close `rjPlugin` builder and return an RjObject you should call the `.close()`
method, (this is different from rj builder cause in plugin there are no required options).

An example:

```js
const p1 = rjPlugin()
  .reducer((oldReducer) => (state, action) => {
    /**  **/
  })
  .actions(() => ({
    hello: () => ({ type: 'Hello' }),
  }))
  .combineReducers({
    plus: () => 88,
  })
  .build()

// ...
const MyObj = rj(p1, () => Promise.resolve(true))
```

## Final considerations

The builder mode is not only useful to writing configrations the accurated types
infered in the configuration are also applied to the final `RjObject`.

The good news it's that, where is possible, this advantage works good even in plain
JavaScrit environment.

So using the example from previous sections:

```js
const WeirdState = rj()
  .combineReducers({
    dragon: () => new Date(),
  })
  .mutations({
    rejectAliens: {
      effect: () => Promise.reject(),
      updater: 'updateData',
      reducer: () => ({ pending: true }),
    },
  })
  .selectors(() => ({
    getYearOfDragon: (state) => state.dragon.getFullYear(),
  }))
  .computed({
    dragonYear: 'getYearOfDragon',
    rejectingAliens: (state) => state.mutations.rejectAliens.pending,
  })
  .effect(() => Promise.reject())

function Hello() {
  const [
    {
      // type number is infered
      dragonYear,
      // type boolean is inferd
      rejectingAliens,
    },
    {
      // All special method such withMeta, onSuccess, ecc are infered
      rejectAliens,
    },
  ] = useRunRj(WeirdState)
}
```
