---
id: usage_connectrj
title: connectRj
sidebar_label: connectRj
---
## Generalities

`useRj` is a React Higher Order Component that allows the instantiation of _one_ RocketJump Object, which is then made available to the component. To instantiate more RocketJump objects in the same component, you need to nest many HOCs like these (but prefer to use hooks, if possible, as they are much more clear and readable)

## Basic usage
The signature of the HOC is

```js
import { connectRj } from 'react-rocketjump'
import { Component } from './my-component-library'
import { rjObject } from './localstate'

const ConnectedComponent = connectRj(
  rjObject,
  mapStateToProps,
  mapDispatchToProps
)(Component)
```
`rjObject`: output of the call to a `RocketJump Constructor`, refer to [defining RocketJump Objects](www.google.com) section

`mapStateToProps` is a function that is used to modify the shape of the state before spreading it in component props. The role of this function is to extract information from the state and to shape it as needed by the component. To understand this function, you should read [working with state](www.google.com).

`mapActionsToProps` is a function that is used to modify the shape of the action bag before spreading it in component props. This is mainly meant to rename actions, avoiding name clashes. Its expected value is a function that accepts a plain JavaScript object (which contains as props action name and functions as values) and return another object with the same rationale, but possibly different keys. Before trying to write this function, please read [working with actions](www.google.com)

For what you can do with `state` refer to [working with state](www.google.com), and for what you can do with `actions` to `working with actions`(www.google.com). Please note that `state` and `actions` are not props passed to &lt;Component /&gt;, but are spread so that their keys are props. If you want to have `state` and `actions` as props, you should do something like this

```js
import { connectRj } from 'react-rocketjump'
import { Component } from './my-component-library'
import { rjObject } from './localstate'

const ConnectedComponent = connectRj(
  rjObject,
  state => ({ state }),
  actions => ({ actions })
)(Component)
```

In order to ease out the task of connecting multiple `RocketJump Objects` by nesting `connectRj` invocations, a `compose` helper is provided with the following syntax:

```js
(hoc1, hoc2, hoc3, ...) => React.Component => React.Component
```

This means that the following are equivalent
```js
import { connectRj, compose } from 'react-rocketjump'
import { Component } from './my-component-library'
import { rjObject, rjObjectB } from './localstate'

/* #1 */
const ConnectedComponent = 
    connectRj(
        rjObjectA,
        mapStateAToProps,
        mapActionsAToProps
    )(
        connectRj(
            rjObjectB,
            mapStateBToProps,
            mapActionsBToProps
        )(Component)
    )

/* #2 */
const ConnectedComponent = compose(
    connectRj(rjObjectA, mapStateAToProps, mapActionsAToProps),
    connectRj(rjObjectB, mapStateBToProps, mapActionsBToProps)
)(Component)
```

This is a very simple example of what you can expect when using this hook and the `compose` utility

```js
const ConnectedComponent = compose(
  connectRj(
    rjFirst,
    state => ({ first: state.data }),
    ({ run }) => ({ loadFirst: run })
  ),
  connectRj(
    rjSecond,
    state => ({ second: state.data }),
    ({ run }) => ({ loadSecond: run })
  ),
  connectRj(
    rjThird,
    state => ({ third: state.data }),
    ({ run }) => ({ loadThird: run })
  )
)(MySuperCoolComponent)
```