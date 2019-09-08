## 1.2.0
###### *September 4, 2019*

### :bangbang: Breaking changes

Changed how `<ConfigureRj />` works.

Before `effectCaller` in `<ConfigureRj />` will replace the rj `effectCaller` unless you explicit define them in rj configuration.

This behavior was not enough flexible, so we introduced the ability of rj configuration to be lazy, for now we apply them only to `effectCaller` config option.

Now when you define the `effectcaller` in `<ConfigureRj />` you enable a lazy configuration value.
Later when you define your rjs you can refer to them in your configuration, using the speical syntax `rj.configured()`.

When rj encounter the special `rj.configured()` the configuration option will become lazy and the recursion will execute when rj mounts and have access to `<ConfigureRj />` context.

Thanks to this you can place your configured `effectCaller` where do you want in recursion chain:

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



