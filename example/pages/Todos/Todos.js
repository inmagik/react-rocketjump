import React from 'react'
import Todo from './Todo'
import { useRunRj, deps } from 'react-rocketjump'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

export default function Todos() {
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo, wsSend, clean, run },
  ] = useRunRj(TodosListState)

  return (
    <div className="todos">
      <h1>Ma REST Todos</h1>
      <div>
        <div className="action-button-rj">
          <button onClick={() => clean()}>CLEAN</button>
        </div>
        <div className="action-button-rj">
          <button onClick={() => run()}>RUN</button>
        </div>
        <div className="action-button-rj">
          <button onClick={() => wsSend('DRAGO')}>@WS/SEND</button>
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
              // saving={updating[todo.id] || deleting[todo.id]}
              saving={deleting[todo.id]}
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
