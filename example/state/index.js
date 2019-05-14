import request from 'superagent'
import { rj } from 'react-rocketjump'

export const friendsState = rj(
  () => request.get(`http://localhost:3004/friends`).then(({ body }) => body)
)
