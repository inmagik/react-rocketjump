---
id: effect_caller
title: Effect Caller
sidebar_label: Effect Caller
slug: /effect-caller
---

We have learned how side effects works in the RocketJump world but sometimes
you need to hook into the effect to add some logic on top of it.<br />
A tipical example is the authentication, your authentication logic can live
outside of RocketJump but you need to "inject" it in RocketJump effect. <br />
For this purpose RocketJump provided a way to hook into a generic effect the
`effectCaller` option.
The effect caller option take an effect and the params passed to it and should
return the same values an effect return: Promise or Observable.
Let's see an example to clarify the concept, now we add a retry features to our
RjObject.

```js
import { rj } from 'react-rocketjump'

rj({
  effectCaller: (effectFn, ...params) =>
    effectFn(...params).catch(() => effectFn(...params)),
  // ..
})
```

Note this example is only for teaching purpose you can do better to implement
a retry system, but you can see that the effect caller take the effect, call
it with given params and if fails try to re call it.

## Configure effect inside React

Effect caller is useful but most of the time the state you need in the effect
caller live in the React context.
RocketJump provide a way to this this, the first step is to set the `effectCaller`
as `'configured'`:

```js
import { rj } from 'react-rocketjump'

rj({
  effectCaller: 'configured',
  // ..
})
```

The second step is to use a component called `<ConfigureRj />` up in your React
tree.

```jsx
import { ConfigureRj } from 'react-rocketjump'

export const App = () => (
  <ConfigureRj effectCaller={(effectFn, ...params) => {
    /** Your effect caller **/*
  }}>
    {/** Your App React Tree **/}
  </ConfigureRj>
)
```

The most inner `effectCaller` from `<ConfigureRj />` in the React tree
will be used as acutal effect caller when you set it as `configured`.

## Real world authentication example

Let's see a real world authentication example. For this example we use
a library from Inmagik family called [eazy auth](https://github.com/inmagik/use-eazy-auth).
This library provide a simple way to add authentication to your React app.<br />
The libary give you a function called `callAuthApiObservable` to inject
the auth flow inside a generic function you can easy integrate it with RocketJump:

```jsx
import { ConfigureRj, rj, useRunRj } from 'react-rocketjump'
import { useAuthActions } from 'use-eazy-auth'
import { login, me, refresh } from './authApis'

const Todos = rj({
  effectCaller: 'configured',
  effect: (token) => () =>
    fetch(`/api/todos/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => (res.ok ? res.json() : Promise.reject(res))),
})

export default function Dashboard() {
  const [{ data: todos }] = useRunRj(Todos)
  // ...
}

function ConfigureAuth({ children }) {
  const { callAuthApiObservable } = useAuthActions()
  return (
    <ConfigureRj effectCaller={callAuthApiObservable}>{children}</ConfigureRj>
  )
}

function App() {
  return (
    <Auth loginCall={login} meCall={me} refreshTokenCall={refresh}>
      <ConfgureAuth>
        <Dashboard />
      </ConfgureAuth>
    </Auth>
  )
}
```
