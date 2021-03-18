(window.webpackJsonp=window.webpackJsonp||[]).push([[34],{104:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return p}));var a=n(3),r=n(7),i=(n(0),n(121)),o={id:"plugin_map",title:"Map Plugin",sidebar_label:"Map Plugin",slug:"/plugin-map"},l={unversionedId:"plugin_map",id:"version-2.x/plugin_map",isDocsHomePage:!1,title:"Map Plugin",description:"Use cases",source:"@site/versioned_docs/version-2.x/plugin_map.md",slug:"/plugin-map",permalink:"/react-rocketjump/docs/plugin-map",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/plugin_map.md",version:"2.x",sidebar_label:"Map Plugin",sidebar:"version-2.x/someSidebar",previous:{title:"ListDelete Plugin",permalink:"/react-rocketjump/docs/plugin-listdelete"},next:{title:"Debounce Plugin",permalink:"/react-rocketjump/docs/plugin-debounce"}},s=[{value:"Use cases",id:"use-cases",children:[]},{value:"Configuration",id:"configuration",children:[]},{value:"Usage",id:"usage",children:[]},{value:"Actions",id:"actions",children:[]},{value:"Selectors",id:"selectors",children:[]}],c={toc:s};function p(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h2",{id:"use-cases"},"Use cases"),Object(i.b)("p",null,"This plugin modifies the state shape into a dictionary shape. This is extremely useful when you have to work with omogeneous indexed data belonging to a collection. For example, any master-detail based API is a suitable candidate for the usage of this plugin"),Object(i.b)("p",null,"The map plugin works by changing the state shape, and adjusting selectors, actions and reducer accordingly."),Object(i.b)("p",null,"The base state shape is"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"{\n    loading: false,\n    data: { /* some data */ },\n    error: null\n}\n")),Object(i.b)("p",null,"This shape is replicated for each key to be stored, and the indexed replicas are used as the new state"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"{\n    key1: {\n        loading: false,\n        data: { /* some data */ },\n        error: null\n    },\n    key2: {\n        loading: false,\n        data: { /* some data */ },\n        error: null\n    },\n    /* and so on... */\n}\n")),Object(i.b)("p",null,"In order to get this working, you need to configure a keyMakerFunction, that is, a function able to associate any dispatched action (among those regarding the mapped rocketjump) to a key in the store."),Object(i.b)("p",null,"The default keyMakerFunction is the following"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"action => action.meta ? action.meta.id : null\n")),Object(i.b)("p",null,"The map plugin provides you ad-hoc actions and selectors to interact with the state shape described beforehand"),Object(i.b)("h2",{id:"configuration"},"Configuration"),Object(i.b)("p",null,"This plugin supports some configuration options:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"key"),": The keyMaker function described in the previous paragraph"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"dataTransform"),": Custom transformation to be applied to data before storing them in the map. If set, it must be a function that is passed the output of the async task as a parameter and that must return the content to store in the state, under the ",Object(i.b)("inlineCode",{parentName:"li"},"data")," key"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"keepCompleted"),": Boolean indicating whether to keep in the state entries that correspond to completed tasks or to delete them on completion. This can be useful for instance do deal with situations where we need to track in-flight tasks, but we don't care about their output, just about their completion.")),Object(i.b)("h2",{id:"usage"},"Usage"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"import { rj } from 'react-rocketjump'\nimport rjMap from 'react-rocketjump/plugins/map'\n\nconst state = rj(\n        rjMap({\n            keepSucceeded: true\n        }),\n        {\n            effect: fetchUsers\n        }\n    )()\n")),Object(i.b)("h2",{id:"actions"},"Actions"),Object(i.b)("p",null,"This plugin injects in the ",Object(i.b)("inlineCode",{parentName:"p"},"actions")," bag the following action creators:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"runKey"),": performs standard ",Object(i.b)("inlineCode",{parentName:"li"},"run")," action on an item, given its key. The given id is expected to be the first parameter of the call and is then passed down to the api ",Object(i.b)("inlineCode",{parentName:"li"},"params")," array and copied into the ",Object(i.b)("inlineCode",{parentName:"li"},"meta")," object under the ",Object(i.b)("inlineCode",{parentName:"li"},"id")," key. Hence, the signature of this function is ",Object(i.b)("inlineCode",{parentName:"li"},"(id, ...otherParams) => void")),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"cleanKey"),": performs standard ",Object(i.b)("inlineCode",{parentName:"li"},"clean")," action on an item, given its key")),Object(i.b)("h2",{id:"selectors"},"Selectors"),Object(i.b)("p",null,"This plugin injects in the ",Object(i.b)("inlineCode",{parentName:"p"},"selectors")," bag the following selectors:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"getMapData"),": retrieves data key from any item, and returns them indexed by key"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"getMapLoadings"),": retrieves loading state from any item, and returns them indexed by key"),Object(i.b)("li",{parentName:"ul"},Object(i.b)("strong",{parentName:"li"},"getMapFailures"),": retrieves error key from any item, and returns them indexed by key")),Object(i.b)("p",null,"Basically, provided selectors slice the state vertically:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"// Suppose this is our state\nstate = {\n    users: {\n        23: {\n            loading: false,\n            data: data_23,\n            error: null\n        },\n        39: {\n            loading: false,\n            data: data_39,\n            error: null\n        },\n    }\n}\n\nlet x = getMapData(state);\n// x will contain the following structure\n{\n    23: data_23,\n    39: data_39\n}\n")))}p.isMDXComponent=!0},121:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var a=n(0),r=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=r.a.createContext({}),p=function(e){var t=r.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},b=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=p(n),b=a,m=u["".concat(o,".").concat(b)]||u[b]||d[b]||i;return n?r.a.createElement(m,l(l({ref:t},c),{},{components:n})):r.a.createElement(m,l({ref:t},c))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=b;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var c=2;c<i;c++)o[c]=n[c];return r.a.createElement.apply(null,o)}return r.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"}}]);