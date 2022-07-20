## 3.0.0

##### _July 20th, 2022_

This is a very big release for the Rocketjump library, there are a lot of breaking
changes.
All the library is was rewritten in Typescript and the core (`rocketjump-core` package)
it also was rewritten in Typescript and merged back in the codebase.

The philosophy of the library remains the same:
Do much with less code.

But we cut some _tricky_ features to take the maxium advantage from Typescript
and modern era editors like vscode.

This is a stepping stone relase to future awesome implementation,
so some breaking changes are necessary.

On the other hand we notice that simpler apps still working with no additional
effort.

### :bangbang: Breaking changes

#### Rj constructor and plugin system

In previous version we use a convetion: only the `rj()` invocation with
**effect** signature can create a valid `RjObject` that can be used as input for
`useRj` or `useRunRj`, otherwise the result was a plugin.

In version 3 this convention is removed, instead we introduced an explicit `rjPlugin`
a function specialized in crafting plugins.

Note that the signature and all the logic realted to the
plugin composition remains the same.

In v2:

```js
import { rj } from 'react-rocketjump'

rj(
  rj(/* ... */),
  rj(/* ... */),
  {
    effect: /* ... */
  }
)
```

In v3:

```js
import { rj, rjPlugin } from 'react-rocketjump'

rj(
  rjPlugin(/* ... */),
  rjPlugin(/* ... */),
  {
    effect: /* ... */
  }
)
```

#### Default state shape

In previous version the shape of Rocketjump state could change based on the
mutations configuration.
When the confguration included some mutations state the state shape passes
from the one inherit from reducer to:

```js
{
  root: /* state from reducer config */,
  mutations: /* state from mutations */,
  optimisticMutations /* state from optimistic mutation */
}
```

From v3 we always compose the state using `root` key.
Furthermore the state in ALWAYS context is supposed to have this shape.
This means that this don't work anymore:

```js
rj({
  selectors: () => ({
    total: (state) => (state.data ?? []).reduce((item) => item.price + acc, 0),
  }),
})
```

... But this stil works:

```js
rj({
  selectors: ({ getData }) => ({
    total: (state) =>
      (getData(state) ?? []).reduce((item) => item.price + acc, 0),
  }),
})
```

#### Computed

In previous version computed were ONLY **strings** and were merged in ambitious way.

In v2 you can write:

```js
rj(
  rj({
    computed: {
      baz: 'getData',
      fuzzy: 'isPending',
    },
  }),
  {
    computed: {
      foo: 'getData',
    },
  }
)
```

... And computed state was:

```ts
{
  foo: any,
  fuzzy: boolean
}
```

In v3 you can specify computed **ONLY** in `rj()` so you can't provide computed
to your plugins.

Sadly this breaks all the default computed in:

- `plugins/list`
- `plugins/plainList`
- `plugins/map`

_WHY?_

You will be thinking why a breaking changes so destructive was introduced?
Beacause in v3 the result state type is mostly infered by Typescript
compiler and infering this type of ambitious merging is quite impossible, so we
decided to drop it.

#### Mutations computed

In previous version we provide a special `'@mutation'` prefix in computed
to select mutation state.
Since v3 we support function as computed so we can simply access the state
related to mutation using a function:

In v2:

```js
rj({
  mutations: {
    addToCart: rj.mutation.single({
      /** **/
    }),
  },
  computed: {
    addingToCart: '@mutation.addToCart.pending',
  },
})
```

In v3:

```js
rj({
  mutations: {
    addToCart: rj.mutation.single({
      /** **/
    }),
  },
  computed: {
    addingToCart: (state) => state.mutations.addToCart.pending,
  },
})
```

#### Selectors and actions enhancers

We drop the support for:

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

We only support this syntax:

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

#### Compose reducer init

In previous version the `composeReducer` ins't a simple composition utility, but it
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

#### Rename `makeAction` to `makeEffectAction`

The `makeAction` name was too generic and confusing the only reason you have to
use this helper is works with side effect we renamed it to `makeEffectAction`.

#### Side effect

We improve the `rxjs` Side Effect model to make it super powerful.

In previous version all custom _effect action_ are always dispatched to reducer.
Es:.

