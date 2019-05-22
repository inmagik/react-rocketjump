import React, { useEffect, useState } from 'react'
import { useRj } from 'react-rocketjump'
import { friendsState } from './state'



const Shenron = () => (
  <div>
    <Friends />
  {/* {Array.apply(null, { length: 500 }).map((_, i) => (
    <Friends key={i} />
    //<div key={i}>{i}</div>
  ))} */}
  </div>
)

export default function App() {
  const [show, setShow] = useState(true)
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <Shenron />}
    </div>
  )
}
function noop() {

}
// console.time('noop')
// noop()
// console.timeEnd('noop')

function Friends() {
  // console.time('useRj')
  const [
    { data: friends, pending: loading },
    { run: loadFriends }
  ] = useRj(friendsState)
  // console.timeEnd('useRj')

  const [msg, setMsg] = useState(null)

  // console.log('RENDER', friends)
  useEffect(() => {
    loadFriends(msg)
  }, [loadFriends, msg])


  return (
    <div>
      o
      <input type='text' value={msg} onChange={e => setMsg(e.target.value)} />
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
