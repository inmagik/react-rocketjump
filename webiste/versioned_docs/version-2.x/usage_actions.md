---
id: usage_actions
title: Working with actions
sidebar_label: Working with actions
slug: /usage-actions
---

Once you have [connected your component with a RocketJump Object](connect_generalities.md), you have some actions bound to your props. There are two ways to trigger these actions: the _quicker_ way and the _rich_ way. The _quicker_ way is, ehm, quicker, but allows bare minimal configuration, while the _rich_ way is more verbose but allows to exploit the full power of React-RocketJump. Whether to use the former or the latter is a matter of need, each specific case may fit better with one or the other. However, you don't have to stick with an approach: you can select the best one any time you need to make a call.

## Available actions
By default, the library exposes the following actions in the action bag

```js
ActionBag.run           // triggers a new run of the effect
ActionBag.clean         // stops any pending run and resets the state to its original value
ActionBag.cancel        // stops any pending run
ActionBag.updateData    // writes in the `data` property of the state the passed argument
```

You can customize or add actions by means of the *actions* configuration property (or you can include a RocketJump partials that defines the *action* configuration property)

The way you can access the action bag depends on the connection mechanism:
- when using a HOC, the action bag is spread among properties
- when using a HOOK, the action bag is returned as a plain object

To avoid name clashes in HOC mode, you can pass to the connection a `mapActionsToProps` function with the following signature
```js
(actions: Object) => Object
```

This allows you to extract interesting actions from the action bag in object form and to rename them as you wish. The output of the function is spread among properties as the action bag. If you don't provide any function, the default action bag is spread.

## Quicker way: direct invocation

Action properties are functions that can be directly invoked. Let's suppose we imported the `run` action under the `loadData` name. The quick invocation consists of

```js
loadData(arg1, arg2, arg3, ...)
```

This invocation triggers the dispatching of the action to the state, and, in case it is a side-effect action, to the side-effect management logic.

In case of a `run` action, the params you pass in during the call are sent to the `effect` function of the RocketJump, and hence a new task is spawned with them. **Beware** that plugins can modify the way params are sent to the `effect` function, so refer to their documentation.

In case of a `clean` action, the params are ignored, except for the case some plugin does some magic on them. Again, refer to plugin documentation.

In case of user-defined actions, it is up to the user to know what to do with the params

## Rich way: using the Builder

Each action comes with a builder, which allows to set a bunch of properties on the action that will be sent to the store. Let's take again our `run` action imported with the name `loadData`. The methods exposed on the action by the builder are

```js

Builder builder = loadData.withMeta(object)
Builder builder = loadData.withMeta(oldMeta => newMeta)
Builder builder = loadData.onSuccess(callback)
Builder builder = loadData.onError(callback)
Builder builder = loadData.asPromise(...args)
```

Each of these methods instantiates a new Builder to be used for the _rich_ call, and calls the omonimous method on the created builder (so avoiding an explicit call to instantiate the builder).

The methods exposed by the builder object are

```js
builder.withMeta(object)
builder.withMeta(oldMeta => newMeta)
builder.onSuccess(callback)
builder.onError(callback)
builder.run(...args)
builder.asPromise(...args)
```

First of all, builder methods are designed to be chainable, hence probably you'll never create a `builder` variable in your code, but you'd end up writing something like

```js
loadData
  .withMeta({ id: 42 })
  .onSuccess(data => console.log(data))
  .onError(err => console.warn(err))
  .run()
```

Now, let's go describing the methods of the builder

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

This method allows to attach a callback to be invoked when the asynchronous task completes without errors. The callback is not invoked in case the task it is attached to is canceled (remember [takeEffect](api_rj.md)?). Calling this method multiple times on the same builder causes the callback to be overwritten: the callback attached to the action is the argument of the last invocation of this method

**Example**

Triggering an alert when an action completes

```js
builder.onSuccess(data => alert(data[0].name))
```

### onFailure

`builder.onFailure(callback)`

This method allows to attach a callback to be invoked when the asynchronous task completes with errors. The callback is not invoked in case the task it is attached to is canceled (remember [takeEffect](api_rj.md)?). Calling this method multiple times on the same builder causes the callback to be overwritten: the callback attached to the action to handle failures is the argument of the last invocation of this method

**Example**

Triggering an alert when an action completes

```js
builder.onFailure(data => alert(data[0].name))
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
