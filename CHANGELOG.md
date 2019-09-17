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
  }
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
        <li key={todo.id} onClick={() => toggleTodo(todo)}>
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
  }
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
  }
  effect: () => fetch(`/user`).then(r => r.json()),
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



