import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

function isMyLuckyDay(chance) {
  return 1 + Math.floor(Math.random() * 100) <= chance ? '' : '~404~'
}

export const TodosListState = rj(rjPlainList(), {
  effect: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
  mutations: {
    addStupidTodo: {
      optimisticResult: (todo) => ({
        ...todo,
        id: new Date().getTime(),
      }),
      effect: (todo, chance) =>
        request
          .post(`${API_URL}/todos${isMyLuckyDay(chance)}`)
          .send(todo)
          .then(({ body }) => body),
      updater: 'insertItem',
    },
    removeTodo: {
      optimisticResult: (todo) => todo,
      effect: (todo, chance) =>
        request
          .delete(`${API_URL}/todos/${todo.id}${isMyLuckyDay(chance)}`)
          .then(() => todo),
      updater: 'deleteItem',
    },
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
    toggleTodo: {
      optimisticResult: (todo) => ({
        ...todo,
        done: !todo.done,
      }),
      effect: (todo, chance) =>
        request
          .put(`${API_URL}/todos/${todo.id}${isMyLuckyDay(chance)}`)
          .send({
            ...todo,
            done: !todo.done,
          })
          .then(({ body }) => body),
      updater: 'updateItem',
    },
  },
  computed: {
    todos: 'getData',
    loading: 'isPending',
  },
  name: 'MaTodos',
})
