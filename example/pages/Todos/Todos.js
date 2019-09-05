import React, { useEffect } from 'react'
import Todo from './Todo'
import { useRunRj, useMutation, useRj, rj } from 'react-rocketjump'
import rjLogger from 'react-rocketjump/logger'
import { API_URL, TodosListState, Socio } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

rjLogger()

export default function Todos() {
  const [
    { todos, loading },
    { addStupidTodo, removeTodo, toggleTodo },
    // { addStupidTodo: { pending: adding } }
  ] = useRunRj(TodosListState)

  // const { loading: adding } = addStupidTodo.state()
  // console.log('RENDER', adding)
  // console.log(addStupidTodo)
  let adding = false
  // const addTodosState = addStupidTodo.current()
  // addStupidTodo.state = {}

  // trackMutationState(addStupidTodo)

  // const { pending: adding } = useMutation(addStupidTodo)
  // console.log('~', ss)
  // useRunRj(TodosListState)
  // useRunRj(Socio)
  // useRj(TodosListState)
  // let adding = false
  // console.log('Render', todos)

  // useEffect(() => {
  //   console.log('Run Effect 1')
  //   return () => console.log('Clear effect 1')
  // })
  //
  // useEffect(() => {
  //   console.log('Run Effect 2')
  //   return () => console.log('Clear effect 2')
  // })

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
