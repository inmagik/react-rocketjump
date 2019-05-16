---
id: api_connect
title: Connecting RocketJumps
sidebar_label: Connecting RocketJumps
---
Connecting a RocketJump Object with a React component means:
* creating a state object to hold the result of the task
* creating selectors for easy access to the state object
* instantiating a reducer to manage the state object
* creating action creators to manage the task and the state object

There are two options to connect a RocketJump Object to a React Component: the `connectRj` higher order component, and the `useRj` hook. Both take the same arguments:

```js
connectRj(rocketJumpObject, mapStateToProps, mapActionsToProps)

useRj(rocketJumpObject, mapStateToProps, mapActionsToProps)
```

## Connection arguments

### RocketJumpObject
A RocketJump object is the output of a call to the [RocketJump Constructor](api_rj.md) in which there was included a configuration object with the `effect` property. The RocketJump object is used as a recipe to create all the stuff listed beforehand

### mapStateToProps
`(state, selectors, ownProps) => props`

This function is used to gather values from the state, leveraging powerful selectors, and inject them in the component as props. When writing this function, you should treat the state as an opaque object, and rely on selectors to extract data from it. This allows to decouple the state shape and the code that needs data contained in the state.

The ownProps object contains the props passed to the component from its parent, and can be accessed to write more direct bindings. When using `useRj` hook this parameter is not available (because props are already available in the context)

Predefined selectors included in the `selectors` bag are
* __getData__: returns the output of the last completed invocation of the task
* __getError__: returns the output of the last failed invocation of the task (if it failed, null otherwise)
* __isPending__: returns whether there is a pending invocation of the task

Plugins can add new selectors or change the behaviour of existing once, hence if you are using plugins refer to their documentation

__Example__

This example describes how to extract the output of the last task run and make it available to the component as a `data` prop.

```js
const mapStateToProps = (state, selectors) => {
    const x = selectors.getData(state)
    return {
        data: x
    }
}
```

### mapActionsToProps
`actions => props`


This function is used to inject active props to your component, e.g. props that are functions. When you invoke one of this props, an action is dispatched to the store, and, if the action is constructed in a proper way, the async task is invoked.

Predefined `actions` bag contains
* `run`: launches the task 
* `cancel`: cancels any pending instances of the task
* `clean`: cancels any pending instances of the task and resets the state to the original value

Plugins can add new actions or change the behaviour of existing ones, hence if you are using plugins refer to their documentation

__Example__

This example describes how to inject the `run` action in the `loadTodos` prop

```js
const mapActionsToProps = ({ run }) => ({
    loadTodos: run   
})
```

## connectRj

`connectRj` is a HOC component that allows bind _one_ RocketJump Object to _one_ component. If you want to bind multiple RocketJump Objects, you must nest `connectRj` invocations accordingly.

The signature of the HOC is 

```js
import { connectRj } from 'react-rocketjump'

const ConnectedComponent = connectRj(
    rjObject, 
    mapStateToProps, 
    mapDispatchToProps
)
```

## useRj

`useRj` is a React Hook that allows the instantiation of _one_ RocketJump Object, which is then made available to the component. To instantiate more RocketJump objects in the same component, just invoke the hook once for each of them. 

The signature of the hook is
```js
import { useRj } from 'react-rocketjump'

const Component = (props) => {

    const [state, actions] = useRj(
        rjObject, 
        mapStateToProps, 
        mapDispatchToProps
    )

}

```

The state object is the output of the invocation of `mapSelectorsToProps`, and the actions object is the output of `mapActionsToProps`. Our suggestion is to use object destructuring operators to have compact declaration, but feel free to structure your code as you wish.

```js
import { useRj } from 'react-rocketjump'

const Component = (props) => {

    const [{ x }, { loadX }] = useRj(
        rjObject, 
        (state, { getData }) => ({ 
            x: getData(state)
        }), ({ run }) => ({
            loadX: run
        }))
}

```