```js
import { rj, makeEffectAction } from 'react-rocketjump'

rj({
  actions: () => ({
    bu: () => makeEffectAction('BU'),
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

Another different implementation detail from v2 is that the `configured` effect caller
value is no more hold on `makeObservable` result instance but is hold directly in a ref
on current dispatched action.
This is an implemntation detail, you shouldn't care if you don't play with rj internals.
This is unlock future implementation when you can use the same `makeObservable` value
with different run time effect callers.

### :warning: Deprecation

#### Configured effect caller

We deprectated the ~~`rj.configured()`~~ syntax in favor of simply `'configured'` string
when setting the `effectCaller` option.

### :zap: New features

#### New config option `combineReducers`

A new option `combineReducers` can be used in `rj()` and `rjPlugin()`.
It can be used to provide more reducers along with `root` and `mutations` reducers.
Is useful to store meta information without touching the root reducer shape:

```js
rj({
  combineReducers: {
    successCount: (count = 0, action) => {
      if (action.type === SUCCESS) {
        return count + 1
      }
      return count
    },
  },
  computed: {
    successCount: (s) => s.successCount,
  },
})
```

#### New config option `addSideEffect`

You can add a side effect in form of `Obsevable<Action>` using new
`addSideEffect` with the same signature of `takeEffect`.

For a real world usage see the [WebSocket Example](https://github.com/inmagik/react-rocketjump/blob/v3/example/pages/WebSocket/localstate.js)

#### New standard take effects: `concatLatest` and `groupByConcatLatest`

This standard take effect execute one task at time but if you `RUN`
a task while another task is excuted it buffer the **LAST** effect and then excute it.
This is useful in auto save scenarios when a task is spawned very often but you need
to send at server only one task at time to avoid write inconsistences but at the same
time you need ensure last data is sended.

The `groupByConcatLatest` is the version with grouping capabilites:
```js
['groupByConcatLatest', action => /* group action */]
```

#### New helper `actionMap`

This new helper make more simple to build a custom side effect with the
same behaviour of standard effects (run effect with caller dispatch `SUCCESS` or `FAILURE`).

```ts
function actionMap(
  action: EffectAction,
  effectCall: EffectFn,
  getEffectCaller: GetEffectCallerFn,
  prefix: string
) : Observable<Action>
```

To see how to use it see the [standar take effects implementation](https://github.com/inmagik/react-rocketjump/blob/v3/src/core/effect/takeEffectsHandlers.ts).

#### Builder mode

The main point of v3 is the ability to inferring the type of `RjObject` by your
configuration and plugins.

When using the standard rj constructor `rj(...plugins, config)` some stuff can't be
infered Es.. (the type of state in selectors) to avoid bad types in some situation
we give up and we fallback to `any`.

We expected that in future version of Typescript we can improve the types experience.

If your are interessed there is an open [issue](https://github.com/microsoft/TypeScript/issues/41396).

Here at InMagik Labs we follow this mantra:
> Mater artium necessitas

So to have the maxium from Typescript we introduce the Builder Mode!

When you invoke `rj()` or `rjPlugin()` you enter the builder mode.

Instead of providing big object of options you chain the same option as builder
and when your are done call `.effect({ ... })` on `rj()` to build an `RjObject` or
`.build()` on `rjPlugin()` to build a plugin.
Es:.

```js
const p1 = rjPlugin()
  .reducer(oldReducer => (state, action) => { /**  **/ })
  .actions(() => ({
    hello: () => ({ type: 'Hello' })
  }))
  .combineReducers({
    plus: () => 88,
  })
  .build()

const obj = rj()
  .plugins(p1)
  .selectors(() => ({
    getPlus: s => s.plus,
  }))
  .effect({
    effect: myEffect,
  })
```

#### Expose mutations types helpers `makeMutationType` `matchMutationType`

The `makeMutationType` create a mutation action type.

The `matchMutationType` match a mutation action type using a flexible syntax.

For more detail to how they works see the: [tests](https://github.com/inmagik/react-rocketjump/blob/v3/src/core/mutations/__tests__/mutationsActionTypes.test.ts)

#### Fix warning for plugin `plugins/list`

In previous version using the list plugin and calling `insertItem` or `deleteItem`
will trigger this warning:

> It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object

Since v3 we remove this warning in list plugin and we fix the pagination issue for you by simpy by
incrementing / decrementing the count.
You can disable this behaviour by passing this new options:

- `insertItemTouchPagination`: When `false` don't touch pagination on `insertItem`
- `deleteItemTouchPagination`: When `false` don't touch pagination on `deleteItem`

#### New plugin `plugins/mutationsPending`

This new plugin keep track of multiple mutations peding state.
Expose a selector called `anyMutationPending` to grab the related state.

If called without argument track **ALL** mutations:

```js
import rjMutationsPending from 'react-rocketjump/plugins/mutationsPending'

