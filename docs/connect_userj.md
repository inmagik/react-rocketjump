---
id: connect_userj
title: useRj
sidebar_label: useRj
---
## Generalities

`useRj` is a React Hook that allows the instantiation of _one_ RocketJump Object, which is then made available to the component. To instantiate more RocketJump objects in the same component, just invoke the hook once for each of them.

## Basic usage
The signature of the hook is

```js
import { useRj } from 'react-rocketjump'

const Component = props => {
  const [state, actions] = useRj(rjObject, mapStateToProps)
}
```
`rjObject`: output of the call to a `RocketJump Constructor`, refer to [defining RocketJump Objects](api_rj.md) section

`mapStateToProps` is a function that is used to modify the shape of the state before returning it to the component. The role of this function is to extract information from the state and to shape it as needed by the component. To understand this function, you should read [working with state](usage_state.md).

For what you can do with `state` refer to [working with state](usage_state.md), and for what you can do with `actions` to [working with actions](usage_actions.md)

This is a very simple example of what you can expect when using this hook

```js
import { useRj } from 'react-rocketjump'

const Component = props => {
  const [{ x }, { run: loadX }] = useRj(
    rjObject,
    (state, { getData }) => ({
      x: getData(state),
    }),
  )

  useEffect(() => {
      // This actually triggers the side effect
      //   and populates the x constant
      loadX()
  }, [])
}
```

> Pro tip: you can use object destructuring to rename actions when using hooks. This allows to avoid name clashes with actions