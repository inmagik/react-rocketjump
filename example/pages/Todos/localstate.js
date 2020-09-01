import { rj } from 'react-rocketjump'
import { ajax } from 'rxjs/ajax'
import { rjCache } from 'react-rocketjump/plugins/cache/new'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

export const TodosListState = rj(
  rjCache({
    ns: 'Todos',
    cacheTime: 0,
    staleTime: 0,
    // cacheTime: 1000 * 90,
  }),
  rjPlainList(),
  {
    effect: (q = '') => ajax.getJSON(`${API_URL}/todos?q=${q}`),
    mutations: {
      addStupidTodo: rj.mutation.single({
        effect: todo =>
          request
            .post(`${API_URL}/todos`)
            .send(todo)
            .then(({ body }) => body),
        updater: s => s, //'insertItem',
        // updater: 'insertItem',
      }),
      removeTodo: rj.mutation.multi(todo => todo.id, {
        effect: todo =>
          request.delete(`${API_URL}/todos/${todo.id}`).then(() => todo),
        updater: 'deleteItem',
      }),
      toggleTodo: rj.mutation.multi(todo => todo.id, {
        effect: todo =>
          request
            .put(`${API_URL}/todos/${todo.id}`)
            .send({
              ...todo,
              done: !todo.done,
            })
            .then(({ body }) => body),
        updater: 'updateItem',
      }),
    },
    computed: {
      adding: '@mutation.addStupidTodo.pending',
      deleting: '@mutation.removeTodo.pendings',
      updating: '@mutation.toggleTodo.pendings',
      todos: 'getData',
      loading: 'isPending',
    },
    name: 'MaTodos',
  }
)