const maRjState = rj(rjMutationsPending(), {
  mutations: {
    /** **/
  },
  computed: {
    busy: 'anyMutationPending',
  },
})
```

Accept a configuration object with `track` key to specify which mutations
tracks:

```js
const maRjState = rj(
  rjMutationsPending({
    track: ['one', 'two'],
  }),
  {
    mutations: {
      one: {
        /** **/
      },
      two: {
        /** **/
      },
      three: {
        /** **/
      },
    },
    computed: {
      busy: 'anyMutationPending',
    },
  }
)
```

The `three` mutation is excluded by tracking.

## 2.6.2

##### _October 28th, 2020_

Fix an [issue](https://github.com/inmagik/react-rocketjump/issues/70)
with rj logger and react fast refresh.

## 2.6.1

##### _October 23th, 2020_

React 17, rewrite tests to support React 17 code is the same of `2.6.0`.

## 2.6.0

##### _Semptmber 16th, 2020_

Added `.curry(...args)` method to action builder.
Sometimes expecially in custom hooks you need to curry arguments, success,
failures callbacks or metas.

Es:.

```js
function useProduct(id) {
  const [data, actions] = useRunRj(ProductState, [id])
  const patchCurrentProduct = useMemo(
    () => actions.patchProduct.onSuccess(() => alert('Patched!')).curry(id),
    [actions, id]
  )
  // ... ID will be curried and also onSuccess handler
  patchCurrentProduct({ price: 33 })
}
```

##### NOTE

`.curry` is immutable an create a new builder instance every time is invoked
so is prefer to be used wrapped in a `React.useMemo`.

## 2.5.0

##### _Semptmber 10th, 2020_

Added `optimisticUpdater` and enable auto commit for optimistic mutations.

Sometimes you need to distinguish between an optmisitc update and an update
from `SUCCESS` if you provide the `optimisticUpdater` key in your mutation
config the `optimisticUpdater` is used to perform the optmistic update an
the `updater` to perform the update when commit success.

If your provided **ONLY** `optimisticUpdater` the success commit is skipped
and used current root state, this is useful for response as `204 No Content`
style where you can ignore the success and skip an-extra React update to your
state.

If you provide only `updater` this is used for **BOTH** optmistic and non-optimistic
updates as before.

## 2.4.0

##### _Semptmber 3th, 2020_

Added optmistic mutations.

To make a mutation optimistic add `optimisticResult` to your `mutation` config:

```js
rj({
  effect: fetchTodosApi,
  mutations: {
    updateTodo: {
      optimisticResult: (todo) => todo,
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        ),
      }),
      effect: updateTodoApi,
    },
    toggleTodo: {
      optimisticResult: (todo) => ({
        ...todo,
        done: !todo.done,
      }),
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        ),
      }),
      effect: (todo) =>
        updateTodoApi({
          ...todo,
          done: !todo.done,
        }),
    },
    incrementTodo: {
      optimisticResult: (todo) => todo.id,
      updater: (state, todoIdToIncrement) => ({
        ...state,
        data: state.data.map((todo) =>
          todo.id === todoIdToIncrement
            ? {
                ...todo,
                score: todo.score + 1,
              }
            : todo
        ),
      }),
      effect: (todo) => incrementTodoApi(todo.id).then(() => todo.id),
    },
  },
})
```

The `optimisticResult` function will be called with your _params_ (as your `effect`)
and the return value will be passed to the `updater` to update your state.

If your mutation **SUCCESS** _rocketjump_ will commit your state and re-running
your `updater` ussing the effect result as a normal mutation.

Otherwise if your mutation **FAILURE** _rocketjump_ roll back your state and
unapply the `optimisticResult`.

_rocketjump_ take care of orders of your effects results and the thirdy parts
actions dispatched in the meanwhile.

## 2.3.0

##### _April 7th, 2020_

Improved error logging, during effect.

Take this code:

```js
rj({
  name: 'MaTodos',
  effect: () => 23,
})
```

Before when this codes runs you see something like this in your console:

![mistic error](/assets/mistic_error.png)

> What the hell is this? Where come this error? Bad.

Now the same error:

![better error](/assets/better_error.png)

Even better when **rj logger** is enabled:

![event better error with logger](/assets/error_even_better_with_logger.png)

## 2.2.1

##### _April 6th, 2020_

No breaking changes, only security fixes

## 2.2.0

###### _March 18, 2020_

No breaking changes only new features.

#### `isObjectRj`

Expose a new helper to check if a plain object is a **React** `RjObject`

```js
isObjectRj(RjObject) => Boolean
```

#### Use `deps` :gem: in action creators

You can use `deps` in action creators:

```js
const [data, actions] = useRj(RjObject)
actions.run(deps.maybe(false)) // Don't run
actions.run(deps.maybeGet({ name: 'GioVa' }, 'name')) // Run with 'GioVa'
actions.run(deps.withMeta(23, { id: 23 })) // Run with 23 and meta { id: 23 }
```

## 2.1.1

###### _October 31, 2019_

Fixed a bug with `useRunRj` and array deps that cause spread array values in effect arguments.

## 2.1.0

###### _October 15, 2019_

This release improve the support for upcoming React async rendering feature.

All subscription are applied in a saftley way following:
https://github.com/facebook/react/tree/master/packages/use-subscription

Furthermore _rxjs_ / side effects logic has been
completely rewrited and improved.

There is only a mini **breaking change**:

If your provided a custom _takeEffect_ to `rj()` you have to update
your signature from:

```js
rj({
  // ...
  takeEffect: (action$, state$, mapActionToObserable, prefix) => {},
})
```

To:

```js
rj({
  // ...
  takeEffect: (
    action$,
    mergeObservable$,
    state$,
    extraSideEffectObs$,
    mapActionToObserable,
    prefix
  ) => {},
})
```

The other good news from this release are the _deps_ for _useRunRj_ and
in general a tools for better handling _run_ with _metadata_ using
React hooks.

#### `deps` :broken_heart: :gem:

One of the main goals of _rj_ is to (try) to promoting
the functional programming paradigm and most in general
a declarative code approach instead of an imperative code approach.

With this in mind we try to make `useRunRj` more powerful and declarative.

Ok, the code boy.

Try to imagine a situation when you need to _wait_
a value to run an effect,
typically when you have a sequence of _rjs_ or a situation where your value
can be valid or _maybe_ can not.

Take this snippet:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj
  const [{ data: user }] = useRunRj(UserState, [id])
  // Fetch the use company info \w CompanyState
  // NOTE this code is broken becose user in null until the
  // UserState's effect resolves
  const [{ data: company }] = useRunRj(CompanyState, [user.companyId])
}
```

