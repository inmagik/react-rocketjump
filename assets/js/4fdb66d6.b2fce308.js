(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{124:function(e,t,n){"use strict";n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return b}));var a=n(0),o=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function u(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),p=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},l=function(e){var t=p(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},m=o.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,r=e.parentName,s=u(e,["components","mdxType","originalType","parentName"]),l=p(n),m=a,b=l["".concat(r,".").concat(m)]||l[m]||d[m]||i;return n?o.a.createElement(b,c(c({ref:t},s),{},{components:n})):o.a.createElement(b,c({ref:t},s))}));function b(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,r=new Array(i);r[0]=m;var c={};for(var u in t)hasOwnProperty.call(t,u)&&(c[u]=t[u]);c.originalType=e,c.mdxType="string"==typeof e?e:a,r[1]=c;for(var s=2;s<i;s++)r[s]=n[s];return o.a.createElement.apply(null,r)}return o.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},91:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return u})),n.d(t,"default",(function(){return p}));var a=n(3),o=n(7),i=(n(0),n(124)),r={id:"mutations",title:"Mutations",sidebar_label:"Mutations",slug:"/mutations"},c={unversionedId:"mutations",id:"mutations",isDocsHomePage:!1,title:"Mutations",description:"Mutations are a first class api of RocketJump to describe asynchronous mutation",source:"@site/docs/mutations.md",slug:"/mutations",permalink:"/react-rocketjump/docs/next/mutations",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/docs/mutations.md",version:"current",sidebar_label:"Mutations",sidebar:"someSidebar",previous:{title:"Consume RjObjects",permalink:"/react-rocketjump/docs/next/consume-rj-objects"},next:{title:"Plugin System",permalink:"/react-rocketjump/docs/next/plugin-system"}},u=[{value:"Writing mutations",id:"writing-mutations",children:[{value:"<code>effect</code>",id:"effect",children:[]},{value:"<code>updater</code>",id:"updater",children:[]},{value:"<code>reducer</code>",id:"reducer",children:[]},{value:"<code>effectCaller</code>",id:"effectcaller",children:[]},{value:"<code>takeEffect</code>",id:"takeeffect",children:[]}]},{value:"Consume mutation state",id:"consume-mutation-state",children:[]},{value:"Standard mutations",id:"standard-mutations",children:[{value:"Single mutation",id:"single-mutation",children:[]},{value:"Multiple mutation",id:"multiple-mutation",children:[]}]},{value:"Optimistic mutations",id:"optimistic-mutations",children:[{value:"When to use optimistic mutation",id:"when-to-use-optimistic-mutation",children:[]},{value:"How to use optimistic mutation",id:"how-to-use-optimistic-mutation",children:[]},{value:"Write consistent optmistic mutations",id:"write-consistent-optmistic-mutations",children:[]}]}],s={toc:u};function p(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Mutations are a first class api of RocketJump to describe asynchronous mutation\nof the state. ",Object(i.b)("br",null),"\nYou can add mutations to your RjObject with the ",Object(i.b)("inlineCode",{parentName:"p"},"mutations")," config option, an object\nwhere the ",Object(i.b)("em",{parentName:"p"},"keys")," are the ",Object(i.b)("strong",{parentName:"p"},"mutation names")," and the values are configuration objects."),Object(i.b)("p",null,"A mutation is essentially defined by two elements:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"The effect, that follow the same rules of RocketJump effect."),Object(i.b)("li",{parentName:"ul"},"The logic to update the root state from the effect result (",Object(i.b)("strong",{parentName:"li"},"updater"),").")),Object(i.b)("p",null,"Then we can add some accessory options:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"The ",Object(i.b)("a",{parentName:"li",href:"/react-rocketjump/docs/next/effect-caller"},"effectCaller")," for the mutation effect."),Object(i.b)("li",{parentName:"ul"},"The ",Object(i.b)("a",{parentName:"li",href:"/react-rocketjump/docs/next/side-effects"},"takeEffect")," to describe the mutation side effect."),Object(i.b)("li",{parentName:"ul"},"The reducer to track mutation state.")),Object(i.b)("p",null,"Mutation are based on RocketJump elements. So for each mutation\nRocketJump perform the following tasks:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"Create a side effect with the same rules of RocketJump side effects using mutation\nsettings ",Object(i.b)("inlineCode",{parentName:"li"},"effect"),", ",Object(i.b)("inlineCode",{parentName:"li"},"effectCaller")," and ",Object(i.b)("inlineCode",{parentName:"li"},"takeEffect"),"."),Object(i.b)("li",{parentName:"ul"},"Add an ",Object(i.b)("a",{parentName:"li",href:"/react-rocketjump/docs/next/action-creators"},"effect action creator")," using the mutation name (the key of your configuration)."),Object(i.b)("li",{parentName:"ul"},"If the ",Object(i.b)("inlineCode",{parentName:"li"},"reducer")," mutation option is given create a reducer under the key: ",Object(i.b)("inlineCode",{parentName:"li"},"mutations.[mutationName]"),"."),Object(i.b)("li",{parentName:"ul"},"Apply the ",Object(i.b)("inlineCode",{parentName:"li"},"updater")," function to your root state when the effect completed with success.")),Object(i.b)("p",null,"Here an example of a simple mutation:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-jsx"},"import { rj, useRunRj } from 'react-rocketjump'\n\nconst TodosState = rj({\n  mutations: {\n    addTodo: {\n      effect: (todo) =>\n        fetch('api/todos', {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n          },\n          body: JSON.stringify(todo),\n        }).then((r) => r.json()),\n      // Add the new todo on topo of the todo list\n      updater: (rootState, newTodo) => ({\n        ...rootState,\n        data: [newTodo].concat(rootState.data),\n      }),\n    },\n  },\n  effect: () => fetch('/api/todos').then((r) => r.json()),\n})\n\nfunction Todos() {\n  const [{ data }, { addTodo }] = useRunRj(TodosState)\n\n  return (\n    <>\n      <TodoForm\n        onSubmit={(title) => {\n          return addTodo\n            .onSuccess((createdTodo) => {\n              alert(`Todo ${createdTodo.title} created!`)\n            })\n            .asPromise({ title })\n        }}\n      />\n      <TodosList todos={data} />\n    </>\n  )\n}\n")),Object(i.b)("h2",{id:"writing-mutations"},"Writing mutations"),Object(i.b)("p",null,"Now we go deep of how confguring mutations."),Object(i.b)("h3",{id:"effect"},Object(i.b)("inlineCode",{parentName:"h3"},"effect")),Object(i.b)("p",null,"The effect of the mutation, works as RocketJump effect."),Object(i.b)("h3",{id:"updater"},Object(i.b)("inlineCode",{parentName:"h3"},"updater")),Object(i.b)("p",null,"A ",Object(i.b)("strong",{parentName:"p"},"pure function")," used to update your ",Object(i.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/reducer"},"root state")," in response\nof mutation effect completation."),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"(rootState, result) => nextRootState\n")),Object(i.b)("p",null,"Otherwise you can provide a ",Object(i.b)("em",{parentName:"p"},"string")," refer to an action creator name.\nFor example we can use the built-in ",Object(i.b)("inlineCode",{parentName:"p"},"updateData")," action creator to simple\nupdate the ",Object(i.b)("inlineCode",{parentName:"p"},"data")," when mutation complete:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"import { rj } from 'react-rocketjump'\n\nconst ProductDetailState = rj({\n  mutations: {\n    updateProduct: {\n      effect: (product) =>\n        fetch(`api/product/${product.id}`, {\n          method: 'PUT',\n          headers: {\n            'Content-Type': 'application/json',\n          },\n          body: JSON.stringify(product),\n        }).then((r) => r.json()),\n      updater: 'updateData',\n    },\n  },\n  effect: (id) => fetch(`/api/product/${id}`).then((r) => r.json()),\n})\n")),Object(i.b)("h3",{id:"reducer"},Object(i.b)("inlineCode",{parentName:"h3"},"reducer")),Object(i.b)("p",null,"Differently from the main effect mutations doens't came with a default reducer\nand related state.\nYou can anyway attach a reducer to a mutation using the ",Object(i.b)("inlineCode",{parentName:"p"},"reducer")," option in\nthe mutation config.\nThe main point to note is that when you write a reducer for a mutation\nthe same action types of ",Object(i.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/reducer"},"standard reducer")," are dispatched.\nSpecifically this mean that you can write generic and reusable reducer\nfor you muation!\nFor example write a mutation reducer to track a loading/error state at time,\nthis is true for scenarios like submit a form or when you single interaction\nat time:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"import { rj, PENDING, SUCCESS, FAILURE } from 'react-rocketjump'\n\nfunction singleMutationReducer(\n  state = { pending: false, error: null },\n  action\n) {\n  switch (action.type) {\n    case PENDING:\n      return {\n        ...state,\n        error: null,\n        pending: true,\n      }\n    case FAILURE:\n      return {\n        ...state,\n        error: action.payload,\n        pending: false,\n      }\n    case SUCCESS:\n      return {\n        ...state,\n        pending: false,\n      }\n    default:\n      return state\n  }\n}\n\nconst ProductDetailState = rj({\n  mutations: {\n    updateProduct: {\n      // ...\n      reducer: singleMutationReducer,\n    },\n  },\n  // ...\n})\n")),Object(i.b)("h3",{id:"effectcaller"},Object(i.b)("inlineCode",{parentName:"h3"},"effectCaller")),Object(i.b)("p",null,"The ",Object(i.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/effect-caller"},"effect caller")," of mutation effect, if you don't specify\nthem is inherit from ",Object(i.b)("inlineCode",{parentName:"p"},"effectCaller")," defined in RocketJump configuration.\nIf you provide the ",Object(i.b)("inlineCode",{parentName:"p"},"effectCaller")," on mutation config mutation use the effect caller\nyou provide (also applies to ",Object(i.b)("inlineCode",{parentName:"p"},"'configured'"),").\nIf you want not to have any effect caller on a specific mutation you can pass\n",Object(i.b)("inlineCode",{parentName:"p"},"false"),"."),Object(i.b)("h3",{id:"takeeffect"},Object(i.b)("inlineCode",{parentName:"h3"},"takeEffect")),Object(i.b)("p",null,"The (take effect)","[side_effects.md]"," of the mutation side effect, works exactly\nas RocketJump main take effect the only difference is that\nthe default value is ",Object(i.b)("inlineCode",{parentName:"p"},"'every"),"' rather than ",Object(i.b)("inlineCode",{parentName:"p"},"'latest'"),". ",Object(i.b)("br",null),"\nThis decision was made because tipically you want track ",Object(i.b)("strong",{parentName:"p"},"every")," effect result\nof mutations effect instead of the latest."),Object(i.b)("h2",{id:"consume-mutation-state"},"Consume mutation state"),Object(i.b)("p",null,"As explained in the other parts of the doc, the default state computed from\nan RjObject is the root state.\nSo to consume the mutation state you should use ",Object(i.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/computed-state-and-selectors"},"computed"),"\no rely on selection argument i the ",Object(i.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/consume-rj-objects"},"consuming api"),"."),Object(i.b)("p",null,"An example with computed used the previous ",Object(i.b)("inlineCode",{parentName:"p"},"ProductDetailState")," example:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-jsx"},"import { rj, useRunRj } from 'react-rocketjump'\n\nconst ProductDetailState = rj({\n  mutations: {\n    updateProduct: {\n      // ...\n    },\n  },\n  // ...\n  computed: {\n    product: 'getData',\n    updating: (state) => state.mutations.updateProduct.pending,\n  },\n})\n\nfunction ProductDetail() {\n  const [{ product, updating }, { updateProduct }] = useRunRj(\n    ProductDetailState\n  )\n  return (\n    <div>\n      <form>\n        {/* an awesome product form */}\n        <button disbaled={updating} type=\"submit\">\n          Update\n        </button>\n      </form>\n    </div>\n  )\n}\n")),Object(i.b)("p",null,"The same example using ",Object(i.b)("inlineCode",{parentName:"p"},"selectState")," with ",Object(i.b)("inlineCode",{parentName:"p"},"useRunRj"),"."),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-jsx"},"import { rj, useRunRj } from 'react-rocketjump'\n\nconst ProductDetailState = rj({\n  mutations: {\n    updateProduct: {\n      // ...\n    },\n  },\n})\n\nfunction ProductDetail() {\n  const [{ product, updating }, { updateProduct }] = useRunRj(\n    ProductDetailState,\n    (state, { getData }) => ({\n      product: getData(state),\n      updating: sate.mutations.updateProduct.pending,\n    })\n  )\n  return (\n    <div>\n      <form>\n        {/* an awesome product form */}\n        <button disbaled={updating} type=\"submit\">\n          Update\n        </button>\n      </form>\n    </div>\n  )\n}\n")),Object(i.b)("h2",{id:"standard-mutations"},"Standard mutations"),Object(i.b)("p",null,"RocketJump provides some utilities to setup sensible defaults on ",Object(i.b)("em",{parentName:"p"},"takeEffect")," and ",Object(i.b)("em",{parentName:"p"},"reducer")," for the most common cases."),Object(i.b)("h3",{id:"single-mutation"},"Single mutation"),Object(i.b)("p",null,"This options set is thought for mutations that have no overlapping or concurrent runs. A common use case, for instance, is a form submission."),Object(i.b)("p",null,"This preset sets ",Object(i.b)("em",{parentName:"p"},"takeEffect")," to ",Object(i.b)("em",{parentName:"p"},"exhaust")," and configures the reducer to mantain a state with the following shape:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"{\n    pending: bool,  // is the mutation running?\n    error: any      // rejection value of last failing run\n}\n")),Object(i.b)("p",null,"You can apply it to a mutation like this"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"const TodosStateRj = rj({\n  effect: () => fetch(`/user`).then((r) => r.json()),\n  mutations: {\n    updateUserProfile: rj.mutation.single({\n      // takeEffect and reducer are injected for you\n      effect: (newProfile) =>\n        fetch(`/user`, {\n          method: 'PATCH',\n          body: JSON.stringify(newProfile),\n        }).then((r) => r.json()),\n      updater: 'updateData',\n    }),\n  },\n})\n")),Object(i.b)("h3",{id:"multiple-mutation"},"Multiple mutation"),Object(i.b)("p",null,"This option set is designed for mutations that have multiple concurrent runs. Furthermore, it applies a grouping logic: runs belonging to the same group cannot be parallel and only one run per group can be active at a time."),Object(i.b)("p",null,"The application of this preset requires the user to define a key derivation function, that is a function that computes a key from the params fed into the mutation call. Runs with the same key are inserted in the same group, with the logic stated above."),Object(i.b)("p",null,"This preset sets ",Object(i.b)("em",{parentName:"p"},"takeEffect")," to ",Object(i.b)("em",{parentName:"p"},"groupByExhaust"),", and the reducer is configured to mantain a state with the following shape:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-ts"},"{\n  pendings: {\n    [key]: true | undefined,\n  },\n  errors: {\n    [key]: any | undefined\n  }\n}\n")),Object(i.b)("p",null,"You can apply it to a mutation like this"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"const TodosState = rj({\n  mutations: {\n    toggleTodo: rj.mutation.multi(\n      (todo) => todo.id, // Key derivation function\n      {\n        effect: (todo) =>\n          fetch(`/todos/${todo.id}`, {\n            method: 'PATCH',\n            headers: {\n              'Content-Type': 'application/json',\n            },\n            body: JSON.stringify({ done: !todo.done }),\n          }).then((r) => r.json()),\n        updater: (state, updatedTodo) => ({\n          ...state,\n          data: state.data.map((todo) =>\n            todo.id === updatedTodo ? updatedTodo : todo\n          ),\n        }),\n      }\n    ),\n  },\n  effect: () => fetch(`/todos`).then((r) => r.json()),\n})\n")),Object(i.b)("h2",{id:"optimistic-mutations"},"Optimistic mutations"),Object(i.b)("p",null,"When you trigger a mutation you need to wait the effect result to complete to\nactually see the changes reflet in your UI.",Object(i.b)("br",null),"\nIn some cases you want to optimisic update your state immediatly in response of\nuser interaction and eventually rollback the update in case of mutation failure,\nthis is when optimistic mutation come in rescue!"),Object(i.b)("h3",{id:"when-to-use-optimistic-mutation"},"When to use optimistic mutation"),Object(i.b)("p",null,"This is up to the programmer but in general you should use optmistic mutation\nwhen you can desume the mutation effect result from its inputs.\nFor example an API that toggle a todo is a good candidate to an optimistic\nmutation while an API that add a new todo with a new id to your todos is less\na good candidate."),Object(i.b)("h3",{id:"how-to-use-optimistic-mutation"},"How to use optimistic mutation"),Object(i.b)("p",null,"To start using optmistic mutation you should provide the ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticResult"),"\noption to your mutation config."),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticResult")," function will be called with your params (as your effect)\nand the return value will be passed to the updater to update your root state."),Object(i.b)("p",null,"If your mutation ",Object(i.b)("strong",{parentName:"p"},"SUCCESS")," RocketJump will commit your state and re-running\nyour updater ussing the effect result as a normal mutation does."),Object(i.b)("p",null,"Otherwise if your mutation ",Object(i.b)("strong",{parentName:"p"},"FAILURE")," RocketJump roll back your state\nand unapply the ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticResult"),"."),Object(i.b)("div",{className:"admonition admonition-note alert alert--secondary"},Object(i.b)("div",{parentName:"div",className:"admonition-heading"},Object(i.b)("h5",{parentName:"div"},Object(i.b)("span",{parentName:"h5",className:"admonition-icon"},Object(i.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},Object(i.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),Object(i.b)("div",{parentName:"div",className:"admonition-content"},Object(i.b)("p",{parentName:"div"},"All action dispatched between the run and mutation failure are not lost\nare re-applied to your state without the optimistic result. ",Object(i.b)("br",null),"\nThis is possible cause redcuer are pure functions."))),Object(i.b)("p",null,"Heres to you a simple optimistic mutation example:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"import { rj } from 'react-rocketjump'\n\nconst ProductDetailState = rj({\n  mutations: {\n    updateProduct: {\n      effect: (product) =>\n        fetch(`api/product/${product.id}`, {\n          method: 'PUT',\n          headers: {\n            'Content-Type': 'application/json',\n          },\n          body: JSON.stringify(product),\n        }).then((r) => r.json()),\n      // This works if server returns the same product object we pass to it\n      optimisticResult: (product) => product,\n      updater: 'updateData',\n    },\n  },\n  effect: (id) => fetch(`/api/product/${id}`).then((r) => r.json()),\n})\n")),Object(i.b)("p",null,"Sometimes you need to distinguish between an optmisitc update and an update from ",Object(i.b)("strong",{parentName:"p"},"SUCCESS")," if you provide the ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticUpdater")," key in your mutation config the ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticUpdater")," is used to perform the optmistic update an the ",Object(i.b)("inlineCode",{parentName:"p"},"updater")," to perform the update when commit success."),Object(i.b)("p",null,"If your provided ",Object(i.b)("strong",{parentName:"p"},"ONLY")," ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticUpdater")," the success commit is skipped and used current root state,\nthis is useful for response as 204 No Content style where you can ignore the success\nand skip an-extra update to your state an save a React render."),Object(i.b)("h3",{id:"write-consistent-optmistic-mutations"},"Write consistent optmistic mutations"),Object(i.b)("p",null,'Since RocketJump re-apply your actions in case of failure if your effect\ncalculate the response using the remote "state" such as a databse you should\nprefer to write your update logic in your updater rather then in optimisti result.'),Object(i.b)("p",null,"Ok, let's clarify the concept with a real example. Imaging having an api\ncalled ",Object(i.b)("inlineCode",{parentName:"p"},"/increment")," that increments a remote counter."),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-sh"},"POST /increment\n1\n\nPOST /increment\n2\n\nPOST /increment\n3\n")),Object(i.b)("p",null,"If you write an updater like this:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"const AwseomeCounter = rj({\n  mutations: {\n    // ...\n    increment: {\n      effect: (counter) =>\n        fetch(`/increment`, {\n          method: 'POST',\n        }).then((r) => r.json()),\n      // This works if server returns the same product object we pass to it\n      optimisticResult: (counter) => counter + 1,\n      updater: 'updateData',\n    },\n  },\n  // ...\n})\n")),Object(i.b)("p",null,"You call them:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"function MyCounter() {\n  const [{ data: counter }, { increment }] = useRunRj(AwseomeCounter)\n\n  function handleIcrement() {\n    increment(counter)\n  }\n  // ...\n}\n")),Object(i.b)("p",null,"Imaging that you call ",Object(i.b)("inlineCode",{parentName:"p"},"handleIcrement")," three times and the second time it's fail.\nWhen RocketJump re-apply the actions the last action will be called with the\n",Object(i.b)("inlineCode",{parentName:"p"},"2")," value optimistic updater make it ",Object(i.b)("inlineCode",{parentName:"p"},"3")," and the state it's update with the ",Object(i.b)("inlineCode",{parentName:"p"},"3")," value."),Object(i.b)("p",null,"Now if you move the logic inside the ",Object(i.b)("inlineCode",{parentName:"p"},"optimisticUpdater")," instad:"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js"},"const AwseomeCounter = rj({\n  mutations: {\n    // ...\n    increment: {\n      effect: () =>\n        fetch(`/increment`, {\n          method: 'POST',\n        }).then((r) => r.json()),\n      // No-op in this specific case but required to mark them as optmistic\n      optimisticResult: () => {},\n      optimistiUpdater: (state) => ({\n        ...state,\n        data: state.data + 1,\n      }),\n      // In this case we can remove the updater as an optimization\n      // Can still useful if, for example, another user can icrement the same\n      // counter this decision is always related to your use case.\n      // updater: 'updateData',\n    },\n  },\n  // ...\n})\n")),Object(i.b)("p",null,"Now if the second time the increment fails RocketJump re-apply the actions\nto your state and you see the correct value of ",Object(i.b)("inlineCode",{parentName:"p"},"2")," in sync with your server!"))}p.isMDXComponent=!0}}]);