import { rj } from '../../index'
import { isObservable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import { exportEffectCaller } from '../../sideEffectDescriptor'

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

// TODO: query string
function mapToAjax(config, descr) {
  if (isObservable(descr) || isPromise(descr)) {
    return descr
  }
  console.log('MAP 2 AJAX', descr, config)
  if (typeof descr === 'string') {
    return ajax({
      url: (config.baseUrl || '') + descr,
    }).pipe(map(r => r.response))
  }
  if (typeof descr === 'object' && descr !== null) {
    return ajax({
      ...descr,
      url:
        typeof descr.url === 'string'
          ? (config.baseUrl || '') + descr.url
          : descr.url,
    }).pipe(map(r => r.response))
  }
  return null
}

const DefaultAjaxConfig = {
  baseUrl: null, // Default no overrid
}

const rjAjaxRxJs = rj.plugin(
  (config = {}) => {
    const ajaxRxConfig = {
      ...DefaultAjaxConfig,
      ...config,
    }
    return rj.pure({
      ajaxRx: {
        config: ajaxRxConfig,
        effectCaller: (callFn, ...args) => {
          console.log('Caller AJAX')
          let response = callFn(...args)
          // Prev effect caller has added an order to our effect...
          // NOTE: This approach is not right at all but works
          // fine for 90% of common use...
          if (typeof response === 'function') {
            return (...args) => {
              const nextOrderResponse = response(...args)
              return mapToAjax(ajaxRxConfig, nextOrderResponse)
            }
          }
          return mapToAjax(ajaxRxConfig, response)
        },
      },
    })
  },
  {
    name: 'AJAX+RxJs',
    makeExport: (extendExport, rjConfig) => {
      // simply ovverride ajax config when given :D
      const withAjaxExport = { ...extendExport }
      if (rjConfig.ajaxRx) {
        withAjaxExport.ajaxRx = rjConfig.ajaxRx
      }
      return { ...withAjaxExport }
    },
    hackExportBeforeFinalize: endExport => {
      console.log('U.u', endExport)
      // return endExport
      return {
        ...endExport,
        sideEffect: {
          ...endExport.sideEffect,
          effectCaller: exportEffectCaller(
            endExport.sideEffect.effectCaller,
            endExport.ajaxRx.effectCaller
          ),
        },
      }
    },
  }
)

export default rjAjaxRxJs
