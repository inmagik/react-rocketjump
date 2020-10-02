import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjMutationsPending from 'react-rocketjump/plugins/mutationsPending'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

export const TodosListState = rj(
  rjPlainList(),
  rjMutationsPending({
    track: ['removeTodo', 'toggleTodo'],
  }),
  {
    effect: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
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
      busy: 'anyMutationPending',
      adding: '@mutation.addStupidTodo.pending',
      deleting: '@mutation.removeTodo.pendings',
      updating: '@mutation.toggleTodo.pendings',
      todos: 'getData',
      loading: 'isPending',
    },
    name: 'MaTodos',
  }
)
