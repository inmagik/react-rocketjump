---
id: consume_rj_objects
title: Consume RjObjects
sidebar_label: Consume RjObjects
slug: /consume-rj-objects
---

## Action creators Builder

When you consume an RjObject its action creators are bound
to current state and side effects instance.
Plus a special builder were attached.
You can still inoke them as simply functions.

The methods exposed on bound action creators by the builder are:

```js
Builder builder = actionCreator.withMeta(object)
Builder builder = actionCreator.withMeta(oldMeta => newMeta)
Builder builder = actionCreator.onSuccess(callback)
Builder builder = actionCreator.onError(callback)
Builder builder = actionCreator.asPromise(...args)
```

Each of these methods instantiates a new Builder to be used for the _rich_ call, and calls the omonimous method on the created builder (so avoiding an explicit call to instantiate the builder).

The methods exposed by the builder object are:

```js
builder.withMeta(object)
builder.withMeta((oldMeta) => newMeta)
builder.onSuccess(callback)
builder.onError(callback)
builder.run(...args)
builder.asPromise(...args)
```

First of all, builder methods are designed to be chainable, hence probably you'll never create a `builder` variable in your code, but you'd end up writing something like

```js
run
  .withMeta({ id: 42 })
  .onSuccess((data) => console.log(data))
  .onError((err) => console.warn(err))
  .run()
```

Now, let's go describing the methods of the builder.

### withMeta(function)

`builder.withMeta(oldMeta => newMeta)`

The `withMeta` builder method allows to add a transform on metadata attached to the action. The transform is encoded as a function that receives the old metadata object (a JavaScript plain object) and is required to return the next metadata object (again, as a plain JavaScript object). This method can be used to add some metadata, to change some of them, or even to delete some keys (even if you should do it with care). Calling `withMeta` multiple times simply chains all the transformation, such that the output of the first is the input of the second and so on, the metadata object attached to the action will be the output of the last transform.

**Example**

This call exposes the `key` meta data under the `id` property

```js
builder.withMeta(prevMeta => { ...prevMeta, id: prevMeta.key })
```

### withMeta(object)

`builder.withMeta(object)`

This is equivalent to `builder.withMeta(prevMeta => { ...prevMeta, ...object })`, it can be useful as a quick and lightweight way to add some keys to the metadata object

### onSuccess

`builder.onSuccess(callback)`

This method allows to attach a callback to be invoked when the asynchronous task completes without errors. The callback is not invoked in case the task it is attached to is canceled (see [takeEffect](side_effects.md)). Calling this method multiple times on the same builder causes the callback to be overwritten: the callback attached to the action is the argument of the last invocation of this method

**Example**

Triggering an alert when an action completes

```js
builder.onSuccess((data) => alert(data[0].name))
```

### onFailure

`builder.onFailure(callback)`

This method allows to attach a callback to be invoked when the asynchronous task completes with errors. The callback is not invoked in case the task it is attached to is canceled (remember [takeEffect](side_effects.md)). Calling this method multiple times on the same builder causes the callback to be overwritten: the callback attached to the action to handle failures is the argument of the last invocation of this method

**Example**

Triggering an alert when an action completes

```js
builder.onFailure((data) => alert(data[0].name))
```

### run

`builder.run(...args)`

This method closes the builder and dispatches the action with the passed in `...args` as params and the configuration defined with the other methods. This method must be the last invocation on a builder, no further configuration will be taken into account after calling it.

### asPromise

`builder.asPromise(...args)`

This method closes the builder and dispatches the action with the passed in `...args` as params and the configuration defined with the other methods. This method must be the last invocation on a builder, no further configuration will be taken into account after calling it. The return value of this method is no more a `Builder` instance, but a `Promise`.

If you set callbacks with `builder.onSuccess` or `builder.onFailure`, they will be invoked properly before the Promise completes (either resolving or rejecting)

**Example**

Returning a Promise from an action

```js
builder
  .asPromise(1, 'admin')
  .then(() => {
    console.log('success')
  })
  .catch(() => {
    console.log('failure')
  })
```

## useRj

`useRj` is a React Hook that allows the instantiation of one RjObject
which is then made available to the component.<br />
It's accept an RjObject as input and return its [computed state](computed_state_selectors.md)
and [action creators](action_creators.md).

```js
import { rj, useRj } from 'react-rocketjump'

const TodosState = rj(() => fetch('/api/todos').then((r) => r.json()))

function Todos() {
  const [{ data, pending, error }, { run }] = useRj(TodosState)
  // ...
}
```

useRj acept a second optional parameter `mapStateToProps`:

<!-- prettier-ignore -->
```js
(internalState, selectors, computedState) => outState
```

You can use it to map the returned state using selectors:

```js
import { useRj } from 'react-rocketjump'

const Component = (props) => {
  const [{ gooData }, { run }] = useRj(rjObject, (state, { getData }) => ({
    goodData: getData(state),
  }))
  // ...
}
```

## connectRj

TODO

## useRunRj

