import { rj } from 'react-rocketjump'
import rjDebounce from 'react-rocketjump/plugins/debounce'
import { ajax } from 'rxjs/ajax'

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

const API_URL = 'http://localhost:3004'

export const FriendsState = rj(rjDebounce(200), {
  effect: query => {
    // if (query.indexOf('x') !== -1) {
    //   return ajax.getJSON(`${API_URL}/ERROR`)
    // }
    return ajax.getJSON(`${API_URL}/friends?q=${query}`)
  },
  // effectCaller: authCaller,
})
