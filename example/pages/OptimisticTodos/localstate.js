import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

function isMyLuckyDay(chance) {
  return 1 + Math.floor(Math.random() * chance) === 1 ? '' : '~404~'
}

export const TodosListState = rj(rjPlainList(), {
  effect: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
  mutations: {
    addStupidTodo: rj.mutation.single({
      effect: (todo) =>
        request
          .post(`${API_URL}/todos`)
          .send(todo)
          .then(({ body }) => body),
      updater: 'insertItem',
    }),
    removeTodo: rj.mutation.multi((todo) => todo.id, {
      effect: (todo) =>
        request.delete(`${API_URL}/todos/${todo.id}`).then(() => todo),
      updater: 'deleteItem',
    }),
    incrementTodo: {
      optimisticResult: (todo) => ({
        ...todo,
        count: todo.count + 1,
      }),
      effect: (todo, chance) =>
        request
          .put(`${API_URL}/todos/${todo.id}${isMyLuckyDay(chance)}`)
          .send({
            ...todo,
            count: todo.count + 1,
          })
          .then(({ body }) => body),
      updater: 'updateItem',
    },
    toggleTodo: rj.mutation.multi((todo) => todo.id, {
      effect: (todo, chance) =>
        request
          .put(`${API_URL}/todos/${todo.id}${isMyLuckyDay(chance)}`)
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
