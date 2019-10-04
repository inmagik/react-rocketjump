import { rj } from 'react-rocketjump'
import { tap } from 'rxjs/operators'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

// const rjPlainList2 = rj({
//   // finalizeExport:
// })

export const TodosListState = rj(rjPlainList(), {
  effectCaller: rj.configured(),
  effects: {
    '': {
      gesture: 'lastest',
      fn: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
    },
    ALL_NIGHT: {
      gesture: 'lastest',
      fn: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
    },
  },
  effectPipeline: a => {
    return a.pipe(tap(a => console.log('Y shit', a)))
  },
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
    todos: 'getData',
    loading: 'isPending',
  },
  name: 'MaTodos',
})
