import { rj } from 'react-rocketjump'
import rjCache from 'react-rocketjump/plugins/cache'
import { ajax } from 'rxjs/ajax'

const API_URL = 'https://api.github.com'

export const GhUserState = rj(
  rjCache({
    ns: 'ghusers',
    size: 1000,
  }),
  {
    name: 'GitHub User',
    effectCaller: rj.configured(),
    effect: (token, username) =>
      ajax.getJSON(`${API_URL}/users/${username}`, {
        Authorization: token ? `token ${token}` : undefined,
      }),
  }
)

export const GhUserStarsState = rj(
  rjCache({
    ns: 'ghuser-stars',
    size: 100,
  }),
  {
    name: 'GitHub User Stars',
    effect: (username) => ajax.getJSON(`${API_URL}/users/${username}/starred`),
  }
)

export const GhUserFollowersState = rj(
  rjCache({
    ns: 'ghuser-followers',
    size: 100,
  }),
  {
    name: 'GitHub User Followers',
    effect: (username) =>
      ajax.getJSON(`${API_URL}/users/${username}/followers`),
  }
)
