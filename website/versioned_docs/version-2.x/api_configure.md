---
id: api_configure
title: Sharing configuration
sidebar_label: Sharing configuration
slug: /api-config
---

A strong use case for React-RocketJump is to manage asynchronous interaction with backend APIs, which are, usually, authenticated. As we have seen in the section about the [RocketJump constructor](api_rj.md), this can be achieved easily by using the `effectCaller` configuration key. However, you still have to specify the `effectCaller` key in almost all your RocketJump Object defintions, which can be tedious and error prone. For this reason, React-RocketJump ships with a component which can be used to share a common configuration among different RocketJump objects. This component is called `ConfigureRj`.

This is quite different from composition, since composition is described in RocketJump Objects definition, while this configuration is injected in RocketJump objects when they are connected to a component.

## How it works?
The `ConfigureRj` component can inject some configuration keys in RocketJump Objects that are connected to components in its subtree. This means that you can have multiple `<ConfigureRj />` components in your application, each one injecting a different configuration in a different subtree. `<ConfigureRj />` is implemented with React's `context` api, hence `<ConfigureRj />` components can also be nested, but be careful that differenct `<ConfigureRj />` components does not compose: the nearest parent wins.

Properties configured by `<ConfigureRj />` are injected in a `RocketJump object` if and only if it accepts them explicitly by defining the configuration key in its configuration and assigning it the special value `rj.configured()`

## Sharable properties
By now, the capability of `<ConfigureRj />` is limited to the `effectCaller` property. Introducing in the tree a `<ConfigureRj />` component with the `effectCaller` property set means that any component using a RocketJump Object (both with the `connectRj` hoc or the `useRj` hook) will inherit the `effectCaller` unless you explicitly define it in the RocketJump Object definition

```js
<ConfigureRj effectCaller={myCustomEffectCaller}>
    /* This is the scope of the shared configuration */
</ConfigureRj>
```

## Example
This example shows how you can use the `<ConfigureRj />` API to easily implement authentication

```js
// localstate.js
import { rj } from "react-rocketjump"

const MyCustomRj = rj({
  effect: doSomethingAsync,
  // the following allows a <ConfigureRj /> component to inject
  // configuration into this RocketJump Object when it is used
  // in a component nested inside the same <ConfigureRj />
  effectCaller: rj.configured()
})

// my-component.js
import React from 'react'
import { ConfigureRj } from 'react-rocketjump'

const AuthContext = React.createContext(null)

class AuthWrapper extends React.Component {
  state = {
    user: null,
    authToken: null,
  }

  // ...

  injectAuth = (apiCall, ...params) =>
    apiCall(...params, this.state.authToken)

  render() {
    return (
      <AuthContext.Provider value={{
        user: this.state.user,
        login: this.performLogin,
        // ....
      }}>
        <ConfigureRj effectCaller={this.injectAuth}>
          {this.props.children}
        </ConfigureRj>
      </AuthContext.Provider>
    )
  }
}
```