The `useRunRj` hook, just like `useRj`, allows to instantiate a RjObject in the definition of a React Component. Unlike `useRj`, this hook automatically schedules the `run` call of the RjObject when there is a change in its arguments. To stress the concept that the control point of the effect are its arguments, we will also refer to them as _dependencies_, but this is only a different point of view: the _dependencies_ argument of the `useRunRj` hook is used to understand when the effect should be run, and the items of the _dependencies_ array is spread as arguments on the `run` call.

### Basic usage

The signature of the hook is:

```js
useRunRj(
  RjObject,
  deps = [],
  shouldCleanBeforeRun = true,
  mapStateToProps = (state) => state)
) : [state, actions]
```

`rjObject`: an [RjObject](rj_object.md).

`deps` is the _dependencies_ array. You can pass any JavaScript array with any content (provided you can deal with it in the implementation of the `effect` property of the `rjObject` argument), or you can decide to opt-in for _automatic dependency management_ (see later). Either way, the items you put in this array will be the arguments with which your effect will be invoked.

`shouldCleanBeforeRun`, if set to `true`, instructs the hook to run the `clean` action before triggering `run` (except for the first run, when no clean is triggered)

`mapStateToProps` is a function that is used to modify the shape of the state before returning it to the component.
Works as explained in `useRj` section.

This is a very simple example of how this hook is expected to be used:

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const UserState = rj({
  effect: (userId, group) =>
    fetch(`/api/user/${userId}?group=${group}`).then((r) => r.json()),
  computed: {
    user: 'getData',
  },
})

function UserCard({ userId, group }) {
  const [{ user }] = useRunRj(UserState, [userId, group], false)
  return <h1>Hello {user?.name}</hi>
}
```

Dependencies should be defined with care to avoid unnecessary `run` calls. The following example shows how you can blow your work up with a simple distraction

```js {7}
import { useRunRj } from 'react-rocketjump'
import MyResourceRj from './localstate'

function Component() {
  const [{ data: resource }, actions] = useRunRj(
    MyResourceRj,
    // DON'T DO THIS
    [{ params: props.resourceName }],
    false
  )
}
```

In this example, the first (and only) item of the _dependencies_ array is a plain object. While this is not an issue for _rocketjump_ itself, it causes an infinite loop of calls. This comes from the fact that, at each render, a new `Object` instance is created from that definitions, and hence, when _rocketjump_ checks if _dependencies_ array changed, if finds a different object with respect to the previous render call, and so it triggers a new `run`. When this run completes, the component is re-rendered with the `resource` const set to the results, but in rerendering the object passed as a dependency changes again, hance the loop.

The proper way to achive the same behaviour without blowing up the application is to rely on memoization to ensure that _dependencies_ array contains referentially stable items

```js
import { useMemo } from 'react'
import { useRunRj } from 'react-rocketjump'
import MyResourceRj from './localstate'

function Component(props) {
  const filter = useMemo(
    () => ({
      params: props.resourceName,
    }),
    [props.resourceName]
  )

  const [{ data: resource }, actions] = useRunRj(MyResourceRj, [filter], false)
}
```

### Automatic dependency management

When using multiple RjObjects in the same component, it may happen that the dependency array of a `useRunRj` hook depends on the response of the invocation of another `useRunRj`. This is only a particular case of a more complex problem: how can we deal with potentially missing dependencies? Since hooks cannot be called conditionally, the only way to trigger a `run` action on some RjObject only when its dependencies are available is to manually write a conditional call inside a custom `useEffect`. Starting with `react-rocketjump` version **2.1.0**, dependency management can be solved in a declarative way by marking dependencies that must be awaited before a run is triggered. Note that the concept of awaiting is general: you may want to await that an API call completes as well as that the user fills out a box and hits `Enter`.

RocketJump provides various tools to deal with (potentially) missing dependencies, which can be imported as

```js
import { deps } from 'react-rocketjump'
```

Each tool can be interpreted as a marker, which instructs the rocketjump engine whether to trigger a `run` or not, and eventually to attach some metadata to it. There are two main classes of markers: _run preventing markers_ and _meta setting markers_

### deps.maybe

> run preventing marker

```js
deps.maybe(value): Dep
```

The _maybe_ marker is the most simple marker you can think of: it tells the engine not to run the effect as long as the `value` argument is falsy, and to run it inserting `value` as a positional argument otherwise

The `Dep` instance returned by the marker exposes a _withMeta_ method, that allows to set some metadata to be attached to the next `run` call in case `value` has changed from the last `run` call (metadata are always attached to the first call, since there is no previous value to compare).

For example, you can do something like this

```js
import { useRunRj, deps } from 'react-rocketjump'
import MyResourceRj from './localstate'

