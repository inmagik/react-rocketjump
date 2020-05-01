import React, { useState, useCallback } from 'react'
import Todo from './Todo'
import { useRunRj } from 'react-rocketjump'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

export default function Todos() {
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo, incrementTodo, clean, run },
  ] = useRunRj(TodosListState)

  const [chance, setChance] = useState(1)

  const handleToggleTodo = useCallback(
    (todo) => {
      toggleTodo(todo, chance)
    },
    [toggleTodo, chance]
  )

  const handleIncrementTodo = useCallback(
    (todo) => {
      incrementTodo(todo, chance)
    },
    [incrementTodo, chance]
  )

  return (
    <div className="todos">
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
      <div className="optimistic-todos">
        <div>
          <div className="action-button-rj">
            <button onClick={() => clean()}>CLEAN</button>
          </div>
          <div className="action-button-rj">
            <button onClick={() => run()}>RUN</button>
          </div>
        </div>
        <div className="optmistic-hack-lucky">
          Success chance 1 /{' '}
          <input
            type="number"
            value={chance}
            onChange={(e) => setChance(e.target.value)}
          />
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
              .onSuccess((todo) => {
                console.log('Todo Added!', todo)
              })
              .run(todo)
          }}
          adding={adding}
        />
      )}
      <div className="todo-list">
        {todos &&
          todos.map((todo) => (
            <Todo
              saving={updating[todo.id] || deleting[todo.id]}
              onIncrement={handleIncrementTodo}
              onToggle={handleToggleTodo}
              onRemove={removeTodo}
              key={todo.id}
              todo={todo}
            />
          ))}
      </div>
    </div>
  )
}
