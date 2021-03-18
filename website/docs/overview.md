---
id: overview
title: Overview
sidebar_label: Overview
slug: /
---

React RocketJump (**rj** for friends) is a library to help you manage state and side effects in React applications.

State managment is inspired by [redux](https://redux.js.org), from redux RocketJump borrows concepts like reducers, actions creators and selectors.

Side effects are handled using [rxjs](https://rxjs.dev)

React RocketJump create reusable state containers called **RjObject**, you can consume them from React using hooks or HOCs.

RjObject are local they live and dead in the context of your React Components, you can still share them using [React Context API](https://reactjs.org/docs/context.html).

RocketJump tries and get the best from [flux](https://facebook.github.io/flux)
architecture but without all the pain and boilerplate.
RocketJump uses convention over configuration, common use cases are quick to achieve and require very little code to write, but on the other hand
let you customize everything to help you solve real world complex scenarios and edge cases.

The smallest RocketJump example looks like:

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const HelloObj = rj(() => Promise.resolve('Hello World'))

function App() {
  const [{ data }] = useRunRj(HelloObj)

  return (
    <h1>{data}</h1>
  )
}
```

It displays (async) a heading saying "Hello, world!" on the page.

