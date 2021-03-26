---
id: mutations
title: Mutations
sidebar_label: Mutations
slug: /mutations
---

Mutations are a first class api of RocketJump to describe asynchronous mutation
of the state. <br />
You can add mutations to your RjObject with the `mutations` config option, an object
where the _keys_ are the **mutation names** and the values are configuration objects.

A mutation is essentially defined by two elements:

- The effect, that follow the same rules of RocketJump effect.
- The logic to update the root state from the effect result (**updater**).

Then we can add some accessory options:

- The [effectCaller](effect_caller.md) for the mutation effect.
- The [takeEffect](side_effects.md) to describe the mutation side effect.
- The reducer to track mutation state.

Mutation are based on RocketJump elements. So for each mutation
RocketJump perform the following tasks:

- Create a side effect with the same rules of RocketJump side effects using mutation
  settings `effect`, `effectCaller` and `takeEffect`.
- Add an [effect action creator](action_creators.md) using the mutation name (the key of your configuration).
- If the `reducer` mutation option is given create a reducer under the key: `mutations.[mutationName]`.
- Apply the `updater` function to your root state when the effect completed with success.

Here an example of a simple mutation:

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const TodosState = rj({
  mutations: {
    addTodo: {
      effect: (todo) =>
        fetch('api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todo),
        }).then((r) => r.json()),
      // Add the new todo on topo of the todo list
      updater: (rootState, newTodo) => ({
        ...rootState,
        data: [newTodo].concat(rootState.data),
      }),
    },
  },
  effect: () => fetch('/api/todos').then((r) => r.json()),
})

function Todos() {
  const [{ data }, { addTodo }] = useRunRj(TodosState)

  return (
    <>
      <TodoForm
        onSubmit={(title) => {
          return addTodo
            .onSuccess((createdTodo) => {
              alert(`Todo ${createdTodo.title} created!`)
            })
            .asPromise({ title })
        }}
      />
      <TodosList todos={data} />
    </>
  )
}
```

## Writing mutations

Now we go deep of how confguring mutations.

### `effect`

The effect of the mutation, works as RocketJump effect.

### `updater`

A **pure function** used to update your [root state](reducer.md) in response
of mutation effect completation.

<!-- prettier-ignore -->
```js
(rootState, result) => nextRootState
```

Otherwise you can provide a _string_ refer to an action creator name.
For example we can use the built-in `updateData` action creator to simple
update the `data` when mutation complete:

```js
import { rj } from 'react-rocketjump'

