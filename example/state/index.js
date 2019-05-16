import request from 'superagent'
import { rj } from 'react-rocketjump'

export const friendsState = rj(
  // () => request.get(`http://localhost:3004/friends`).then(({ body }) => body)
  () => new Promise(resolve => {
    setTimeout(() => {
      console.log('SERVER RESOLVE!')
      resolve([ {name:'Giova',id:23} ])
    }, 2000)
  })
)
