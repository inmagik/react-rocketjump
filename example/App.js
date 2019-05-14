import React, { useEffect } from 'react'
import { useRj } from 'react-rocketjump'
import { friendsState } from './state'

export default function App() {
  const [
    { data: friends, pending: loading },
    { run: loadFriends }
  ] = useRj(friendsState)

  useEffect(() => {
    loadFriends()
  }, [loadFriends])


  return (
    <div>
      {loading && <div>Waiting ma friends....</div>}
      {friends && friends.map(friend => (
        <div key={friend.id}>
          <h3>{friend.name}</h3>
        </div>
      ))}
    </div>
  )
}