const Component = (props) => {
  const [{ data: resource }, actions] = useRunRj(
    MyResourceRj,
    [deps.maybe(props.resourceId).withMeta({ changedResourceId: true })],
    false
  )
}
```

_value_ can belong to any JS type or it can be the output of a _withMeta_ marker. Using any other markers result in undefined behaviour.
Note that the following statements are fully equivalent:

```js
/* #1 */ deps.maybe(arg).withMeta(meta)
/* #2 */ deps.maybe(deps.withMeta(arg, meta))
```

Note that you can chain `.withMeta()` invocations on the output of a marker. In this case, the final `meta` object will be the shallow merging of the `meta` objects in call order (i.e. the later the call the higher the priority)

### deps.maybeNull

> run preventing marker

```js
deps.maybeNull(value): Dep
```

This marker is very similar to `deps.maybe`, but prevents a `run` call only in case the `value` argument is `null`, and not any falsy value like the `deps.maybe`. So, please refer to the docs about `deps.maybe` keeping this difference in mind.

### deps.maybeGet

> run preventing marker

```js
deps.maybeGet(value, path): Dep
```

This marker is very similar to `deps.maybe`, but instead of injecting `value` as an argument to the `run` call, it injects `lodash.get(value, path)`. So, please refer to the docs about `deps.maybe` keeping this difference in mind

### deps.allMaybe

> run preventing marker

```js
deps.allMaybe([value1, value2, ..., valueN]): Dep[]
```

This marker is a shortcut to apply the `deps.maybe` marker to several elements organized in an array. Hence, `valueX` elements can be anything that can be passed as `value` to `deps.maybe`. Please, carefully read docs about `deps.maybe` before using this

### deps.allMaybeNull

> run preventing maker

```js
deps.allMaybeNull([value1, value2, ..., valueN]): Dep[]
```

This marker is a shortcut to apply the `deps.maybeNull` marker to several elements organized in an array. Hence, `valueX` elements can be anything that can be passed as `value` to `deps.maybe`. Please, carefully read docs about `deps.maybe` and `deps.maybeNull` before using this

### deps.withMeta

> meta setting marker

```js
deps.withMeta(value, meta): Dep
```

This marker allows to set some metadata on the `run` call whenever `value` changes (with respect to the previous render call). `meta` must be a plain JavaScript object, while value can be either any JavaScript value, or the output of a `deps.maybe`, `deps.maybeNull`, `deps.maybeGet` or `deps.withMeta` invocation. For the first three situations, refer to the documentation of the appropriate marker.

This marker cannot be used to prevent the `run` trigger, but its `value` argument is still injected as a positional argument into the `run` call

Nesting `deps.withMeta` markers results in `meta` objects being merged from inside to outside: this means that, in case of name clashes in properties, the winning value will be the outermost one.

As for any other `Dep`-returning marker, you can call `.withMeta(other_meta)` on the output of the marker, and you can also chain multiple calls. As usual in _rocketjump_, `meta` objects will be merged from left to right.

To clarify the composition rules, observe the following example. Despite being pretty cumbersome, it should cover any possible case of priority

```js
deps
  .withMeta(deps.withMeta(deps.withMeta(value, metaC), metaB), metaA)
  .withMeta(metaD)
  .withMeta(metaE)

// Final meta object will be (hope you like spread operators)
const finalMeta = {
  ...{
    ...{
      ...{
        ...metaC,
        ...metaB,
      },
      ...metaA,
    },
    ...metaD,
  },
  ...metaE,
}
```

### deps.withAlwaysMeta

> meta setting marker

```js
deps.withAlwaysMeta(meta): Dep
```

This marker allows to set metadata on a `run` call unconditionally. The `meta` argument must be a plain javascript object. Furthermore, this marker injects no arguments in the `run` call (this means that neither `undefined` nor `null` nor any other value, just treat them as if they were never inserted when it comes to understanding which arguments the `run` call will be made with)

As for the `deps.withMeta` marker, this marker returns a `Dep` instance, which means you can call `.withMeta(meta)` on it. Please note that the following invocations are equivalent

```js
deps.withAlwaysMeta(metaA).withMeta(metaB).withMeta(metaC)
deps.withAlwaysMeta({ ...{ ...metaA, ...metaB }, ...metaC })
```

### deps.withMetaOnMount

> meta setting marker

```js
deps.withMetaOnMount(meta): Dep
```

This marker allows to set metadata on a `run` call just for the `run` call that happens at mount. The `meta` argument must be a plain javascript object. Furthermore, this marker injects no arguments in the `run` call (this means that neither `undefined` nor `null` nor any other value, just treat them as if they were never inserted when it comes to understanding which arguments the `run` call will be made with)

As for the `deps.withMeta` marker, this marker returns a `Dep` instance, which means you can call `.withMeta(meta` on it. Please note that the following invocations are equivalent

```js
deps.withMetaOnMount(metaA).withMeta(metaB).withMeta(metaC)
deps.withMetaOnMount({ ...{ ...metaA, ...metaB }, ...metaC })
```

### Multiple meta setting markers in deps

You are free to use as many _meta setting markers_ in your _dependencies_ arrays, but remember that the engine will always squash them into a single object before starting the call. In case you have many _meta setting markers_, all of them will be evaluated and the results will be merged in array order, i.e. from left to right, as usual in _rocketjump_
