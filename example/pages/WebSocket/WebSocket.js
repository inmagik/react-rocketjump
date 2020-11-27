import React, { useState } from 'react'
import { useRj } from 'react-rocketjump'
import { RocketWs } from './localstate'

export default function WebSocket() {
  const [{ data, isWsOpen }, { open, close, send }] = useRj(RocketWs)

  const [text, setText] = useState('')

  return (
    <div>
      <h1>RJ + WebSocket = ❤️</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setText('')
          send(text)
        }}
      >
        <div>
          <label>MESSAGE WS</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={!isWsOpen}>
            SEND
          </button>
        </div>
      </form>
      <div>
        <button disabled={isWsOpen} onClick={() => open()}>
          CONNECT
        </button>
        <button disabled={!isWsOpen} onClick={() => close()}>
          DISCONNECT
        </button>
      </div>

      <div>
        <h3>LOG</h3>
        <div>{data && data.map((msg, i) => <div key={i}>{msg}</div>)}</div>
      </div>
    </div>
  )
}