You need to _wait_ until `UserState`'s effect resolves before _run_ `CompanyState`'s effect.

Sure you can simply switch from `useRunRj` to `useRj`
and implement it yourself:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj
  const [{ data: user }] = useRunRj(UserState, [id])
  // Fetch the use company info \w CompanyState
  // This is OK
  const [{ data: company }, { run, clean }] = useRj(CompanyState)
  useEffect(
    () => {
      if (user) {
        run(user.companyId)
        return clean()
      }
    },
    // NOTE run and clean can be ommited because don't changes
    // between renders but you can saftley add it to deps
    // to make your linter happy
    [user]
  )
}
```

Ok, but this code is not too declarative and you need to grab
_run_ and _clean_ namespace them if needed and furthermore if the values
increase you need to implement more complicated conditions.

Imagine if you can simply tell to `useRunRj`:

"please don't run the effect until `user` has a value,
when `user` is ok then _run_ the effect, thanks."

Now with `deps` you can:

```js
// Import the Magik deps from rj
import { deps } from 'react-rocketjump'
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj
  const [{ data: user }] = useRunRj(UserState, [id])
  // Fetch the use company info \w CompanyState
  const [{ data: company }] = useRunRj(
    CompanyState,
    // When user is not falsy run CompanyState
    // with user.companyId as param
    [deps.maybeGet(user, 'companyId')]
  )
}
```

There are a set functions to help you _run_ effects _maybe_.

Simply `maybe`:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj only when id is not falsy
  const [{ data: user }] = useRunRj(UserState, [deps.maybe(id)])
}
```

