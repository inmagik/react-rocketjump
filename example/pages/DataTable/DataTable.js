import React, { useState } from 'react'
import { useRunRj, deps, ConfigureRj } from 'react-rocketjump'
import { UsersState } from './localstate'

export default function DataTable() {
  const [inputUsername, setInputUsername] = useState('')
  const [count, setCount] = useState(0)

  const [{ list: users }] = useRunRj(
    UsersState,
    [
      deps.maybeNull(inputUsername).meta({ debounced: true }),
      //.meta({ debounced: inputUsername !== '' }),
      deps.meta(undefined, { debounced: false }),
      // count > 0 ? deps.meta(count, { append: true }) : undefined,
    ],
    false
  )

  return (
    <div style={{ paddingTop: 20 }}>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <input
        type="text"
        value={inputUsername}
        onChange={(e) => setInputUsername(e.target.value)}
      />
      {users && (
        <div>
          {users.map((user) => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      )}
    </div>
  )
}
