import React, { useState, unstable_useTransition, Suspense } from 'react'
import Todo from './Todo'
import { useRunRj } from 'react-rocketjump'
import {
  useRjCache,
  useRunRjCache,
  RjCacheError,
} from 'react-rocketjump/plugins/cache'
import { API_URL, TodosListState } from './localstate'
import NewTodo from './NewTodo'
import './Todos.css'

function Todos() {
  const [query, setQuery] = useState('')
  // const [myQuery, setMyQuery] = useState('')
  const [
    { todos, loading, adding, deleting, updating },
    { addStupidTodo, removeTodo, toggleTodo },
  ] = useRunRjCache(TodosListState, [query, 23], {
    cache: true,
    suspense: true,
    suspendOnNewEffect: false,
  })

  // const [startTransition, isPending] = unstable_useTransition({
  //   timeoutMs: 3000,
  // })

  return (
    <div className="todos">
      <h1>Ma REST Todos</h1>
      <input
        type="text"
        onChange={e => {
          const q = e.target.value
          setQuery(q)
          // startTransition(() => {
          //   setMyQuery(q)
          // })
        }}
        value={query}
      />
      <h3>
        <a href={`${API_URL}/todos`}>
          {API_URL}
          {'/todos'}
        </a>
      </h3>
      {/* {isPending && (
        <div>
          Loading <b>Y</b> todos...
        </div>
      )} */}
      {todos && (
        <NewTodo
          onSubmit={todo => {
            addStupidTodo
              .onSuccess(todo => {
                console.log('Todo Added!', todo)
                // resetCache()
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentWillUnmount() {
    if (this.state.error && this.state.error.clearRjError) {
      this.state.error.clearRjError()
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
export default function TodosApp() {
  return (
    <ErrorBoundary fallback={<h1 style={{ color: 'red' }}>FUCK</h1>}>
      <Suspense fallback={<h1>LOADING T0D0S</h1>}>
        <Todos />
      </Suspense>
    </ErrorBoundary>
  )
}
