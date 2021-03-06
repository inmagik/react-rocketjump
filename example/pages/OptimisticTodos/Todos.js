import React, { useState, useCallback } from 'react'
import Todo from './Todo'
import ErrorToast from './ErrorToast'
import { useRunRj } from 'react-rocketjump'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

export default function Todos() {
  const [
    { todos, loading },
    { addStupidTodo, removeTodo, toggleTodo, incrementTodo, clean, run },
  ] = useRunRj(TodosListState)

  const [errors, setErrors] = useState([])

  const [chance, setChance] = useState(100)

  const handleToggleTodo = useCallback(
    (todo) => {
      toggleTodo
        .onFailure((err) =>
          setErrors((errors) =>
            errors.concat({
              message: `${err.message} // Can't toggle ${todo.title}`,
            })
          )
        )
        .run(todo, chance)
    },
    [toggleTodo, chance]
  )

  const handleIncrementTodo = useCallback(
    (todo) => {
      incrementTodo
        .onFailure((err) =>
          setErrors((errors) =>
            errors.concat({
              message: `${err.message} // Can't increment ${todo.title} to ${
                todo.count + 1
              }`,
            })
          )
        )
        .run(todo, chance)
    },
    [incrementTodo, chance]
  )

  const handleRemoveTodo = useCallback(
    (todo) => {
      removeTodo
        .onFailure((err) =>
          setErrors((errors) =>
            errors.concat({
              message: `${err.message} // Can't rmove ${todo.title}`,
            })
          )
        )
        .run(todo, chance)
    },
    [removeTodo, chance]
  )

  return (
    <div className="todos optimistic-todos">
      <ErrorToast errors={errors} setErrors={setErrors} />
      <h1>
        Ma REST{' '}
        <span className="optimistic-todos-tagline">
          <i>Optimistic</i>{' '}
          <span role="img" aria-label="bring">
            ✨
          </span>
        </span>{' '}
        Todos
      </h1>
      <div className="optimistic-todos-header">
        <div>
          <div className="action-button-rj">
            <button onClick={() => clean()}>CLEAN</button>
          </div>
          <div className="action-button-rj">
            <button onClick={() => run()}>RUN</button>
          </div>
        </div>
        <div className="optmistic-hack-lucky">
          Success chance{' '}
          <input
            type="number"
            value={chance}
            onChange={(e) => setChance(e.target.value)}
          />
          {'%'}
        </div>
      </div>
      <h3>
        <a href={`${API_URL}/todos`}>
          {API_URL}
          {'/todos'}
        </a>
      </h3>
      {loading && (
        <div>
          Loading <b>Y</b> todos...
        </div>
      )}
      {todos && (
        <NewTodo
          onSubmit={(todo) => {
            addStupidTodo
              .onFailure((err) =>
                setErrors((errors) =>
                  errors.concat({
                    message: `${err.message} // Can't add ${todo.title}`,
                  })
                )
              )
              .onSuccess((todo) => {
                console.log('Todo Added!', todo)
              })
              .run(todo, chance)
          }}
        />
      )}
      <div className="todo-list">
        {todos &&
          todos.map((todo) => (
            <Todo
              onIncrement={handleIncrementTodo}
              onToggle={handleToggleTodo}
              onRemove={handleRemoveTodo}
              key={todo.id}
              todo={todo}
            />
          ))}
      </div>
    </div>
  )
}
