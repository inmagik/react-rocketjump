import React, { useState } from 'react'
import { useRunRj, deps, ConfigureRj } from 'react-rocketjump'
import {
  GhUserState,
  GhUserStarsState,
  GhUserFollowersState,
} from './localstate'
import TopBar from './TopBar'
import './GhProfile.css'

export default function GhProfileApp({ location }) {
  const matchToken = location.search.match(/token=([^&]+)/)
  let token
  if (matchToken) {
    token = matchToken[1]
  }

  const caller = (fn, ...params) => fn(token, ...params)

  return (
    <div className="Gh-App">
      <TopBar token={token} />
      <ConfigureRj effectCaller={caller}>
        <GhProfile />
      </ConfigureRj>
    </div>
  )
}

function GhProfile() {
  const [username, setUsername] = useState('gffuma')
  const [inputUsername, setInputUsername] = useState('gffuma')

  const [{ data: user }] = useRunRj(GhUserState, [username])
  const maybeTheLogin = deps.maybeGet(user, 'login')
  const [{ data: stars }] = useRunRj(GhUserStarsState, [maybeTheLogin])
  const [{ data: followers }] = useRunRj(GhUserFollowersState, [maybeTheLogin])

  return (
    <div className="Gh-Profile">
      <form
        className="Gh-SearchBox"
        onSubmit={(e) => {
          e.preventDefault()
          if (inputUsername !== '') {
            setUsername(inputUsername)
          }
        }}
      >
        <input
          placeholder="Hit enter to search"
          type="text"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
      </form>

      {user && (
        <div className="Gh-ProfileInfo">
          <div className="Gh-ProfileBox">
            <h1>
              {user.login}
              {"'s profile"}
            </h1>
            <img
              className="Gh-avatar"
              src={user.avatar_url}
              alt={`${user.login} avatar`}
            />
          </div>

          {followers && (
            <div className="Gh-Followers">
              <h2>Followers</h2>
              {followers.map((follower) => (
                <div key={follower.id}>{follower.login}</div>
              ))}
            </div>
          )}
          {stars && (
            <div className="Gh-Stars">
              <h2>Stars</h2>
              {stars.map((star) => (
                <div key={star.id}>{star.full_name}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
