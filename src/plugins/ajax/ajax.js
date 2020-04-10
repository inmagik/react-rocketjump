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

const makeAjaxConfig = (descr, config = {}) => {
  if (typeof descr === 'string') {
    return {
      url: (config.baseUrl || '') + descr,
    }
  }
  if (typeof descr === 'object' && descr !== null) {
    return {
      ...descr,
      url:
        typeof descr.url === 'string'
          ? (config.baseUrl || '') + descr.url
          : descr.url,
    }
  }
  return null
}

function mapToAjax(config, descr) {
  if (isObservable(descr) || isPromise(descr)) {
    return descr
  }
  const toAjaxConfig = makeAjaxConfig(descr, config)
  if (toAjaxConfig) {
    return config.responseMap(config.ajaxAdapter(toAjaxConfig))
  }
  return descr
}

const DefaultAjaxPluginConfig = {
  baseUrl: null, // Default no override
  ajaxAdapter: ajax,
  responseMap: o => o.pipe(map(r => r.response)),
  injectToken: a => a,
}

export const rjAjax = rj.plugin(
  (config = {}) => {
    const ajaxRxConfig = {
      ...DefaultAjaxPluginConfig,
      ...config,
    }
    return rj.pure({
      ajax: {
        config: ajaxRxConfig,
        authEffectCaller: (callFn, t) => (...args) => {
          const request = callFn(...args)
          return config.injectToken(makeAjaxConfig(request), t)
        },
        effectCaller: (callFn, ...args) => {
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
    name: 'AJAX',
    makeExport: (extendExport, rjConfig) => {
      // simply ovverride ajax config when given :D
      if (rjConfig.ajax) {
        const withAjaxExport = { ...extendExport }
        withAjaxExport.ajax = rjConfig.ajax
        return withAjaxExport
      }
      return extendExport
    },
    hackExportBeforeFinalize: endExport => {
      return {
        ...endExport,
        sideEffect: {
          ...endExport.sideEffect,
          effectCaller: exportEffectCaller(
            endExport.sideEffect.effectCaller,
            endExport.ajax.effectCaller
          ),
        },
      }
    },
  }
)

export const rjAjaxAuth = rj.plugin(() => rj(), {
  name: 'AJAX+AUTH',
  hackExportBeforeFinalize: endExport => {
    return {
      ...endExport,
      sideEffect: {
        ...endExport.sideEffect,
        effectCaller: exportEffectCaller(
          endExport.sideEffect.effectCaller,
          endExport.ajax.authEffectCaller
        ),
      },
    }
  },
})
