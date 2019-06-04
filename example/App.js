import React, { useEffect, useState } from 'react'
import { useRj } from 'react-rocketjump'
import { FriendsState } from './state'

export default function App() {
  const [search, setSearch] = useState('')
  const [{ data: friends }, { runDebounced: loadFriends, clean }] = useRj(FriendsState)

  useEffect(() => {
    loadFriends(search)
    loadFriends(search)
    loadFriends(search)
  }, [search, loadFriends])

  return (
    <div>

      <div>
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div>
        <button onClick={() => clean()}>X</button>
        {friends && friends.map(friend => (
          <div key={friend.id}>
            {friend.name}
          </div>
        ))}
      </div>

    </div>
  )
}
