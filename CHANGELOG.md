## 2.6.2
##### *October 28th, 2020*

Fix an [issue](https://github.com/inmagik/react-rocketjump/issues/70)
with rj logger and react fast refresh.

## 2.6.1
##### *October 23th, 2020*

React 17, rewrite tests to support React 17 code is the same of `2.6.0`.

## 2.6.0
##### *Semptmber 16th, 2020*

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
##### *Semptmber 10th, 2020*

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
##### *Semptmber 3th, 2020*

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

The `optimisticResult` function will be called with your *params* (as your `effect`)
and the return value will be passed to the `updater` to update your state.

If your mutation **SUCCESS** *rocketjump* will commit your state and re-running
your `updater` ussing the effect result as a normal mutation.

Otherwise if your mutation **FAILURE** *rocketjump* roll back your state and
unapply the `optimisticResult`.

*rocketjump* take care of orders of your effects results and the thirdy parts
actions dispatched in the meanwhile.

## 2.3.0
##### *April 7th, 2020*

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
##### *April 6th, 2020*

No breaking changes, only security fixes

## 2.2.0
###### *March 18, 2020*

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
###### *October 31, 2019*

Fixed a bug with `useRunRj` and array deps that cause spread array values in effect arguments.

## 2.1.0
###### *October 15, 2019*

This release improve the support for upcoming React async rendering feature.

All subscription are applied in a saftley way following:
https://github.com/facebook/react/tree/master/packages/use-subscription

Furthermore *rxjs* / side effects logic has been
completely rewrited and improved.

There is only a mini **breaking change**:

If your provided a custom *takeEffect* to `rj()` you have to update
your signature from:

```js
rj({
  // ...
  takeEffect: (action$, state$, mapActionToObserable, prefix) => {}
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
  ) => {}
})
```

The other good news from this release are the *deps* for *useRunRj* and
in general a tools for better handling *run* with *metadata* using
React hooks.

#### `deps` :broken_heart: :gem:

One of the main goals of *rj* is to (try) to promoting
the functional programming paradigm and most in general
a declarative code approach instead of an imperative code approach.

With this in mind we try to make `useRunRj` more powerful and declarative.

Ok, the code boy.

Try to imagine a situation when you need to *wait*
a value to run an effect,
typically when you have a sequence of *rjs* or a situation where your value
can be valid or *maybe* can not.

Take this snippet:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj
  const [{ data: user}] = useRunRj(UserState, [id])
  // Fetch the use company info \w CompanyState
  // NOTE this code is broken becose user in null until the
  // UserState's effect resolves
  const [{ data: company }] = useRunRj(CompanyState, [user.companyId])
}
```

You need to *wait* until `UserState`'s effect resolves before *run* `CompanyState`'s effect.

Sure you can simply switch from `useRunRj` to `useRj`
and implement it yourself:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj
  const [{ data: user }] = useRunRj(UserState, [id])
  // Fetch the use company info \w CompanyState
  // This is OK
  const [{ data: company }, { run, clean }] = useRj(CompanyState)
  useEffect(() => {
    if (user) {
      run(user.companyId)
      return clean()
    }
  },
  // NOTE run and clean can be ommited because don't changes
  // between renders but you can saftley add it to deps
  // to make your linter happy
  [user])
}
```

Ok, but this code is not too declarative and you need to grab
*run* and *clean* namespace them if needed and furthermore if the values
increase you need to implement more complicated conditions.

Imagine if you can simply tell to `useRunRj`:

"please don't run the effect until `user` has a value,
when `user` is ok then *run* the effect, thanks."


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

There are a set functions to help you *run* effects *maybe*.

Simply `maybe`:

```js
function UserProfile({ id }) {
  // Fetch the user info \w UserState rj only when id is not falsy
  const [{ data: user }] = useRunRj(UserState, [deps.maybe(id)])
}
```

