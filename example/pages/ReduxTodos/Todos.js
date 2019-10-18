import React from 'react'
// import store from './store'
import Todo from './Todo'
// import { useRunRj } from 'react-rocketjump'
import { useRunRj } from 'react-rocketjump/plugins/redux'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

export default function ReduxTodos() {
  return (
    <>
      <Todos />
      <Todos />
    </>
  )
}

function Todos() {
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo },
  ] = useRunRj(TodosListState)

  return (
    <div className="todos">
      <h1>Ma Redux Todos</h1>
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