Strict _null_ with `maybeNull`:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj only when id is not null
  const [{ data: user }] = useRunRj(UserState, [deps.maybeNull(id)])
}
```

Apply maybe check to all deps with `allMaybe`:

```js
function UserProfile({ id, role }) {
  // If id OR role are falsy don't run effect
  const [{ data: user }] = useRunRj(UserState, deps.allMaybe(id, role))
}
```

Apply maybe strict _null_ check to all deps with `allMaybeNull`:

```js
function UserProfile({ id, role }) {
  // If id OR role are null don't run effect
  const [{ data: user }] = useRunRj(UserState, deps.allMaybeNull(id, role))
}
```

With `deps` you can also declarative set _meta_.

Set _meta_ on values changes:

```js
function Products({ idStock }) {
  const [search, setSearch] = useState('')
  const [{ data: user }] = useRunRj(ProductsState, [
    idStock,
    // run with meta debounced true only when search changes
    // (the first run all values changes)
    deps.withMeta(search, { debounced: true }),
  ])
}
```

Set a set of _meta_ on mount only:

```js
function Products({ idStock }) {
  const [search, setSearch] = useState('')
  const [{ data: user }] = useRunRj(ProductsState, [
    idStock,
    // run with meta debounced true only when search changes
    // (the first run all values changes)
    deps.withMeta(search, { debounced: true }),
    // on mount debounced is false
    deps.withMetaOnMount({ debounced: false }),
  ])
}
```

Set a set of _meta_ on always:

```js
function Products({ idStock, trackId }) {
  const [search, setSearch] = useState('')
  const [{ data: user }] = useRunRj(ProductsState, [
    idStock,
    // run with meta debounced true only when search changes
    // (the first run all values changes)
    deps.withMeta(search, { debounced: true }),
    // on mount debounced is false
    deps.withMetaOnMount({ debounced: false }),
    // trackId always applied
    deps.withAlwaysMeta({ trackId }),
  ])
}
```

You can combine `deps`:

```js
function Products({ idStock, trackId }) {
  const [{ data: user }] = useRunRj(ProductsState,
    // if idStock is falsy don't run effect
    // else run effect with idStock meta
    [deps.withMeta(deps.maybe(idStock), { trackId })],
    // OR
    [deps.maybe(idStock).withMeta({ trackId })]
    // OR
    [deps.maybe(deps.withMeta(idStock, { trackId }))]
    // OR
    deps.allMaybe(deps.withMeta(idStock, { trackId }))
  )
}
```

To help you deal with complex condition or edge cases `useRunRj` add
a special _action_ to hack the next meta:

```js
function Products() {
  const [search, setSearch] = useState('')
  const [{ data: user }, { withNextMeta }] = useRunRj(ProductsState, [
    // run with meta debounced true only when search changes
    // (the first run all values changes)
    deps.withMeta(search, { debounced: true }),
    // on mount debounced is false
    deps.withMetaOnMount({ debounced: false }),
  ])

  // When user type in and setSearch in triggered
  // aplly run debounced ... when he user click clearSearch
  // button apply a non debounced run
  function clearSearch() {
    withNextMeta({ debounced: false })
    setSearch('')
  }
}
```

## 2.0.0

###### _September 19, 2019_

This release does not contain breaking changes, but it introduces a lot of new features, awesome stuff, some performance improvements and it improves the rj stability.

#### `mutations` :broken_heart: :fire: :metal:

The main great feature of rj v2 is the support for mutations.

##### Basic mutations

Mutations add an additional configuration option to the rj object called `mutations` (only allowed in the last config object, as it follows the same rules of the `effect` configuration option), where you can configure your mutation behaviours.

What is a mutation?

A mutation is simply an effect that, when run with a successful outcome, updates the root rj state with its result.

Ok, for example take a normal rj to fetch some todos from an api.

```js
const MaTodosState = rj({
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

Now if you want to toggle your todo with using some api like _PATCH_ `/todos/${id}`, you can write a mutation:

```js
const MaTodosState = rj({
  mutations: {
    toggleTodo: {
      // The effect to perform, it accepts the same values of rj effect () => Promise|Observable
      effect: (todo) =>
        fetch(`/todos/${todo.id}`, {
          method: 'PATCH',
          body: { done: !todo.done },
        }).then((r) => r.json()),
      // A PURE function to update the main rj state called when the effect resolves|complete.
      // (prevState, effectResult) => nextState
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map((todo) =>
          todo.id === updatedTodo ? updatedTodo : todo
        ),
      }),
    },
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

Yeah you have written your first mutation!

Ok, but how can I use mutations?

For every configured mutation rj crafts an action creator, using the keys in the `mutations` object as names, to the action creators bag.

These action creators trigger the `effect` defined in the corresponding mutation and when the effect succedes they use the corresponding `updater` to update the (parent) state.

Mutations action creators are effect actions and can be invoked with the Builder as well.

Mutations action creators are supported for all the React bindings `useRj`, `useRunRj` and `connectRj`.

If the mutation name overwrites a preexisting action creator rj prints a warn in DEV.

So for example this is a dummy react component that can be used to toggle some todos using our RjObject:

```js
import React from 'react'
import { useRunRj } from 'react-rocketjump'
import { MaTodosState } from './localstate'

function MaTodos() {
  const [{ data: todos }, { toggleTodo }] = useRunRj(MaTodosState)

  return (
    <ul>
      {todos &&
        todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => {
              toggleTodo(todo)
              // or
              toggleTodo
                .onSuccess(() => {})
                .onFailure(() => {})
                .withMeta({})
                .run(todo)
            }}
          >
            {todo.title} {todo.done ? '√' : ''}
          </li>
        ))}
    </ul>
  )
}
```

##### The mutations updater

The updater can also be a function (with the standard reducer signature `(state, action) => state`), or a string that must be the name of an action creator, which will be used to update the state. All the rj actions, even those added by plugins, are valid for this sake.

```js
const MaTodosState = rj(rjPlainList(), {
  mutations: {
    toggleTodo: {
      effect: (todo) =>
        fetch(`/todos/${todo.id}`, {
          method: 'PATCH',
          body: { done: !todo.done },
        }).then((r) => r.json()),
      // Update the state using the login from insertItem(effectResult)
      updater: 'insertItem',
    },
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

##### `updateData(newData)`

To help you write less code we introduced a new standard action creator `updateData` that simply updates data of your rj state (this update is done by overwriting the `data` prop of the state with the payload of the action).

This isn't an effect action (and hence it cannot be used with the Builder).

With `updateData` mutation's code usually becomes more compact, expecially when you deal with REST APIs:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile: {
      effect: (newProfile) =>
        fetch(`/user`, {
          method: 'PATCH',
          body: newProfile,
        }).then((r) => r.json()),
      // Update the state using the login from insertItem(effectResult)
      updater: 'updateData',
    },
  },
  effect: () => fetch(`/user`).then((r) => r.json()),
})
```

##### Mutations side effect model: `takeEffect`

You can change the default side effect model with the same logic as the main rj effect:

https://inmagik.github.io/react-rocketjump/docs/api_rj#takeeffect

The default side effect model applied is `every`, but you can change it as you wish, for example you can write something like:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile: {
      effect: (newProfile) =>
        fetch(`/user`, {
          method: 'PATCH',
          body: newProfile,
        }).then((r) => r.json()),
      updater: 'updateData',
      // ignore all the updateUserProfile() while effect is in peding
      takeEffect: 'exhaust',
    },
  },
  effect: () => fetch(`/user`).then((r) => r.json()),
})
```

