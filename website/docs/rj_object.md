---
id: rj_object
title: RjObject
sidebar_label: RjObject
slug: /rj-object
---

RjObject is the base type of RocketJump it's the **container** that represent a piece
of your "data source logic".

Concretely an RjObject contains:

- An internal state described by his [reducer](reducer.md).
- A proxy between the internal state and the [computed state](computed_state_selectors.md) used by consumers.
- A [side effect(s)](side_effects.md) in form of Observables.
- A set of [action creators](action_creators.md) functions that triggers side effects and/or state updates.
- An optional friendly name used for [debug purpose](logger.md).

## Create

You can create RjObjects using the `rj()` function.
The only mandatory input to create an RjObject
is an **effect** function of type: `(...args) => Promise | Observable`.

```js
import { rj } from 'react-rocketjump'

const MyObj = rj(() => Promise.resolve('Hello Rj!'))
// is equivalent to:
const MyObj = rj({
  effect: () => Promise.resolve('Hello Rj!'),
})
```

## Consuming

When consuming an RjObject from React hooks or HOCs you receive from them
some **state** and **action creators**.

```js
import { useRj } from 'react-rocketjump'

const [state, actions] = useRj(MyObj)
```

## Default state

The `rj()` defaults are designed to store the last effect results
along with some meta information and give to consumers a state with this shape:

```js
{
  data: any,
  pending: boolean,
  error: any
}
```

- `data`: The last effect result, `null` on start.
- `pending`: A flag that indicates if your effect is in flying.
- `error`: The eventually effect error, `null` on start.

## Default action creators

The `rj()` defaults action creators are designed to work with the default state and
given effect and are:

- `run(...args: any[])`: trigger effect, `...args` are passed as effect inputs,
  set `pending` to `true` and `error` to `null`,
- `cancel()`: cancel effect execution, set `pending` to `false`.
- `clean()`: cancel effect execution, set `pending` to `false`, `data` and `error`  to `null`.
- `updateData(newData)`: set the `data` value to `newData`.

## React example

This is a complete example using the concept exposed above:

```jsx
import { useEffect } from 'react'
import { rj, useRj } from 'react-rocketjump'

const UserState = rj({
  effect: (id) => fetch(`/api/user/${id}`).then((r) => r.json()),
})

function UserCard({ id }) {
  const [{ data, pending, error }, { run, clean }] = useRj(HelloState)

  useEffect(() => {
    run(id)
    return clean
  }, [run, clean, id])

  return <div>{data && <h1>Hello {user.name}</h1>}</div>
}
```

:::note

Returning clean in `useEffect` is only needed if you want to clear `data` value
when `id` changes.
The reason isn't to avoid setting state on unmounted component.
**ALL** effect are guarantee to be canceld when component unmount.
:::

You can write it in a more concise way using the `useRunRj` hook instead of `useRj`,
learn more on [how to cunsume RjObjects](consume_rj_objects.md).

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const UserState = rj({
  effect: (id) => fetch(`/api/user/${id}`).then((r) => r.json()),
})

function UserCard({ id }) {
  const [{ data, pending, error }] = useRunRj(HelloState, [id])

  return <div>{data && <h1>Hello {user.name}</h1>}</div>
}
```
