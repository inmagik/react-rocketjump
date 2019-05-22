import request from 'superagent'
import { rj } from 'react-rocketjump'

const rj1 = rj(
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => ({
      g1: () => ({ type: 'CHARLIE' }),
    }),
  }),
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => ({
      g2: () => ({ type: 'CHARLIE' }),
    }),
  }),
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => ({
      g3: () => ({ type: 'CHARLIE' }),
    }),
  }),
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => ({
      g233: () => ({ type: 'CHARLIE' }),
    }),
  }),
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => ({
      g22: () => ({ type: 'CHARLIE' }),
    }),
  }),
  rj({
    composeReducer: (prevState = { giova: 23 }) => prevState,
    actions: () => {
      // console.log('Creazy boy')
      return {
        g44: () => ({ type: 'CHARLIE' }),
      }
    },
  }),
  // () => request.get(`http://localhost:3004/friends`).then(({ body }) => body)
)

export const friendsState = rj(
  rj1,
  rj1, rj1, rj1,
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1), rj1, rj(rj(rj(rj1)))),
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1)),
  rj(rj(rj1, rj1), rj(rj1), rj1, rj(rj(rj(rj1)))),
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1)),
  rj(rj(rj1, rj1), rj(rj1), rj1, rj(rj(rj(rj1)))),
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1)),
  rj(rj(rj1, rj1), rj(rj1), rj1, rj(rj(rj(rj1)))),
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1)),
  rj(rj(rj1, rj1), rj(rj1), rj1, rj(rj(rj(rj1)))),
  rj(rj1),
  rj(rj(rj1, rj1), rj(rj1)),
  () => new Promise(resolve => {
    setTimeout(() => {
      console.log('SERVER RESOLVE!')
      resolve([ {name:'Giova',id:23} ])
    }, 500)
  })
)
