import React, { useEffect } from 'react'
import Todo from './Todo'
import { useRunRj } from 'react-rocketjump'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

export default function Todos() {
  const [
    { todos, loading },
    { addStupidTodo, removeTodo, toggleTodo },
  ] = useRunRj(TodosListState)

  return (
    <div className="todos">
      <h1>Ma REST Todos</h1>
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
      {todos && <NewTodo onSubmit={addStupidTodo} adding={false} />}
      <div className="todo-list">
        {todos &&
          todos.map(todo => (
            <Todo
              // saving={updating[todo.id] || deleting[todo.id]}
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
