## 2.0.0
###### *?*

This release does not contain breaking changes, but it introduces a lot of new features, awesome stuff, some performance improvements and it improves the rj stability.

#### `mutations` :broken_heart: :fire: :metal:
The main great feature of rj v2 is the support for mutations.

##### Basic mutations

Mutations add an additional option to the rj config object called `mutations` (only allowed in the last config object, as it follows the same rules of the `effect` configuration option), where you can configure your mutation behaviours.

What is a mutation?

A mutation is simply an effect that, when run with a successful outcome, updates the root rj state with its result.

Ok, for example take a normal rj to fetch some todos from an api.

```js
const MaTodosState = rj({
  effect: () => fetch(`/todos`).then(r => r.json()),
})
```
Now if you want to toggle your todo with using api like *PATCH* `/todos/${id}`, you can write a mutation:
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

For every configured mutation rj adds an action creator, using the keys as names, to the action creators bag.

These action creators trigger the `effect` defined in the corresponding mutation and when the effect succedes they use the corresponding `updater` to update the (parent) state.

Mutations action creators are effect actions and have the Builder as well.

Mutations action creators are supported for all the React bindings `useRj`, `useRunRj` and `connectRj`.

If the mutation name overwrites a preexisting action creator rj prints a warn in DEV.

So for example this a dummy react component to toggle some todos using our RjObject:

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

The updater can also be a string with the name of action creator used to update the state, all the rj actions generated during recursion are valid action names even if come from plugins.

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

For help you write less code we introduced a new standard action creator `updateData` that simply update data of your rj state.

This isn't an effect action so it hasn't the builder.

With `updateData` you write less code in your mutations:

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

##### Mutations side effect model `takeEffect`

You can change the default side effect model with the same logic of main rj effect:

https://inmagik.github.io/react-rocketjump/docs/api_rj#takeeffect

The default side effect model applied is `every` you can change it for example:

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

You can speciefied an `effectCaller` to your mutation, you can use `rj.configured()` as well.

If your main config has an `effectCaller` configured the mutation use it unnless an `effectCaller` is specified in the mutation config or explicit set to `false`.

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

Default mutations don't have a state but sometimes is useful to track the mutation state, for example to show an indicator while saving or dispaly the error message when occurred.

When you specified a `reducer` in the mutation config you enable the mutation state, your reducer is supposed to handle the standard rj actions:

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

The `reducer1` respond only to the action generated from `mutation1()` in the same way `reducer2` respond only to `mutation2()` actions. 

Rocketjump auto namespace the action for your so you have only to responde to the standard rj actions.

Mutations actions are the standard rj shape, in plus params are default added to your action metadata:

```js
{
  type: INIT
}

{
  type: PENDING,
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

When you enable mutations in your conf state your state is sliced in two parts the mutations and the root state.

For select the root state, the normal rj state, you have a special selector `getRoot`,

```js
const [state, actions] = useRunRj(MaRjObject, (state, { getRoot, getData }) => ({
  maDataKey: getData(getRoot(state)),
}))
```

For select a specific mutation state you have another special selector `getMutation`:

```js
const [state, actions] = useRunRj(MaRjObject, (state, { getMutation }) => ({
  pending: getMutation(state, 'mutationKey.path.to.your.state.deep.as.you.want'),
}))
```

##### `computed` for mutations

When you enable mutations state `computed` for old computed still working as exptected.

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

To compute the mutation state your have a special key `@mutation` followed by the path of your mutation:

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

Rj provide to you some standard mutations, that simply injects some defaults.

The rj single mutation is mutation designed for a mutation that run one at time, for example a form submission.

The default `takeEffect` is `exhaust`, and `reducer` handle a single loading/failure state with this shape:
```js
{
  pending: Boolean,   // <-- Is my mutation effect in pending?
  error: null|Error,  // <-- Last error from effect cleaned on every run.
}
```
To use the single mutation:

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

...

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

You can find documentation about `useRunRj` here: https://inmagik.github.io/react-rocketjump/docs/api_connect#userunrj

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



