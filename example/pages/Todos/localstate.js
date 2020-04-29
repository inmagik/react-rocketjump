import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjAjax from 'react-rocketjump/plugins/ajax'
import rjWs from 'react-rocketjump/plugins/ws'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

export const TodosListState = rj(
  rjPlainList(),
  rjAjax({
    baseUrl: API_URL,
  }),
  rjWs({
    url: ({ data }) => data && 'ws://echo.websocket.org',
    onMessage: (state, msg) => ({
      data: [
        {
          id: new Date().getTime() + String(Math.floor(Math.random() * 100)),
          title: msg,
        },
      ].concat(state.data),
    }),
  }),
  {
    // effect: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
    effect: () => '/todos',
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
      toggleTodo: rj.mutation.multi((todo) => todo.id, {
        effect: (todo) =>
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