##### Mutations `effectCaller`

You can specify an `effectCaller` for your mutation, and you can use `rj.configured()` as well.

If your main config has an `effectCaller` configured any mutation uses it unnless an `effectCaller` is specified in the mutation config. This last effect caller can be any valid `effectCaller` or `false` (this tells rj not to use any effect caller)

```js
const MaTodosState = rj({
  mutations: {
    // mutation1 use rj.configured() as effect caller
    mutation1: {
      effect,
      updater,
    },
    // mutation2 use myAwesomeCaller as effect caller
    mutation2: {
      effect,
      updater,
      effectCaller: myAwesomeCaller,
    },
    // mutation3 don't use any effect caller
    mutation3: {
      effect,
      updater,
      effectCaller: false,
    },
  },
  effectCaller: rj.configured(),
  effect: () => fetch(`/user`).then((r) => r.json()),
})
```

##### Customize mutations state shape using a `reducer`

Mutations don't have a state by default but sometimes it is useful to track the mutation state, for example to show an indicator while saving or displaying the error message (when some error occures).

When you specify a `reducer` in the mutation config you enable the mutation state, your reducer is supposed to handle the standard rj actions:

```js
import { INIT, RUN, PENDING, SUCCESS, FAILURE } from 'react-rocketjump'
```

The actions dispatched to your reducer are only related to your mutation.

Take this snippet:

```js
const MaTodosState = rj({
  mutations: {
    mutation1: {
      effect,
      updater,
      reducer: reducer1,
    },
    mutation2: {
      effect,
      updater,
      reducer: reducer2,
    },
  },
  effect,
})
```

The `reducer1` responds only to the actions generated from `mutation1()`, and the same holds for `reducer2` with respect to `mutation2()`.

Rocketjump automatically namespaces the actions for you to avoid name clashes, so you have only to responde to the standard rj actions and rj will do the rest.

Mutations actions have the standard rj shape, with the bonus that params are by default added to your action metadata:

```js
{
  type: INIT
}

{
  type: RUN,
  payload: {
    params, // the params with which your side effect was invoked
  }
  meta: {
    params,
  },
}

{
  type: PENDING,
  meta: {
    params,
  },
}

{
  type: SUCCESS,
  meta: {
    params,
  },
  payload: {
    data, // the result of your mutation side effect
    params,
  }
}

{
  type: FAILURE,
  meta: {
    params,
  },
  payload // the rejection of your side effect
}
```

##### Select the mutations state

