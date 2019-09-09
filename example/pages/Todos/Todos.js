import React, { useEffect } from 'react'
import Todo from './Todo'
import { useRunRj, useRj, rj } from 'react-rocketjump'
import rjLogger from 'react-rocketjump/logger'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

rjLogger()

export default function Todos() {
  const [
    { todos, loading },
    { addStupidTodo, removeTodo, toggleTodo, cleanShit },
  ] = useRunRj(TodosListState)

  const { pending: adding } = addStupidTodo.state()
  const { pendings: deleting } = removeTodo.state()
  const { pendings: updating } = toggleTodo.state()

  return (
    <div className="todos">
      <h1>Ma REST Todos</h1>
      <button onClick={() => cleanShit()}>Clean Shit</button>
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
          onSubmit={todo => {
            addStupidTodo
              .onSuccess(todo => {
                console.log('Todo Added!', todo)
              })
              .run(todo)
          }}
          adding={adding}
        />
      )}
      <div className="todo-list">
        {todos &&
          todos.map(todo => (
            <Todo
              saving={updating[todo.id] || deleting[todo.id]}
              onToggle={toggleTodo}
              onRemove={removeTodo}
              key={todo.id}
              todo={todo}
            />
          ))}
      </div>
    </div>
  )
}
