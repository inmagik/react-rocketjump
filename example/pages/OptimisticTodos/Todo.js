import React from 'react'
import classNames from 'classnames'

const Todo = ({ todo, saving = false, onToggle, onRemove, onIncrement }) => (
  <div
    className={classNames('todo', {
      'todo-saving': saving,
      'todo-done': todo.done,
    })}
  >
    <div style={{ display: 'flex' }}>
      <div className="todo-circle" onClick={() => onToggle(todo)}>
        {todo.done ? '√' : ''}
      </div>
      <div className="todo-title">{todo.title}</div>
    </div>
    <button className="todo-increment" onClick={() => onIncrement(todo)}>
      {todo.count}
      <span role="img" aria-label="ping-pong">
        🏓
      </span>
    </button>
    <button className="todo-delete" onClick={() => onRemove(todo)}>
      X
    </button>
  </div>
)

export default Todo
