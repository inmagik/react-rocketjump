import React, { useEffect, useState } from 'react'
import { useRj } from 'react-rocketjump'
import { friendsState } from './state'


export default function App() {
  const [show, setShow] = useState(true)
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <Friends />}
    </div>
  )
}

function Friends() {
  const [
    { data: friends, pending: loading },
    { run: loadFriends }
  ] = useRj(friendsState)

  const [msg, setMsg] = useState(null)

  console.log('RENDER', friends)
  useEffect(() => {
    loadFriends.onSuccess(freshFriends => {
      console.log('Got ma friend!', freshFriends)
      setMsg('Got FRIENDS!')
    }).run()
  }, [loadFriends])


  return (
    <div>
      <div>{msg}</div>
      {loading && <div>Waiting ma friends....</div>}
      {friends && friends.map(friend => (
        <div key={friend.id}>
          <h3>{friend.name}</h3>
        </div>
      ))}
    </div>
  )
}
