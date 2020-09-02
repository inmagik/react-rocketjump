import React, { useState } from 'react'
import { useRunRj, deps } from 'react-rocketjump'
import { UsersState } from './localstate'

export default function DataTable() {
  const [inputUsername, setInputUsername] = useState('')

  const [{ list: users }] = useRunRj(
    UsersState,
    [
      deps.maybeNull(inputUsername).withMeta({ debounced: true }),
      deps.withMeta(undefined, { debounced: false }),
    ],
    false
  )

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1>
          Ma Stupid DataTable{' '}
          <span role="img" aria-label="spiral-notepad">
            🗒️
          </span>
        </h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ paddingTop: 20 }}>
          <input
            type="text"
            placeholder="Search for users"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          {users && (
            <table border={1} style={{ marginTop: 20 }}>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