When you enable mutations for a rj object your state is sliced in two parts: the mutation's and the root's state.

To select the root state, the usual rj state of v1.x, you have a special selector `getRoot`:

```js
const [state, actions] = useRunRj(
  MaRjObject,
  (state, { getRoot, getData }) => ({
    maDataKey: getData(getRoot(state)),
  })
)
```

To select a specific mutation state you have another special selector `getMutation`:

```js
const [state, actions] = useRunRj(MaRjObject, (state, { getMutation }) => ({
  pending: getMutation(
    state,
    'mutationKey.path.to.your.state.deep.as.you.want'
  ),
}))
```

##### `computed` for mutations

When you enable mutations state the `computed` configuration options for v1.x computed properties will still work as expected.

This works as well:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile:{
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
      reducer: ({ pending: false }, action) => /* reducer logic */,
      // ignore all the updateUserProfile() while effect is in peding
      takeEffect: 'exhaust',
    }
  },
  effect: () => fetch(`/user`).then(r => r.json()),
  computed: {
    todos: 'getData', // <-- Select data from your root state
  },
})
```

To involve a mutation state in some computed property you can use the special key `@mutation` followed by the path of your mutation (in the traditional lodash format):

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile:{
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
      reducer: ({ pending: false }, action) => /* reducer logic */,
      takeEffect: 'exhaust',
    }
  },
  effect: () => fetch(`/user`).then(r => r.json()),
  computed: {
    todos: 'getData', // <-- Select data from your root state,
    updatingProfile: '@mutation.updateUserProfile.pending',
  },
})
```

##### The standard mutation `rj.mutation.single`

Rj provides you some standard mutation wrappers, each of which simply injects some defaults.

The rj single mutation is mutation wrapper designed for a mutation that should have no overlapping runs, for example a form submission.

The default `takeEffect` is `exhaust`, and `reducer` is configured to handle a single loading/failure state with this shape:

```js
{
  pending: Boolean,   // <-- Is my mutation effect in pending?
  error: null|Error,  // <-- Last error from effect cleaned on every run.
}
```

