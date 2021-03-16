---
id: plugin_writing
title: Writing Plugins
sidebar_label: Writing Plugins
slug: /plugin-write
---
In order to write effective and powerful plugins, you may need to know how the internals of the library work.

## Operating with actions
When using the `actions` property you can define custom, plain actions, or leverage the predefined `run`, `cancel` and `clean` functions to define side-effectful actions. As for normal usage, in order to leverage the full power of the predefined actions it is necessary to call them using the builder. Things are slightly different when working inside the `actions` configuration. In particular, you have only one method available among those defined in the builder: the `withMeta` method (with both variants).

Moreover, you may need to access directly the params sent by the user when calling the action: they are available under the `action.payload.params` path. In the same way, the results of the asynchronous task are available under the `action.payload.data` path when the task completes. This can be useful when customizing the way plugins manage the completion of some actions.

## The state shape
The base (i.e. without plugins) state shape is the following
```js
{
    pending: bool,       // telles whether there is a pending instance of the task
    error: any,          // payload of the last execution, if it was a failing one
    data: any            // payload of the last successful execution of the task
}
```
You are strongly advised to change it only if patching the reducer accordingly: changing the state shape and relying on the default reducer may lead to unexpected behaviour
