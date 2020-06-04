import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjCache, { getInMemoryStoreState } from 'react-rocketjump/plugins/cache'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

console.log('OoO', getInMemoryStoreState(), 'OoO')

export const TodosListState = rj(
  rjPlainList(),
  rjCache({
    ns: 'todos',
    size: 50,
  }),
  {
    effect: (q = '') =>
      request.get(`${API_URL}/todos?q=${q}`, {}).then(({ body }) => body),
    mutations: {
      addStupidTodo: rj.mutation.single({
        effect: todo =>
          request
            .post(`${API_URL}/todos`)
            .send(todo)
            .then(({ body }) => body),
        updater: 'insertItem',
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
      error23: 'getError',
      todos: 'getData',
      loading: 'isPending',
    },
    name: 'MaTodos',
  }
)
