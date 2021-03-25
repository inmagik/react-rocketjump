(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{124:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return h}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=a.a.createContext({}),p=function(e){var t=a.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},u=function(e){var t=p(e.components);return a.a.createElement(l.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),u=p(n),d=r,h=u["".concat(i,".").concat(d)]||u[d]||b[d]||o;return n?a.a.createElement(h,c(c({ref:t},l),{},{components:n})):a.a.createElement(h,c({ref:t},l))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var l=2;l<o;l++)i[l]=n[l];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},98:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return p}));var r=n(3),a=n(7),o=(n(0),n(124)),i={id:"plugin_cache",title:"Cache Plugin",sidebar_label:"Cache Plugin",slug:"/plugin-cache"},c={unversionedId:"plugin_cache",id:"version-2.x/plugin_cache",isDocsHomePage:!1,title:"Cache Plugin",description:"Use cases",source:"@site/versioned_docs/version-2.x/plugin_cache.md",slug:"/plugin-cache",permalink:"/react-rocketjump/docs/plugin-cache",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/plugin_cache.md",version:"2.x",sidebar_label:"Cache Plugin"},s=[{value:"Use cases",id:"use-cases",children:[]},{value:"Configuration",id:"configuration",children:[]},{value:"Usage",id:"usage",children:[]},{value:"Actions",id:"actions",children:[]},{value:"Store details",id:"store-details",children:[{value:"SessionStorageStore and LocalStorageStore",id:"sessionstoragestore-and-localstoragestore",children:[]},{value:"InMemoryStorage",id:"inmemorystorage",children:[]}]}],l={toc:s};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h2",{id:"use-cases"},"Use cases"),Object(o.b)("p",null,"This plugin acts on the task spawning process: each call of the task is tagged with a (non-unique) key, and task outputs are stored by key. When a task spawns with a cached key, the task is aborted and the cached response is returned. Moreover, cache is common among all the components that connect (maybe inderectly) the ",Object(o.b)("inlineCode",{parentName:"p"},"RocketJump Partial")," where the cache is introduced. This is particularly useful in read-only environments."),Object(o.b)("h2",{id:"configuration"},"Configuration"),Object(o.b)("p",null,"This plugin supports some configuration options:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"key"),": The keyMaker function used to tag each task run with a key deducing it by the spawning parameters"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"size"),": The maximum number of entries to be kept in the cache"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"store"),": The place where the cache is stored. Available stores can be imported from the plugin file, and are ",Object(o.b)("inlineCode",{parentName:"li"},"InMemoryStore"),", ",Object(o.b)("inlineCode",{parentName:"li"},"LocalStorageStore")," and ",Object(o.b)("inlineCode",{parentName:"li"},"SessionStorageStore")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"provider"),": The policy used to organize the cache. Possible policies can be imported from the plugin file, and are ",Object(o.b)("inlineCode",{parentName:"li"},"LRUCache")," and ",Object(o.b)("inlineCode",{parentName:"li"},"FIFOCache")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"ns"),": A unique identifier used to separate caches for different ",Object(o.b)("inlineCode",{parentName:"li"},"RocketJump Objects"))),Object(o.b)("h2",{id:"usage"},"Usage"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"import { rj } from 'react-rocketjump'\nimport rjCache, { LRUCache, SessionStorageStore } from 'react-rocketjump/plugins/cache'\n\nconst state = rj(\n        rjCache({\n            ns: 'my-state-ns',\n            size: 24,\n            store: SessionStorageStore,\n            provider: LRUCache\n        })\n        {\n            effect: fetchUsers\n        }\n    )()\n")),Object(o.b)("h2",{id:"actions"},"Actions"),Object(o.b)("p",null,"This plugin injects in the ",Object(o.b)("inlineCode",{parentName:"p"},"actions")," bag the following action creators:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("strong",{parentName:"li"},"resetCache"),": removes all the items from the cache associated with the ",Object(o.b)("inlineCode",{parentName:"li"},"ns")," given in the configuration")),Object(o.b)("h2",{id:"store-details"},"Store details"),Object(o.b)("h3",{id:"sessionstoragestore-and-localstoragestore"},"SessionStorageStore and LocalStorageStore"),Object(o.b)("p",null,"These stores are supported, respectively, by ",Object(o.b)("inlineCode",{parentName:"p"},"SessionStorage")," and ",Object(o.b)("inlineCode",{parentName:"p"},"LocalStorage")," native objects. A key is created in them for any cached item, and has the shape ",Object(o.b)("inlineCode",{parentName:"p"},"{ns}-{task_key}"),". In order to clear the cache, the native ",Object(o.b)("inlineCode",{parentName:"p"},"localStorage.clear()")," and ",Object(o.b)("inlineCode",{parentName:"p"},"sessionStorage.clear()")," should be used."),Object(o.b)("h3",{id:"inmemorystorage"},"InMemoryStorage"),Object(o.b)("p",null,"This store is supported by a global variable set outside the application scope. A key is created in this object for any cached item, and has the shape ",Object(o.b)("inlineCode",{parentName:"p"},"{ns}-{task_key}"),". In order to clear the cache, the helper ",Object(o.b)("inlineCode",{parentName:"p"},"clearInMemoryStore()")," exported from the plugin file should be used."))}p.isMDXComponent=!0}}]);