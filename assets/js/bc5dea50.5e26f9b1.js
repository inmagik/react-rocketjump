(window.webpackJsonp=window.webpackJsonp||[]).push([[43],{113:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return i}));var o=n(3),r=(n(0),n(124));const a={id:"computed_state_selectors",title:"Computed state and selectors",sidebar_label:"Computed state and selectors",slug:"/computed-state-and-selectors"},c={unversionedId:"computed_state_selectors",id:"computed_state_selectors",isDocsHomePage:!1,title:"Computed state and selectors",description:"Every RjObject has its own selectors: a collection functions used to select a piece of",source:"@site/docs/computed_state_selectors.md",slug:"/computed-state-and-selectors",permalink:"/react-rocketjump/docs/next/computed-state-and-selectors",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/docs/computed_state_selectors.md",version:"current",sidebar_label:"Computed state and selectors",sidebar:"someSidebar",previous:{title:"Reducer",permalink:"/react-rocketjump/docs/next/reducer"},next:{title:"Action Creators",permalink:"/react-rocketjump/docs/next/action-creators"}},s=[{value:"Default selectors",id:"default-selectors",children:[]},{value:"Extending selectors",id:"extending-selectors",children:[]},{value:"Compute state",id:"compute-state",children:[]},{value:"Memoizing selectors",id:"memoizing-selectors",children:[]}],l={toc:s};function i({components:e,...t}){return Object(r.b)("wrapper",Object(o.a)({},l,t,{components:e,mdxType:"MDXLayout"}),Object(r.b)("p",null,"Every RjObject has its own selectors: a collection functions used to select a piece of\ninternal state. In addition the RjObject olds a function to compute the state\ngiven to its consumers."),Object(r.b)("h2",{id:"default-selectors"},"Default selectors"),Object(r.b)("p",null,"When you crafting a new RjObject default selectors are generated.\nDefault selectors are designed to work with default state shape and are:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("strong",{parentName:"li"},"getRoot"),": select the root state."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("strong",{parentName:"li"},"isPending"),": select the pending state from root state."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("strong",{parentName:"li"},"isLoading"),": alias for isPending"),Object(r.b)("li",{parentName:"ul"},Object(r.b)("strong",{parentName:"li"},"getError"),": select the error state from root state."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("strong",{parentName:"li"},"getData"),": select the data state from root state.")),Object(r.b)("p",null,"You can access selectors using the ",Object(r.b)("strong",{parentName:"p"},"makeSelectors")," function on RjObject."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js",metastring:"{3}","{3}":!0},"const obj = rj(() => Promise.resolve(99))\nconst state = obj.reducer(undefined, { type: 'INIT' })\nconst selectors = obj.makeSelectors()\nconst data = selectors.getData(state)\n")),Object(r.b)("h2",{id:"extending-selectors"},"Extending selectors"),Object(r.b)("p",null,"You can use ",Object(r.b)("strong",{parentName:"p"},"selectors")," option on RocketJump constructor to add custom selectors and compose with defaults."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js"},"function counterReducer(state = 0, action) {\n  if (action.type === 'INCREMENT') {\n    return state + 1\n  }\n  return state\n}\n\nconst CoolState = rj({\n  selectors: (defaultSelectors) => ({\n    getCounter: (state) => state.counter,\n    getName: (state) => defaultSelectors.getData(state)?.name ?? 'NONAME',\n  }),\n  combineReducers: {\n    counter: counterReducer,\n  },\n  effect: () => Promise.resolve({ name: 'Gio Va' }),\n})\n")),Object(r.b)("p",null,"The final ",Object(r.b)("inlineCode",{parentName:"p"},"CoolState")," RjObject has default selectors plus ",Object(r.b)("inlineCode",{parentName:"p"},"getCounter")," and ",Object(r.b)("inlineCode",{parentName:"p"},"getName"),"."),Object(r.b)("h2",{id:"compute-state"},"Compute state"),Object(r.b)("p",null,"When a RjObject is consumed the state from reducer isn't used directly, but the consumer use a function called ",Object(r.b)("strong",{parentName:"p"},"computeState")," on RjObject itself.\nThe computeState function take the state from reducer and the RjObject selectors to provide you the ",Object(r.b)("strong",{parentName:"p"},"computed state"),"."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js"},"const obj = rj(() => Promise.resolve(99))\nconst state = obj.reducer(undefined, { type: 'INIT' })\nconst selectors = obj.makeSelectors()\nconst computedState = obj.computeState(state, selectors)\n")),Object(r.b)("p",null,"When you use consumers such ",Object(r.b)("inlineCode",{parentName:"p"},"useRj")," this is done for you:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js"},"const [computedState, actions] = useRj(obj)\n")),Object(r.b)("p",null,"The default computeState implementation simply select the root state."),Object(r.b)("p",null,"You can change the value returned from computeState using ",Object(r.b)("strong",{parentName:"p"},"computed")," option, an object that map out property with internal RocketJump state.\nComputed values can be inline selectors or ",Object(r.b)("em",{parentName:"p"},"strings")," that refernces selectors names."),Object(r.b)("p",null,"Using configuration from previous example."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js",metastring:"{10-14}","{10-14}":!0},"const CoolState = rj({\n  effect: () => Promise.resolve({ name: 'Gio Va' }),\n  combineReducers: {\n    counter: counterReducer,\n  },\n  selectors: (defaultSelectors) => ({\n    getCounter: (state) => state.counter,\n    getName: (state) => defaultSelectors.getData(state)?.name ?? 'NONAME',\n  }),\n  computed: {\n    name: 'getName',\n    counter: 'getCounter',\n    loading: (state) => state.root.pending,\n  },\n})\n\nconst state = obj.reducer(undefined, { type: 'INIT' })\nconst computedState = obj.computeState(state, obj.makeSelectors())\n")),Object(r.b)("p",null,"The ",Object(r.b)("inlineCode",{parentName:"p"},"computedState")," has this shape:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-ts"},"{\n  name: string | null,\n  counter: number,\n  loading: boolean,\n}\n")),Object(r.b)("h2",{id:"memoizing-selectors"},"Memoizing selectors"),Object(r.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(r.b)("div",{parentName:"div",className:"admonition-heading"},Object(r.b)("h5",{parentName:"div"},Object(r.b)("span",{parentName:"h5",className:"admonition-icon"},Object(r.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},Object(r.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"caution")),Object(r.b)("div",{parentName:"div",className:"admonition-content"},Object(r.b)("p",{parentName:"div"},"In most of apps you dont' need to memoize RocketJump selectors.\nYou can simply rely on React's ",Object(r.b)("inlineCode",{parentName:"p"},"useMemo")," inside your components."))),Object(r.b)("p",null,"RocketJump selectors are created per instance when you consume your RjObject.\nSo you can create per instance memoizing version of your selectors:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js"},"import { rj } from 'react-rocketjump'\nimport memoize from 'memoize-one'\n\nconst TodosState = rj({\n  // ...\n  selectors: (prevSelectors) => {\n    // filterDoneTodos is created per instance\n    const filterDoneTodos = memoize((todos) =>\n      todos ? todos.filter((todo) => todo.done) : []\n    )\n    return {\n      // memoize \"per todos\"\n      // (filterDoneTodos is re-executed only when data actually changes)\n      getDoneTodos: (state) => filterDoneTodos(prevSelectors.getData(state)),\n    }\n  },\n  computed: {\n    doneTodos: 'getDoneTodos',\n    // ..\n  }\n})\n\nfunction Todos() {\n  const [{\n    // doneTodos is memoized\n    doneTodos,\n  }] = useRj(TodosState)\n\n  // ...\n}\n")))}i.isMDXComponent=!0},124:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return b}));var o=n(0),r=n.n(o);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var i=r.a.createContext({}),u=function(e){var t=r.a.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=u(e.components);return r.a.createElement(i.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,i=l(e,["components","mdxType","originalType","parentName"]),p=u(n),d=o,b=p["".concat(c,".").concat(d)]||p[d]||m[d]||a;return n?r.a.createElement(b,s(s({ref:t},i),{},{components:n})):r.a.createElement(b,s({ref:t},i))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,c=new Array(a);c[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:o,c[1]=s;for(var i=2;i<a;i++)c[i]=n[i];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);