To use the single mutation wrapper:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile: rj.mutation.single({
      // takeEffect and reducer are injecte for you
      effect: (newProfile) =>
        fetch(`/user`, {
          method: 'PATCH',
          body: newProfile,
        }).then((r) => r.json()),
      updater: 'updateData',
    }),
  },
  effect: () => fetch(`/user`).then((r) => r.json()),
  computed: {
    todos: 'getData',
    updatingProfile: '@mutation.updateUserProfile.pending',
    updateProfileError: '@mutation.updateUserProfile.error',
  },
})
```

##### The standard mutation `rj.mutation.multi`

The rj multi mutation is designed for a mutation that may run multiple times in parallel, based on a "key based" logic:
each run is identified by a key and if another effect with the same key is running the new run will be discarded.

The first argument of `rj.mutation.multi` is a function that return this key from your params:

```js
;(...params) => key
```

This is accomplished by using `groupByExhaust` as the default `takeEffect` for `rj.mutation.multi` that groups your effect using the key derived from arguments, effects with the same keys are executed one at time, if an effect with a given key is in place the subsequent run that triggers the same key is ignored.

The default `reducer` handle multiple failures and loading states at time with the following shape:

```js
{
  pendings: {
    [key]: true|undefined,
  },
  errors: {
    [key]: Error|undefined
  }
}
```

To use the multi mutation wrapper:

```js
const MaTodosState = rj(rjPlainList(), {
  mutations: {
    toggleTodo: rj.mutation.multi(
      (todo) => todo.id, // Make a string key from params
      {
        effect: (todo) =>
          fetch(`/todos/${todo.id}`, {
            method: 'PATCH',
            body: { done: !todo.done },
          }).then((r) => r.json()),
        updater: 'updateItem',
      }
    ),
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
  computed: {
    todos: 'getData',
    savingTodos: '@mutations.toggleTodo.pendings',
  },
})
```

#### `logger` :smiling_imp:

Yess, a [redux-logger](https://github.com/LogRocket/redux-logger) inspired logger for rj.

Why a logger? Because as rj powered applications grow up in size, it becomes very difficult to track and debug all the effects and the rjs state updates.

This, and some of us was missing a tools like redux logger or redux dev tools.

Yess, yess, yess the React dev tools, especially the new version, is AWESOME but this logger helps you understanding if your rj configuration and effects flows work as you want.

This is what it looks like:

![Rj Logger Sample Screen](/assets/logger_rj_in_console.png)

To enable it, just add this snippet to your `index.js`:

```js
import rjLogger from 'react-rocketjump/logger'

// The logger don't log in PRODUCTION
// (place this before ReactDOM.render)
rjLogger()
```

To add a name to your RocketJump Object in the logger output simply add a `name` key in your rj config:

```js
const TomatoesState = rj({
  effect,
  // ... rj config ...
  name: 'Tomatoes',
})
```

## 1.2.0

###### _September 4, 2019_

### :bangbang: Breaking changes

Changed how `<ConfigureRj />` works.

Up to previous versions `effectCaller` in `<ConfigureRj />` was replacing the rj `effectCaller` unless you explicitly defined them in rj configuration.

This behavior did not provide enough flexibility, so we introduced the ability of rj configuration to be lazy, up to now we apply it only to `effectCaller` config option.

Now when you define the `effectcaller` in `<ConfigureRj />` you enable a lazy configuration value.
Later when you define your rjs you can refer to them in your configuration, using the speical syntax `rj.configured()`.

When rj engine encounters the special `rj.configured()` slot, the configuration option will become lazy and the recursion will complete when rj mounts and has then access to `<ConfigureRj />` context.

Thanks to this you can place your configured `effectCaller` where do you want in the recursion chain:

```js
<ConfigureRj effectCaller={myCustomEffectCaller}>
  /* This is the scope where the lazy effect caller is enabled */
</ConfigureRj>
```

```js
rj(
  {
    effectCaller: myEffectCallerA,
    // ... rj config ...
  }
  {
    effectCaller: rj.configured(),
    // ... rj config ...
  },
  {
    effectCaller: myEffectCallerB,
    // ... rj config ...
  }
)
```

## 1.1.0

###### _July 16, 2019_

### :bangbang: Breaking changes

Removed `mapActions` from `useRj` (was the last argument).

To rename actions simply use object deconstructing, from:

```js
const [state, { fetchStuff } = useRj(
  MaRjState,
  undefined,
  actions => ({ fetchStuff: actions.run })
)
```

To:

```js
const [state, { run: fetchStuff } = useRj(MaRjState)
```

For a deep discussion of why this option was removed see: https://github.com/inmagik/react-rocketjump/issues/12

### :zap: New features

#### `useRunRj`

Use a rocketjump object and run it using `useEffect` according to `deps`, all `deps` are passed to `run` function.

This is a simple syntactic sugar over `useRj`, you can implement it by yourself:
https://inmagik.github.io/react-rocketjump/docs/tips_and_tricks

If you have a `rocketjump` with easy-trigger-deps you can use `useRunRj` to write less code.

These pieces of codes do the same.

Without `useRunRj()`:

```js
const [{ data: product }, { run: fetchProduct, clean: cleanProduct }] = useRj(
  MaRjState
)
useEffect(() => {
  fetchProduct(productId)
  return () => {
    cleanProduct()
  }
}, [fetchProduct, cleanProduct, productId])
```

With `useRunRj`:

```js
const [{ data: product }] = useRunRj(
  MaRjState,
  [productId], // <- Deps
  true // <- Should clean on new effect? default to true
)
```

You can find documentation about `useRunRj` here: https://inmagik.github.io/react-rocketjump/docs/connect_userunrj

#### `computed` :heart:

Now `rj` has a new config option: `computed`.

`computed` is expected to be an object that maps from a computed property name to a selector name.

When a `rj` in the recursion chain "enables" `computed`, the state returned from `useRj` or `connectRj`
is computed according to this configuration, otherwise the default structure is returned. `computed` declarations are merged using the normal `rj` recursion order.

The `computed` mapping is unique, so you can't bind a selector multiple times. If you do this, the last bindings wins.

Example:

```js
const MaRjState = rj(
  rj(
    {
      computed: {
        secret: 'getSecret',
        ohShit: 'getError',
      },
      selectors: () => ({
        getSecret: () => 23,
      }),
    },
    {
      effect: myEffect,
      computed: {
        todos: 'getData',
        error: 'getError',
      },
    }
  )
)

const [state, actions] = useRj(MaRjState)
```

The value of state is:

```js
{
  error: null, // state.error
  secret: 23,
  todos: null, // state.data
}
```

#### `plugins/list`

Now the plugin list use `computed` to avoid mapping the same state over and over again.

A new selector `getPagination` is exposed, returning an Object with all the pagination info.

The computed config privided by the plugin is:
(you can completely change this config writing your own `computed` config):

```js
{
  error: 'getError',
  loading: 'isLoading',
  list: 'getList',
  pagination: 'getPagination',
}
```