const ProductDetailState = rj({
  mutations: {
    updateProduct: {
      effect: (product) =>
        fetch(`api/product/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }).then((r) => r.json()),
      updater: 'updateData',
    },
  },
  effect: (id) => fetch(`/api/product/${id}`).then((r) => r.json()),
})
```

### `reducer`

Differently from the main effect mutations doens't came with a default reducer
and related state.
You can anyway attach a reducer to a mutation using the `reducer` option in
the mutation config.
The main point to note is that when you write a reducer for a mutation
the same action types of [standard reducer](reducer.md) are dispatched.
Specifically this mean that you can write generic and reusable reducer
for you muation!
For example write a mutation reducer to track a loading/error state at time,
this is true for scenarios like submit a form or when you single interaction
at time:

```js
import { rj, PENDING, SUCCESS, FAILURE } from 'react-rocketjump'

function singleMutationReducer(
  state = { pending: false, error: null },
  action
) {
  switch (action.type) {
    case PENDING:
      return {
        ...state,
        error: null,
        pending: true,
      }
    case FAILURE:
      return {
        ...state,
        error: action.payload,
        pending: false,
      }
    case SUCCESS:
      return {
        ...state,
        pending: false,
      }
    default:
      return state
  }
}

const ProductDetailState = rj({
  mutations: {
    updateProduct: {
      // ...
      reducer: singleMutationReducer,
    },
  },
  // ...
})
```

### `effectCaller`

The [effect caller](effect_caller.md) of mutation effect, if you don't specify
them is inherit from `effectCaller` defined in RocketJump configuration.
If you provide the `effectCaller` on mutation config mutation use the effect caller
you provide (also applies to `'configured'`).
If you want not to have any effect caller on a specific mutation you can pass
`false`.

### `takeEffect`

The (take effect)[side_effects.md] of the mutation side effect, works exactly
as RocketJump main take effect the only difference is that
the default value is `'every`' rather than `'latest'`. <br />
This decision was made because tipically you want track **every** effect result
of mutations effect instead of the latest.

## Consume mutation state

As explained in the other parts of the doc, the default state computed from
an RjObject is the root state.
So to consume the mutation state you should use [computed](computed_state_selectors.md)
o rely on selection argument i the [consuming api](consume_rj_objects.md).

An example with computed used the previous `ProductDetailState` example:

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const ProductDetailState = rj({
  mutations: {
    updateProduct: {
      // ...
    },
  },
  // ...
  computed: {
    product: 'getData',
    updating: (state) => state.mutations.updateProduct.pending,
  },
})

function ProductDetail() {
  const [{ product, updating }, { updateProduct }] = useRunRj(
    ProductDetailState
  )
  return (
    <div>
      <form>
        {/* an awesome product form */}
        <button disbaled={updating} type="submit">
          Update
        </button>
      </form>
    </div>
  )
}
```

The same example using `selectState` with `useRunRj`.

```jsx
import { rj, useRunRj } from 'react-rocketjump'

const ProductDetailState = rj({
  mutations: {
    updateProduct: {
      // ...
    },
  },
})

function ProductDetail() {
  const [{ product, updating }, { updateProduct }] = useRunRj(
    ProductDetailState,
    (state, { getData }) => ({
      product: getData(state),
      updating: sate.mutations.updateProduct.pending,
    })
  )
  return (
    <div>
      <form>
        {/* an awesome product form */}
        <button disbaled={updating} type="submit">
          Update
        </button>
      </form>
    </div>
  )
}
```

## Mutations helpers

State and updater are handled for you by RocketJumo as you can see, but mutations
are still implemented on top or RocketJump ecosystem, so the action dispacthed
on reducer still available to all reducers.<br />
Most of the time you are good with `reducer` and `updater` config on mutation
but if you need you can intercept the action dispatched by mutations and do what you want.

To help with this cases RocketJump expose two helpers:

The `makeMutationType` function to make an action type for give mutation name:

<!-- prettier-ignore -->
```ts
(mutationName: string, subType?: string) => string
```

Usage:

```js
import { makeMutationType, SUCCESS } from 'react-rocketjump'

const type = makeMutationType('updateUser', SUCCESS)
```

The `subType` is usally one of RocketJump core action types such
**SUCCESS**, **FAILURE**, **PENDING** etc..

And the `matchMutationType` function:

<!-- prettier-ignore -->
```ts
(
  type: string,
  matchName?: string | string[],
  matchSubType?: string | string[]
) => [string, string] | null
```

Usage:

```js
import { matchMutationType, SUCCESS } from 'react-rocketjump'

function reducer(state, action) {
  const match = matchMutationType(action.type)
  // for example if the type came from
  // makeMutationType('updateUser', SUCCESS)
  // the match will be
  // ['updateUser', 'SUCCESS']

  if (matchMutationType(action.type)) {
    // Match all mutations
  }

  if (matchMutationType(action.type, 'updateUser')) {
    // Match all "updateUser" mutations
  }

  if (matchMutationType(action.type, 'updateUser', SUCCESS)) {
    // Match all "updateUser" SUCCESS mutations
  }

  if (matchMutationType(action.type, '*', SUCCESS)) {
    // Match all SUCCESS mutations
  }

  if (
    matchMutationType(
      action.type,
      ['updateUser', 'resetStore'],
      [SUCCESS, FAILURE]
    )
  ) {
    // Match SUCCESS or FAILURE of mutations updateUser or resetStore
  }
}
const type = makeMutationType('updateUser', SUCCESS)
```

## Standard mutations

RocketJump provides some utilities to setup sensible defaults on _takeEffect_ and _reducer_ for the most common cases.

### Single mutation

This options set is thought for mutations that have no overlapping or concurrent runs. A common use case, for instance, is a form submission.

This preset sets _takeEffect_ to _exhaust_ and configures the reducer to mantain a state with the following shape:

```js
{
    pending: bool,  // is the mutation running?
    error: any      // rejection value of last failing run
}
```

You can apply it to a mutation like this

```js
const TodosStateRj = rj({
  effect: () => fetch(`/user`).then((r) => r.json()),
  mutations: {
    updateUserProfile: rj.mutation.single({
      // takeEffect and reducer are injected for you
      effect: (newProfile) =>
        fetch(`/user`, {
          method: 'PATCH',
          body: JSON.stringify(newProfile),
        }).then((r) => r.json()),
      updater: 'updateData',
    }),
  },
})
```

### Multiple mutation

This option set is designed for mutations that have multiple concurrent runs. Furthermore, it applies a grouping logic: runs belonging to the same group cannot be parallel and only one run per group can be active at a time.

The application of this preset requires the user to define a key derivation function, that is a function that computes a key from the params fed into the mutation call. Runs with the same key are inserted in the same group, with the logic stated above.

This preset sets _takeEffect_ to _groupByExhaust_, and the reducer is configured to mantain a state with the following shape:

```ts
{
  pendings: {
    [key]: true | undefined,
  },
  errors: {
    [key]: any | undefined
  }
}
```

You can apply it to a mutation like this

```js
const TodosState = rj({
  mutations: {
    toggleTodo: rj.mutation.multi(
      (todo) => todo.id, // Key derivation function
      {
        effect: (todo) =>
          fetch(`/todos/${todo.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ done: !todo.done }),
          }).then((r) => r.json()),
        updater: (state, updatedTodo) => ({
          ...state,
          data: state.data.map((todo) =>
            todo.id === updatedTodo ? updatedTodo : todo
          ),
        }),
      }
    ),
  },
  effect: () => fetch(`/todos`).then((r) => r.json()),
})
```

## Optimistic mutations

When you trigger a mutation you need to wait the effect result to complete to
actually see the changes reflet in your UI.<br />
In some cases you want to optimisic update your state immediatly in response of
user interaction and eventually rollback the update in case of mutation failure,
this is when optimistic mutation come in rescue!

### When to use optimistic mutation

This is up to the programmer but in general you should use optmistic mutation
when you can desume the mutation effect result from its inputs.
For example an API that toggle a todo is a good candidate to an optimistic
mutation while an API that add a new todo with a new id to your todos is less
a good candidate.

### How to use optimistic mutation

To start using optmistic mutation you should provide the `optimisticResult`
option to your mutation config.

The `optimisticResult` function will be called with your params (as your effect)
and the return value will be passed to the updater to update your root state.

If your mutation **SUCCESS** RocketJump will commit your state and re-running
your updater ussing the effect result as a normal mutation does.

Otherwise if your mutation **FAILURE** RocketJump roll back your state
and unapply the `optimisticResult`.

:::note
All action dispatched between the run and mutation failure are not lost
are re-applied to your state without the optimistic result. <br />
This is possible cause redcuer are pure functions.
:::

Heres to you a simple optimistic mutation example:

```js
import { rj } from 'react-rocketjump'

const ProductDetailState = rj({
  mutations: {
    updateProduct: {
      effect: (product) =>
        fetch(`api/product/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }).then((r) => r.json()),
      // This works if server returns the same product object we pass to it
      optimisticResult: (product) => product,
      updater: 'updateData',
    },
  },
  effect: (id) => fetch(`/api/product/${id}`).then((r) => r.json()),
})
```

Sometimes you need to distinguish between an optmisitc update and an update from **SUCCESS** if you provide the `optimisticUpdater` key in your mutation config the `optimisticUpdater` is used to perform the optmistic update an the `updater` to perform the update when commit success.

If your provided **ONLY** `optimisticUpdater` the success commit is skipped and used current root state,
this is useful for response as 204 No Content style where you can ignore the success
and skip an-extra update to your state an save a React render.

### Write consistent optmistic mutations

Since RocketJump re-apply your actions in case of failure if your effect
calculate the response using the remote "state" such as a databse you should
prefer to write your update logic in your updater rather then in optimisti result.

Ok, let's clarify the concept with a real example. Imaging having an api
called `/increment` that increments a remote counter.

```sh
POST /increment
1

POST /increment
2

POST /increment
3
```

If you write an updater like this:

```js
const AwseomeCounter = rj({
  mutations: {
    // ...
    increment: {
      effect: (counter) =>
        fetch(`/increment`, {
          method: 'POST',
        }).then((r) => r.json()),
      // This works if server returns the same product object we pass to it
      optimisticResult: (counter) => counter + 1,
      updater: 'updateData',
    },
  },
  // ...
})
```

You call them:

```js
function MyCounter() {
  const [{ data: counter }, { increment }] = useRunRj(AwseomeCounter)

  function handleIcrement() {
    increment(counter)
  }
  // ...
}
```

Imaging that you call `handleIcrement` three times and the second time it's fail.
When RocketJump re-apply the actions the last action will be called with the
`2` value optimistic updater make it `3` and the state it's update with the `3` value.

Now if you move the logic inside the `optimisticUpdater` instad:

```js
const AwseomeCounter = rj({
  mutations: {
    // ...
    increment: {
      effect: () =>
        fetch(`/increment`, {
          method: 'POST',
        }).then((r) => r.json()),
      // No-op in this specific case but required to mark them as optmistic
      optimisticResult: () => {},
      optimistiUpdater: (state) => ({
        ...state,
        data: state.data + 1,
      }),
      // In this case we can remove the updater as an optimization
      // Can still useful if, for example, another user can icrement the same
      // counter this decision is always related to your use case.
      // updater: 'updateData',
    },
  },
  // ...
})
```

Now if the second time the increment fails RocketJump re-apply the actions
to your state and you see the correct value of `2` in sync with your server!
