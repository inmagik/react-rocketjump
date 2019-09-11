import React, { useEffect } from 'react'
import Todo from './Todo'
import { useRunRj, useRj, rj, connectRj } from 'react-rocketjump'
import rjLogger from 'react-rocketjump/logger'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

rjLogger()

// todos, loading,
// run,
// addStupidTodo, removeTodo, toggleTodo, cleanShit,
// adding,
export default function Todos() {
  // useEffect(() => {
  //   run()
  // }, [run])
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo, cleanShit },
  ] = useRunRj(TodosListState)

  console.log(updating, deleting)
  // const { pending: adding } = addStupidTodo.state()
  // const { pendings: deleting } = removeTodo.state()
  // const { pendings: updating } = toggleTodo.state()

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

// root.getData()
// export default connectRj(TodosListState, (state, { getData, isPending, getRoot, getMutations }) => ({
//   loading: isPending(getRoot(state)),
//   todos: getData(getRoot(state)),
//   adding: getMutations(state, 'addStupidTodo').pending,
// }))(React.memo(Todos))
