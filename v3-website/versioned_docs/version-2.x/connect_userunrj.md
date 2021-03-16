---
id: connect_userunrj
title: useRunRj
sidebar_label: useRunRj
slug: /connect-userunrj
---
## Generalities

The `useRunRj` hook, just like `useRj`, allows to instantiate a `RocketJump Object` in the definition of a React Component. Unlike `useRj`, this hook automatically schedules the `run` call of the `RocketJump Object` when there is a change in its arguments. To stress the concept that the control point of the effect are its arguments, we will also refer to them as *dependencies*, but this is only a different point of view: the *dependencies* argument of the `useRunRj` hook is used to understand when the effect should be run, and the items of the *dependencies* array is spread as arguments on the `run` call

Let's clarify this with an example: we have a component that displays the properties of some resource available under a REST API on a GET endpoint. The way to achieve this using `useRj` is to get the id of the resource from props, connect the `RocketJump Object` with the hook, and then insert a `useEffect` hook to run the fetching task with the resource ID read from props. `useRunRj` is thought to speed up this scenario by automating the `run` call.

## Basic usage
The signature of the hook is

```js
import { useRunRj } from 'react-rocketjump'

const Component = props => {
  const [state, actions] = useRunRj(
    rjObject,
    deps = [],
    shouldCleanBeforeRun = true,
    mapStateToProps = state => state
  )
}
```

`rjObject`: output of the call to a `RocketJump Constructor`, refer to [defining RocketJump Objects](api_rj.md) section

`deps` is the aforementioned *dependencies* array. You can pass any JavaScript array with any content (provided you can deal with it in the implementation of the `effect` property of the `rjObject` argument), or you can decide to opt-in for *automatic dependency management* (see later). Either way, the items you put in this array will be the arguments with which your effect will be invoked.

`shouldCleanBeforeRun`, if set to `true`, instructs the hook to run the `clean` action before triggering `run` (except for the first run, when no clean is triggered)

`mapStateToProps` is a function that is used to modify the shape of the state before returning it to the component. The role of this function is to extract information from the state and to shape it as needed by the component. To understand this function, you should read [working with state](usage_state.md).

For what you can do with `state` refer to [working with state](usage_state.md), and for what you can do with `actions` to [working with actions](usage_actions.md)

This is a very simple example of how this hook is expected to be used

```js
import { useRunRj } from 'react-rocketjump'
import MyResourceRj from './localstate'

const Component = props => {
  const [{ data: resource }, actions] = useRunRj(
    MyResourceRj,
    [ props.resourceId ],
    false
  )
}
```

Dependencies should be defined with care to avoid unnecessary `run` calls. The following example shows how you can blow your work up with a simple distraction

```js
import { useRunRj } from 'react-rocketjump'
import MyResourceRj from './localstate'

// DON'T DO THIS
const Component = props => {
  const [{ data: resource }, actions] = useRunRj(
    MyResourceRj,
    [ { params: props.resourceName } ],
    false
  )
}
```

In this example, the first (and only) item of the *dependencies* array is a plain object. While this is not an issue for *rocketjump* itself, it causes an infinite loop of calls. This comes from the fact that, at each render, a new `Object` instance is created from that definitions, and hence, when *rocketjump* checks if *dependencies* array changed, if finds a different object with respect to the previous render call, and so it triggers a new `run`. When this run completes, the component is re-rendered with the `resource` const set to the results, but in rerendering the object passed as a dependency changes again, hance the loop.

The proper way to achive the same behaviour without blowing up the application is to rely on memoization to ensure that *dependencies* array contains referentially stable items

```js
import React, { useMemo } from 'react'
import { useRunRj } from 'react-rocketjump'
import MyResourceRj from './localstate'

const Component = props => {

  const filter = useMemo(() => ({
      params: props.resourceName
  }), [props.resourceName])

  const [{ data: resource }, actions] = useRunRj(
    MyResourceRj,
    [ filter ],
    false
  )

}
```

## Automatic dependency management
When using multiple `RocketJump Objects` in the same component, it may happen that the dependency array of a `useRunRj` hook depends on the response of the invocation of another `useRunRj`. This is only a particular case of a more complex problem: how can we deal with potentially missing dependencies? Since hooks cannot be called conditionally, the only way to trigger a `run` action on some `RocketJump Object` only when its dependencies are available is to manually write a conditional call inside a custom `useEffect`. Starting with `react-rocketjump` version 2.1.0, dependency management can be solved in a declarative way by marking dependencies that must be awaited before a run is triggered. Note that the concept of awaiting is general: you may want to await that an API call completes as well as that the user fills out a box and hits `Enter`.

`React-RocketJump` provides various tools to deal with (potentially) missing dependencies, which can be imported as

```js
import { deps } from "react-rocketjump"
```

Each tool can be interpreted as a marker, which instructs the rocketjump engine whether to trigger a `run` or not, and eventually to attach some metadata to it. There are two main classes of markers: *run preventing markers* and *meta setting markers*

### deps.maybe
> run preventing marker
```js
deps.maybe(value): Dep
```
The *maybe* marker is the most simple marker you can think of: it tells the engine not to run the effect as long as the `value` argument is falsy, and to run it inserting `value` as a positional argument otherwise

The `Dep` instance returned by the marker exposes a *withMeta* method, that allows to set some metadata to be attached to the next `run` call in case `value` has changed from the last `run` call (metadata are always attached to the first call, since there is no previous value to compare).

For example, you can do something like this
```js
import { useRunRj, deps } from 'react-rocketjump'
import MyResourceRj from './localstate'

const Component = props => {
  const [{ data: resource }, actions] = useRunRj(
      MyResourceRj,
      [
        deps.maybe(props.resourceId)
          .withMeta({ changedResourceId: true })
      ],
      false
    )
}
```

*value* can belong to any JS type or it can be the output of a *withMeta* marker. Using any other markers result in undefined behaviour.
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

As for any other `Dep`-returning marker, you can call `.withMeta(other_meta)` on the output of the marker, and you can also chain multiple calls. As usual in *rocketjump*, `meta` objects will be merged from left to right.

To clarify the composition rules, observe the following example. Despite being pretty cumbersome, it should cover any possible case of priority
```js

deps
    .withMeta(
        deps.withMeta(
            deps.withMeta(value, metaC),
            metaB
        ),
        metaA
    )
    .withMeta(metaD)
    .withMeta(metaE)

// Final meta object will be (hope you like spread operators)
const finalMeta = {
    {
        ...{
            ...{
                ...metaC,
                ...metaB
            },
            ...metaA
        },
        ...metaD
    },
    ...metaE
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
deps.withAlwaysMeta({...{...metaA, ...metaB}, ...metaC})
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
deps.withMetaOnMount({...{...metaA, ...metaB}, ...metaC})
```

### Multiple meta setting markers in deps
You are free to use as many *meta setting markers* in your *dependencies* arrays, but remember that the engine will always squash them into a single object before starting the call. In case you have many *meta setting markers*, all of them will be evaluated and the results will be merged in array order, i.e. from left to right, as usual in *rocketjump*