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
    return config.responseMap(config.adapter(toAjaxConfig))
  }
  return descr
}

const DefaultAjaxPluginConfig = {
  baseUrl: null, // Default no override
  adapter: ajax,
  responseMap: (o) => o.pipe(map((r) => r.response)),
  injectAuth: null,
}

const rjAjax = rj.plugin(
  {
    name: 'AJAX',
    makeExport: (extendExport, rjConfig) => {
      let newExport = extendExport

      // simply ovverride ajax config when given :D
      if (rjConfig.ajax) {
        newExport = {
          ...newExport,
          ajax: rjConfig.ajax,
        }
      }

      // Enabled ajax auth
      if (typeof rjConfig.ajaxAuth === 'boolean') {
        newExport = {
          ...newExport,
          ajaxAuth: rjConfig.ajaxAuth,
        }
      }

      return newExport
    },
    appendEffectCallers: (rjExport) => {
      const extraCallers = []

      extraCallers.push(rjExport.ajax.effectCaller)

      if (rjExport.ajaxAuth) {
        extraCallers.push(rjExport.ajax.authEffectCaller)
      }

      return extraCallers
    },
  },
  (config = {}) => {
    const ajaxRxConfig = {
      ...DefaultAjaxPluginConfig,
      ...config,
    }
    return rj.pure({
      ajax: {
        config: ajaxRxConfig,
        authEffectCaller: (callFn, ...authArgs) => (...args) => {
          const request = callFn(...args)
          return config.injectAuth(makeAjaxConfig(request), ...authArgs)
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
  }
)

export default rjAjax