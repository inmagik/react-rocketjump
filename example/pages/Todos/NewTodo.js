import React, { useState } from 'react'

export default function NewTodo({ adding, onSubmit }) {
  const [title, setTitle] = useState('')

  const submitTodo = e => {
    e.preventDefault()
    onSubmit({ title: title, done: false })
    setTitle('')
  }

  return (
    <form className="new-todo" onSubmit={submitTodo}>
      <input
        style={adding ? { border: '1px solid purple' } : undefined}
        disabled={adding}
        placeholder="What to do ma friend?"
        value={title}
        type="text"
        onChange={e => setTitle(e.target.value)}
      />
    </form>
  )
}
