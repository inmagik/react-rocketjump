import { rj } from 'react-rocketjump'
import { tap } from 'rxjs/operators'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjAjax from 'react-rocketjump/plugins/ajax'
import rjWithRoutines from 'react-rocketjump/plugins/routines'
import request from 'superagent'

export const API_URL = 'http://localhost:9001'

const callToken = (call, ...args) => {
  console.log('Caller Token')
  const promise = call('X23X')(...args)
  console.log('Token Got', promise)
  return promise
}

rj
  .setGlobalRjs
  // rjAjax({
  //   baseUrl: API_URL,
  // }),
  ()

rj.setPluginsDefaults({
  'AJAX+RxJs': [{ baseUrl: API_URL }],
})
rj.addNamespace(
  'api',
  rjWithRoutines(),
  rj(rjAjax(), {
    // effectCaller: callToken,
  }),
  rjPlainList()
)

export const TodosListState = rj.ns.api(
  // rjAjax({
  //   baseUrl: API_URL,
  // }),
  // rj({
  //   effectCaller: callToken,
  // }),
  // rj({
  //   effectCaller: (call, ...args) => {
  //     console.log('CALL ME', args)
  //     return call(...args)
  //   }
  // }),
  // rjAjax({
  //   baseUrl: API_URL,
  // }),
  // rjAjax({
  //   baseUrl: 'GN'
  // }),
  // rjAjax(),
  // rjPlainList(),
  {
    effectPipeline: action => action.pipe(tap(x => console.log('TAP', x))),
    // effectCaller: callToken,
    // effect: t => 23,
    // effect: t => () => request.get(`${API_URL}/todos?t=${t}`).then(({ body }) => body),
    effect: () => ({
      url: `/todos`,
      // url: `${API_URL}/todos`,
      headers: {
        // Authorization: `JWT ${t}`,
      },
    }),
    mutations: {
      addStupidTodo: rj.mutation.single({
        // effect: todo =>
        // request
        //   .post(`${API_URL}/todos`)
        //   .send(todo)
        //   .then(({ body }) => body),
        effect: todo => ({
          url: '/todos',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: todo,
        }),
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
  }
)
console.log('X', TodosListState)
