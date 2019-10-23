---
id: api_connect
title: Connecting RocketJumps
sidebar_label: Connecting RocketJumps
---

### mapStateToProps

`(state, selectors, ownProps) => props`

This function is used to gather values from the state, leveraging powerful selectors, and inject them in the component as props. When writing this function, you should treat the state as an opaque object, and rely on selectors to extract data from it. This allows to decouple the state shape and the code that needs data contained in the state.

The ownProps object contains the props passed to the component from its parent, and can be accessed to write more direct bindings. When using `useRj` hook this parameter is not available (because props are already available in the context)

Predefined selectors included in the `selectors` bag are

- **getData**: returns the output of the last completed invocation of the task
- **getError**: returns the output of the last failed invocation of the task (if it failed, null otherwise)
- **isPending**: returns whether there is a pending invocation of the task

Plugins can add new selectors or change the behaviour of existing once, hence if you are using plugins refer to their documentation

**Example**

This example describes how to extract the output of the last task run and make it available to the component as a `data` prop.

```js
const mapStateToProps = (state, selectors) => {
  const x = selectors.getData(state)
  return {
    data: x,
  }
}
```

### mapActionsToProps

`actions => props`

This function is used to inject active props to your component, e.g. props that are functions. When you invoke one of this props, an action is dispatched to the store, and, if the action is constructed in a proper way, the async task is invoked.

Predefined `actions` bag contains

- `run`: launches the task
- `cancel`: cancels any pending instances of the task
- `clean`: cancels any pending instances of the task and resets the state to the original value

Plugins can add new actions or change the behaviour of existing ones, hence if you are using plugins refer to their documentation

This parameter is mainly intended to rename actions, with the aim of avoiding name clashes in properties (which would be a very common case when connecting two or more `RocketJump Object` instances to the same component). If you need to further customize actions, refer to the `actions` configuration property when creating your `RocketJump Object` (you can find more info [here](api_rj.md))

**Example**

This example describes how to inject the `run` action in the `loadTodos` prop

```js
const mapActionsToProps = ({ run }) => ({
  loadTodos: run,
})
```