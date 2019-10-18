import React, { useState } from 'react'
import { useRunRj } from 'react-rocketjump'
import { API_URL, TodosListState, Socio } from './localstate'

export default function NewTodo({ adding, onSubmit }) {
  const [title, setTitle] = useState('')

  const submitTodo = e => {
    e.preventDefault()
    onSubmit({ title: title, done: false })
    setTitle('')
  }
  // useRunRj(Socio)

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
