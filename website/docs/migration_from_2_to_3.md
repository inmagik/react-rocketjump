---
id: migration_from_2_to_3
title: Migration from 2.x to 3.x
sidebar_label: Migration from 2.x to 3.x
slug: /migration-from-2-to-3
---

This is a crash guide to updrage RocketJump from version `2.x` to `3.x` version.

## Rewrite custom plugin from `rj()` to `rjPlugin()`

If you have written **custom** plugin simply replace the plugin code from using
`rj()` to `rjPlugin()`. <br />
If you use core plugins are alredy converted.

From v2:

```js
import { rj } from 'react-rocketjump'

const myPlugin = rj({
  // ... Plugin Code ...
})

const MyObj = rj(myPlugin, () => Promise.resolve())
```

To v3:

```js {3,3}
import { rj, rjPlugin } from 'react-rocketjump'

const myPlugin = rjPlugin({
  // ... Plugin Code ...
})

const MyObj = rj(myPlugin, () => Promise.resolve())
```

## No more plugin computed

Computed are no more availables on plugins so if you use plugins that provide
computed you should specify them manually.<br />

The following examples are tired to RocketJump core plugins the same thoughs
can be applied to your custom plugin.

### `rjPlainList`

From v2:

```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'

const MyObj = rj(rjPlainList(), {
  effect: () => Promise.resolve(),
})
```

To v3:

To have the same computed on RjObject.

```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'

const MyObj = rj(rjPlainList(), {
  effect: () => Promise.resolve(),
  computed: {
    error: 'getError',
    loading: 'isLoading',
    list: 'getList',
  },
})
```

### `rjList`

From v2:

```js
import { rj } from 'react-rocketjump'
import rjList from 'react-rocketjump/plugins/list'

const MyObj = rj(rjList(), {
  effect: () => Promise.resolve(),
})
```

To v3:

To have the same computed on RjObject.

```js
import { rj } from 'react-rocketjump'
import rjList from 'react-rocketjump/plugins/list'

const MyObj = rj(rjList(), {
  effect: () => Promise.resolve(),
  computed: {
    error: 'getError',
    loading: 'isLoading',
    list: 'getList',
    pagination: 'getPagination',
  },
})
```

## No more special `@mutation` computed

The special `'@mutation'` computed was removed.
To use mutations state you should write your selectors or better provide
inline computed.

From v2:

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  mutations: {
    writeStuff: rj.mutation.single({
      effect: () => Promise.resolve(),
      updater: 'updateData',
    }),
  },
  effect: () => Promise.resolve(),
  computed: {
    writing: '@mutation.writeStuff.pending'
  },
})
```

To v3:

:::tip
If you want to save time and you love regex you can use find-replace with the following regex: <br />
**Find:**<br />
`('|")@mutation\.(.+)('|")`<br />
**Replace:**<br />
`s => s.mutations.$2`
:::

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  mutations: {
    writeStuff: rj.mutation.single({
      effect: () => Promise.resolve(),
      updater: 'updateData',
    }),
  },
  effect: () => Promise.resolve(),
  computed: {
    writing: (s) => s.mutations.writeStuff.pending,
  },
})
```

## Selectors use all state instead of root state

In RocketJump v2 the state can change shape depending on your mutation confiuration,
but you selector was only related to root state:

In v2:

```ts
{
  pending: boolean,
  error: any,
  data: any
}
```

In v3 the selector shape is:

```ts
{
  root: {
    pending: boolean,
    error: any,
    data: any
  }
}
```

If you use RocketJump selectors your code still working.<br />
The code below works bot in v2 and v3.

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  selectors: ({ getData }) => {
    getGoodData: (state) =>
      (getData(state) ?? []).filter((a) => a.good === true)
  },
  effect: () => Promise.resolve(),
})
```

While this code is break in v3:

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  selectors: ({ getData }) => {
    getGoodData: (state) => (state.data ?? []).filter((a) => a.good === true)
  },
  effect: () => Promise.resolve(),
})
```

You can fix it by adding `root` or using RocketJump selectors.<br />
This is the code translated for v3:

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  selectors: ({ getData }) => {
    getGoodData: (state) =>
      (state.root.data ?? []).filter((a) => a.good === true)
  },
  effect: () => Promise.resolve(),
})
```

#### Selectors and actions enhancers

In v2 you can write it as:

```js
rj({
  selectors: {
    newSelectors: prevSelectors => state => /** **/,
  },
  actions: {
    newAction: prevActions => (...args) => /** **/,
  }
})
```

In v3 you can **ONLY** use this syntax (the most used):

```js
rj({
  selectors: (prevSelectors) => ({
    newSelectors: state => /** **/,
  }),
  actions: (prevActions) => ({
    newAction: (...args) => /** **/,
  })
})
```

## Compose reducer init

In version 2.x the `composeReducer` ins't a simple composition utility, but it
merge the inital values of provided composed function, since v3 `composeReducer` simply
compose reducers.

In v2:

```js
const { reducer } = rj({
  composeReducer: (state = { foo: 23 }) => state,
})
// Root State Shape:
/*{
  pending: false,
  error: null,
  data: null,
  foo: 23,
}*/
```

In v3:

```js
const { reducer } = rj({
  composeReducer: (state = { foo: 23 }) => state,
})
// Root State Shape:
/*{
  pending: false,
  error: null,
  data: null,
}*/
```

You can achieve the same result by doing:

```js
const { reducer } = rj({
  composeReducer: (state, action) => {
    if (action.type === INIT) {
      return { ...state, foo: 23 }
    }
    return state
  },
})
```

## Rename `makeAction` to `makeEffectAction`

The `makeAction` name was too generic and confusing the only reason you have to
use this helper is works with side effect we renamed it to `makeEffectAction`.

From v2:

```js
import { makeAction } from 'react-rocketjump'
```

To v3:

```js
import { makeEffectAction } from 'react-rocketjump'
```


## Change behaviour of custom effect action

In version 2.x all custom _effect action_ are always dispatched to reducer.
Es:.


In v2:
```js
import { rj, makeAction } from 'react-rocketjump'

rj({
  actions: () => ({
    bu: () => makeAction('BU'),
  }),
})
```

In v2 calling `actions.bu()` was supposed to be dispatched in `reducer`.
Since v3 you have to manually handle how `'BU'` type side effect is handled.
To simple dispatch it on reducer the code should be something like:

```js
import { rj, makeEffectAction } from 'react-rocketjump'
import { filter } from 'rxjs/operators'

rj({
  actions: () => ({
    bu: () => makeEffectAction('BU'),
  }),
  addSideEffect: (actionObservable) =>
    actionObservable.pipe(filter((action) => action.type === 'BU')),
})
```

We also change the custom `takeEffect` signature to `TakeEffectHanlder`:

```ts
interface TakeEffectBag {
  effect: EffectFn
  getEffectCaller: GetEffectCallerFn
  prefix: string
}

interface StateObservable<S = any> extends Observable<S> {
  value: S
}

type TakeEffectHanlder = (
  actionsObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  effectBag: TakeEffectBag,
  ...extraArgs: any[]
) => Observable<Action>
```

## Deprecated `rj.configured()`

We deprectated the ~~`rj.configured()`~~ syntax in favor of simply `'configured'` string
when setting the `effectCaller` option.

From v2:

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  effectCaller: rj.configured(),
  effect: () => Promise.resolve(),
})
```

To v3:

```js
import { rj } from 'react-rocketjump'

const MyObj = rj({
  effectCaller: 'configured',
  effect: () => Promise.resolve(),
})
```