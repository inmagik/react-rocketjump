import { rj, makeAction, SUCCESS } from 'react-rocketjump'
import rjDebounce from 'react-rocketjump/plugins/debounce'
import request from 'superagent'
import { ajax } from 'rxjs/ajax'

console.log('A C T I O N', SUCCESS)

const GangRj = rj({
  effect: () => Promise.resolve(23),
  actions: () => ({
    giova: n => makeAction('GIOVA', n),
  }),
})

console.log('U.u', GangRj.actionCreators.run(23).withMeta({ g: 2 }))

// function authCaller(apiCall, ...args) {
//   const o = apiCall(...args)
//   // console.log(isObservable(new Promise(resolve => {})))
//   return o.pipe(
//     catchError(error => {
//       console.log('~', error)
//       return apiCall('GUAKAMOLE!')
//       // return of([{ id: 23, name: 'SEEEECRET' }])
//     })
//   )
// }

function authCaller(apiFn, ...args) {
  return apiFn('~T0K3N~')(...args)
}

const API_URL = 'http://localhost:3004'

const rjEasterEgg = rj({
  effectCaller: (fnCall, ...args) =>
    fnCall(...args).then(friends => {
      return friends.concat({
        id: 7777,
        name: 'MissinHo',
      })
    }),
})
const rjBody = rj({
  effectCaller: (fnCall, ...args) => fnCall(...args).then(({ body }) => body),
})

export const FriendsState = rj(rjEasterEgg, rjBody, rjDebounce(200), {
  effect: t => query => {
    // if (query.indexOf('x') !== -1) {
    //   return ajax.getJSON(`${API_URL}/ERROR`)
    // }
    return request.get(`${API_URL}/friends`).query({ q: query, sacroToken: t })
    // .then(({ body }) => body)
    // return ajax.getJSON(`${API_URL}/friends?q=${query}`)
  },
  effectCaller: authCaller,
})
