import { rj } from '../../index'
import { isObservable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

// TODO: query string
function mapToAjax(config, descr) {
  if (typeof descr === 'string') {
    return ajax({
      url: descr,
    }).pipe(map(r => r.response))
  }
  if (typeof descr === 'object' && descr !== null) {
    return ajax({
      ...descr,
    }).pipe(map(r => r.response))
  }
  return null
}

const rjAjaxRxJs = rj.plugin(
  config =>
    rj.pure({
      effectCaller: (callFn, ...args) => {
        console.log('Caller AJAX')
        const respose = callFn(...args)
        if (isObservable(respose) || isPromise(respose)) {
          return respose
        }
        return mapToAjax(config, respose)
      },
      gang: 23,
    }),
  {
    name: 'AJAX+RxJs',
  }
)

export default rjAjaxRxJs
