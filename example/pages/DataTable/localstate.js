import { rj } from 'react-rocketjump'
import rjDebounce from 'react-rocketjump/plugins/debounce'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import { ajax } from 'rxjs/ajax'

export const API_URL = 'http://localhost:9001'

export const UsersState = rj(
  rjPlainList(),
  rjDebounce({
    time: 200,
  }),
  {
    name: 'Evil_System_Users',
    effectCaller: rj.configured(),
    effect: (name = '') => ajax.getJSON(`${API_URL}/users?name_like=${name}`),
  }
)
