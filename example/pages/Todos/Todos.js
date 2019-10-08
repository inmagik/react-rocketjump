import React, { useEffect, useState } from 'react'
import Todo from './Todo'
import { useRunRj, useRj, ConfigureRj } from 'react-rocketjump'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

function useXD() {
  return useRunRj(TodosListState)
}
export default function AppTodos() {
  const [count, setCount] = useState(0)
  function callMaMen(call, ...params) {
    console.log('Call 4', count)
    return call(...params)
  }
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)} style={{ marginTop: 40 }}>
        {count}
      </button>
      <ConfigureRj effectCaller={callMaMen}>
        <Todos />
      </ConfigureRj>
    </div>
  )
}

export function Todos() {
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo, run },
  ] = useRj(TodosListState)
  // addStupidTodo({})
  const [count, setCount] = useState(0)
  useEffect(() => {
    run()
  }, [])
  console.log('Render')

  return (
    <div className="todos">
      <h1>Ma REST Todos</h1>
      <button onClick={() => setCount(c => c + 1)} style={{ marginTop: 40 }}>
        {count}
      </button>
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