Strict *null* with `maybeNull`:

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
  const [{ data: user }] = useRunRj(UserState, deps.allMaybe(
    id,
    role,
  ))
}
```

Apply maybe strict *null* check to all deps with `allMaybeNull`:

```js
function UserProfile({ id, role }) {
  // If id OR role are null don't run effect
  const [{ data: user }] = useRunRj(UserState, deps.allMaybeNull(
    id,
    role,
  ))
}
```

With `deps` you can also declarative set *meta*.

Set *meta* on values changes:

```js
function Products({ idStock }) {
  const [search, setSearch] = useState('')
  const [{ data: user }] = useRunRj(ProductsState, [
    idStock,
    // run with meta debounced true only when search changes
    // (the first run all values changes)
    deps.withMeta(search, { debounced: true })
  ])
}
```

Set a set of *meta* on mount only:

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

Set a set of *meta* on always:

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
    deps.withAlwaysMeta({ trackId })
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
a special *action* to hack the next meta:

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
###### *September 19, 2019*

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
  effect: () => fetch(`/todos`).then(r => r.json()),
})
```
Now if you want to toggle your todo with using some api like *PATCH* `/todos/${id}`, you can write a mutation:
```js
const MaTodosState = rj({
  mutations: {
    toggleTodo:{
      // The effect to perform, it accepts the same values of rj effect () => Promise|Observable
      effect: todo => fetch(`/todos/${todo.id}`, {
         method: 'PATCH',
         body: { done: !todo.done }
      }).then(r => r.json()),
      // A PURE function to update the main rj state called when the effect resolves|complete.
      // (prevState, effectResult) => nextState
      updater: (state, updatedTodo) => ({
        ...state,
        data: state.data.map(todo => todo.id === updatedTodo ? updatedTodo : todo),
      })
    }
  },
  effect: () => fetch(`/todos`).then(r => r.json()),
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
      {todos && todos.map(todo => (
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
          {todo.title}{' '}{todo.done ? '√' : ''}
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
    toggleTodo:{
      effect: todo => fetch(`/todos/${todo.id}`, {
         method: 'PATCH',
         body: { done: !todo.done }
      }).then(r => r.json()),
      // Update the state using the login from insertItem(effectResult)
      updater: 'insertItem'
    }
  },
  effect: () => fetch(`/todos`).then(r => r.json()),
})
```

##### `updateData(newData)`

To help you write less code we introduced a new standard action creator `updateData` that simply updates data of your rj state (this update is done by overwriting the `data` prop of the state with the payload of the action).

This isn't an effect action (and hence it cannot be used with the Builder).

With `updateData` mutation's code usually becomes more compact, expecially when you deal with REST APIs:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile:{
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      // Update the state using the login from insertItem(effectResult)
      updater: 'updateData'
    }
  },
  effect: () => fetch(`/user`).then(r => r.json()),
})
```

##### Mutations side effect model: `takeEffect`

You can change the default side effect model with the same logic as the main rj effect:

https://inmagik.github.io/react-rocketjump/docs/api_rj#takeeffect

The default side effect model applied is `every`, but you can change it as you wish, for example you can write something like:

```js
const MaTodosState = rj({
  mutations: {
    updateUserProfile:{
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
      // ignore all the updateUserProfile() while effect is in peding
      takeEffect: 'exhaust',
    }
  },
  effect: () => fetch(`/user`).then(r => r.json()),
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
    }
  },
  effectCaller: rj.configured(),
  effect: () => fetch(`/user`).then(r => r.json()),
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
const [state, actions] = useRunRj(MaRjObject, (state, { getRoot, getData }) => ({
  maDataKey: getData(getRoot(state)),
}))
```

To select a specific mutation state you have another special selector `getMutation`:

```js
const [state, actions] = useRunRj(MaRjObject, (state, { getMutation }) => ({
  pending: getMutation(state, 'mutationKey.path.to.your.state.deep.as.you.want'),
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
      effect: newProfile => fetch(`/user`, {
         method: 'PATCH',
         body: newProfile,
      }).then(r => r.json()),
      updater: 'updateData',
    })
  },
  effect: () => fetch(`/user`).then(r => r.json()),
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
(...params) => key
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
      (todo => todo.id), // Make a string key from params
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
  computed: {
    todos: 'getData',
    savingTodos: '@mutations.toggleTodo.pendings',
  }
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
  name: 'Tomatoes'
})
```

## 1.2.0
###### *September 4, 2019*

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
###### *July 16, 2019*

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
const [{ data: product }, { run: fetchProduct, clean: cleanProduct }] = useRj(MaRjState)
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
  true, // <- Should clean on new effect? default to true
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
  rj({
    computed: {
      secret: 'getSecret',
      ohShit: 'getError',
    },
    selectors: () => ({
      getSecret: () => 23,
    })
  }, {
    effect: myEffect,
    computed: {
      todos: 'getData',
      error: 'getError',
    }
  })
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
