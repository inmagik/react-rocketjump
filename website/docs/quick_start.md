---
id: quick_start
title: Quick Start
sidebar_label: Quick Start
slug: /quick-start
---

This example show how can you quickly built a classic (async) Todo App using RocketJump
and [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```jsx
import { rj, useRunRj } from 'react-rocketjump'

export const TodosState = rj({
  effect: () => fetch('api/todos').then((r) => r.json()),
  mutations: {
    addTodo: {
      effect: (todo) =>
        method: 'POST',
        fetch('api/todos', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todo),
        }).then((r) => r.json()),
      updater: (state, newTodo) => ({
        ...state,
        data: state.data.concat(newTodo),
      }),
    },
  },
})

function Todos() {
  const [{ data }, { addTodo }] = useRunRj(TodosState)

  return (
    <div>
      {data && (
        <ul>
          {data.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          addTodo({
            title: 'Learn RocketJump',
          })
        }}
      >
        Add Todo
      </button>
    </div>
  )
}
```

In the next sections of the documention we cover all the concepts you see this example.
