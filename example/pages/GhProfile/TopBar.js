import React from 'react'

export default function TopBar({ token }) {
  return (
    <div className="Gh-TopBar">
      <h1>Ma GitHub Card</h1>
      <div className="Gh-Token">
        {!token && (
          <small>
            put <i>?token=OAUTH-TOKEN</i> in the url to skip gh's api rate
            limit.
          </small>
        )}
        {token && (
          <small>
            OAUTH TOKEN: <b>{token}</b>
          </small>
        )}
      </div>
    </div>
  )
}
