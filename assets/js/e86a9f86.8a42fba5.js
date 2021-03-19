(window.webpackJsonp=window.webpackJsonp||[]).push([[48],{119:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return o})),n.d(t,"default",(function(){return f}));var a=n(3),r=(n(0),n(122));const c={id:"side_effects",title:"Side Effects",sidebar_label:"Side Effects",slug:"/side-effects"},i={unversionedId:"side_effects",id:"side_effects",isDocsHomePage:!1,title:"Side Effects",description:"Architecture overview",source:"@site/docs/side_effects.md",slug:"/side-effects",permalink:"/react-rocketjump/docs/next/side-effects",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/docs/side_effects.md",version:"current",sidebar_label:"Side Effects",sidebar:"someSidebar",previous:{title:"Action Creators",permalink:"/react-rocketjump/docs/next/action-creators"},next:{title:"Consume RjObjects",permalink:"/react-rocketjump/docs/next/consume-rj-objects"}},o=[{value:"Architecture overview",id:"architecture-overview",children:[]},{value:"Take effect",id:"take-effect",children:[]},{value:"Write custom take effects",id:"write-custom-take-effects",children:[]},{value:"Add side effects",id:"add-side-effects",children:[]},{value:"The <code>actionMap</code> helper",id:"the-actionmap-helper",children:[]}],s={toc:o};function f({components:e,...t}){return Object(r.b)("wrapper",Object(a.a)({},s,t,{components:e,mdxType:"MDXLayout"}),Object(r.b)("h2",{id:"architecture-overview"},"Architecture overview"),Object(r.b)("p",null,"When a RjObject is consumed an ",Object(r.b)("strong",{parentName:"p"},"action observable")," ",Object(r.b)("inlineCode",{parentName:"p"},"Observable<EffectAction>")," is created this rapresent the stream of effect actions dispatched from effect action creators."),Object(r.b)("p",null,"The original action observable are passed into ",Object(r.b)("inlineCode",{parentName:"p"},"effectPipeline")," which return the same contract of effect actions stream."),Object(r.b)("p",null,"From action observable a ",Object(r.b)("strong",{parentName:"p"},"dispatch observable")," is created according to ",Object(r.b)("inlineCode",{parentName:"p"},"takeEffect")," and ",Object(r.b)("inlineCode",{parentName:"p"},"addSideEffect")," options."),Object(r.b)("p",null,"The actions emitted from dispatch observable are dispatched on reducer."),Object(r.b)("p",null,Object(r.b)("img",{alt:"img",src:n(169).default})),Object(r.b)("h2",{id:"take-effect"},"Take effect"),Object(r.b)("p",null,"Take effect abstraction describe how your effect actions stream is handled by RocketJump.\nYou can configured them using the ",Object(r.b)("inlineCode",{parentName:"p"},"takeEffect")," property in ",Object(r.b)("strong",{parentName:"p"},"rj")," constructor.\nYou can write your own take effect function using ",Object(r.b)("a",{parentName:"p",href:"https://rxjs.dev"},"rxjs")," or you can use\nthe standard take effects provided by RocketJump passing it a ",Object(r.b)("em",{parentName:"p"},"string"),".\nStandard take effects are designed to works with standard effect action types:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'RUN'"),": created by ",Object(r.b)("inlineCode",{parentName:"li"},"run(...params)")," trigger the effect function using ",Object(r.b)("inlineCode",{parentName:"li"},"params")," as input."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'CANCEL'"),": created by ",Object(r.b)("inlineCode",{parentName:"li"},"cancel()")," stop onging effect."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'CELAN'"),": created by ",Object(r.b)("inlineCode",{parentName:"li"},"clean()")," also stop onging effect.")),Object(r.b)("p",null,"Standard take effects are:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'latest'"),": ",Object(r.b)("strong",{parentName:"li"},"(the default one)")," take only the last effect you run, cancel all previous pending effect."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'every'"),": take all effects you run, the dispatched ",Object(r.b)("em",{parentName:"li"},"FAILURE")," / ",Object(r.b)("em",{parentName:"li"},"SUCCESS")," follow the ",Object(r.b)("strong",{parentName:"li"},"completation order"),"\nof your effect (don't use the if order matter). If a ",Object(r.b)("em",{parentName:"li"},"CANCEL")," or ",Object(r.b)("em",{parentName:"li"},"CLEAN")," are emitted ",Object(r.b)("strong",{parentName:"li"},"ALL")," ongoing effects\nare canceled."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'exhaust'"),": execute one run at time if an effect is pending and you emit a run it's ignored."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'concatLatest'"),": execute one run at time if an effect is pending and you emit a run the ",Object(r.b)("strong",{parentName:"li"},"LAST"),' run is buffered\nand then executed. This useful in "auto save" scenarios you spawn run very often but you want\nto avoid concurrent save but, on the other hand, you want your data update with last version.')),Object(r.b)("p",null,'Some standard take effects have a "group by" version, in other words the description above\nis true but you can decuple it into different "channels".\nTo provide group by standard take effect you have to provide a fixed lenght list\nwith this signature:'),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-ts"},"[takeEffectName: string, (action: EffectActions) => any]\n")),Object(r.b)("p",null,"The first argument is the take effect name, the second is a function\nthat extracts the key for each effect action."),Object(r.b)("p",null,"Standard take effects group by are:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'groupBy'"),": the group by version of ",Object(r.b)("inlineCode",{parentName:"li"},"latest"),"."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'groupByExhaust'"),": the group by version of ",Object(r.b)("inlineCode",{parentName:"li"},"latest"),"."),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"'groupByConcatLatest'"),": the group by version of ",Object(r.b)("inlineCode",{parentName:"li"},"concatLatest"),".")),Object(r.b)("h2",{id:"write-custom-take-effects"},"Write custom take effects"),Object(r.b)("p",null,"As mentioned before you can write custom take effects.\nTo write custom take effect you should have a basic understening of how rxjs works.\nAs expiration you can checkout how standard take effects are implemented ",Object(r.b)("a",{parentName:"p",href:"https://github.com/inmagik/react-rocketjump/blob/master/src/core/effect/takeEffectsHandlers.ts"},"here"),"."),Object(r.b)("p",null,"The take effect handler has this signature:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-ts"},"type EffectCallerFn = (\n  effect: EffectFn,\n  ...params: any[]\n) => Promise<any> | Observable<any> | EffectFn\n\ntype RjEffectCaller = EffectCallerFn | RjConfiguredCaller\n\ntype GetEffectCallerFn = (action: EffectAction) => EffectCallerFn\n\ninterface TakeEffectBag {\n  effect: EffectFn\n  getEffectCaller: GetEffectCallerFn\n  prefix: string\n}\n\ninterface StateObservable<S = any> extends Observable<S> {\n  value: S\n}\n\ntype TakeEffectHanlder = (\n  actionsObservable: Observable<EffectAction>,\n  stateObservable: StateObservable,\n  effectBag: TakeEffectBag,\n  ...extraArgs: any[]\n) => Observable<Action>\n")),Object(r.b)("p",null,"One important note to understand is that (in order to make RockeJump works) at first\ninstance you need to ",Object(r.b)("strong",{parentName:"p"},"FILTER")," which effect actions you want to handle.\nThis because multiple effects can live in a single RjObject so you have to handle only\nyour part."),Object(r.b)("p",null,"Ok try to write a real example. Take the counter RjObject from the previous example\nand transform the increment / decrement action to effect action so we can execute\ntheme after a given amount of time."),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-jsx"},"import { rj, useRj } from 'react-rocketjump'\nimport { filter, mergeMap, delay } from 'rxjs/operators'\nimport { of } from 'rxjs'\n\nexport const CounterState = rj({\n  // NOTE: In this example we ignore effect\n  effect: () => Promise.reject(),\n  // Make inc() and dec() effect action creators\n  actions: (currentActions) => ({\n    dec: (quantity, wait = 0) =>\n      makeEffectAction('DEC', [quantity], {\n        wait,\n      }),\n    inc: (quantity, wait = 0) =>\n      makeEffectAction('INC', [quantity], {\n        wait,\n      }),\n  }),\n  takeEffect: (effectActionObservable) => {\n    // pipe the streams of effect actions\n    return effectActionObservable.pipe(\n      // As describe above first filter the effect types we want to handle\n      // in cour case only INC and DEC\n      filter((action) => ['INC', 'DEC'].includes(action.type)),\n      // we use mergeMap cuase we want to handle ALL INC and DEC\n      // if for example we want to take only the last INC and DEC\n      // we can use switchMap, while if orders of request means\n      // we can use concatMap\n      mergeMap((action) => {\n        // Create a new observable with the same type but using\n        // the first param as action payload\n        return (\n          of({\n            type: action.type,\n            payload: action.payload.params[0],\n          })\n            // final we delay the dispatch by given wait time\n            .pipe(delay(action.meta.wait))\n        )\n      })\n    )\n  },\n  // Swap default root reducer implementation with a simple counter\n  reducer: (currentReducer) => (state = 0, action) => {\n    if (action.type === 'INC') {\n      return state + action.payload\n    }\n    if (action.type === 'DEC') {\n      return state - action.payload\n    }\n    return state\n  },\n})\n\nfunction Conter() {\n  const [counter, { inc, dec }] = useRj(CounterState)\n\n  return (\n    <div>\n      <button onClick={() => inc(1)}>INC</button>\n      <button onClick={() => inc(2, 3 * 1000)}>INC 2 after 3 seconds</button>\n      <h1>{counter}</h1>\n      <button onClick={() => dec(1)}>DEC</button>\n      <button onClick={() => dec(5, 1 * 1000)}>DEC 5 after 1 second</button>\n    </div>\n  )\n}\n")),Object(r.b)("h2",{id:"add-side-effects"},"Add side effects"),Object(r.b)("p",null,"When using ",Object(r.b)("inlineCode",{parentName:"p"},"takeEffect")," option the default take effect is replaced.\nIf instead you want to add another side effect and keep the take effect working\nuse ",Object(r.b)("inlineCode",{parentName:"p"},"addSideEffect")," option, the signature and the behavior are identical to\na custom take effect."),Object(r.b)("h2",{id:"the-actionmap-helper"},"The ",Object(r.b)("inlineCode",{parentName:"h2"},"actionMap")," helper"),Object(r.b)("p",null,"In order to make your life easier RocketJump provide you a useful helper\nto emit standard RocketJump actions (",Object(r.b)("strong",{parentName:"p"},"PENDING"),", ",Object(r.b)("strong",{parentName:"p"},"FAILURE"),", ",Object(r.b)("strong",{parentName:"p"},"SUCCESS"),")\nfrom a ",Object(r.b)("strong",{parentName:"p"},"RUN"),"."),Object(r.b)("p",null,"This function is used inside standard RocketJump take effects."),Object(r.b)("p",null,"You can use this function to implement a custom take effects with the same\ncontract of standard ones."),Object(r.b)("p",null,"The ",Object(r.b)("inlineCode",{parentName:"p"},"actionMap")," helper has this signature:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-ts"},"function actionMap(\n  action: EffectAction,\n  effectCall: EffectFn,\n  getEffectCaller: GetEffectCallerFn,\n  prefix: string\n): Observable<Action>\n")),Object(r.b)("p",null,"This helper call the ",Object(r.b)("strong",{parentName:"p"},"effect")," using the ",Object(r.b)("a",{parentName:"p",href:"/react-rocketjump/docs/next/effect-caller"},"effect caller"),"\nand emit standard actions with given prefix."),Object(r.b)("p",null,"For example if we want to implement a take effect that use the ",Object(r.b)("inlineCode",{parentName:"p"},"concatMap")," operator\nwe can write:"),Object(r.b)("pre",null,Object(r.b)("code",{parentName:"pre",className:"language-js"},"import { rj, actionMap, RUN } from 'react-rocketjump'\nimport { concatMap, filter } from 'rxjs/operators'\nimport { concat, of } from 'rxjs'\n\nrj({\n  // ...\n  takeEffect: (actionObserable, stateObservable, takeEffectBag) => {\n    return actionObserable.pipe(\n      // NOTE: In a real world scenario\n      // we also have to handle CANCEL and CLEAN types\n      filter((action) => action.type === RUN),\n      concatMap((action) =>\n        concat(\n          of(action),\n          actionMap(\n            action,\n            takeEffectBag.effect,\n            takeEffectBag.getEffectCaller,\n            takeEffectBag.prefix\n          )\n        )\n      )\n    )\n  },\n})\n")))}f.isMDXComponent=!0},122:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return d}));var a=n(0),r=n.n(a);function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},c=Object.keys(e);for(a=0;a<c.length;a++)n=c[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(a=0;a<c.length;a++)n=c[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var f=r.a.createContext({}),l=function(e){var t=r.a.useContext(f),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=l(e.components);return r.a.createElement(f.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},u=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,c=e.originalType,i=e.parentName,f=s(e,["components","mdxType","originalType","parentName"]),p=l(n),u=a,d=p["".concat(i,".").concat(u)]||p[u]||b[u]||c;return n?r.a.createElement(d,o(o({ref:t},f),{},{components:n})):r.a.createElement(d,o({ref:t},f))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var c=n.length,i=new Array(c);i[0]=u;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var f=2;f<c;f++)i[f]=n[f];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},169:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/RjSideEffectModel-ea3ea459727c2632cb10b55c036beb16.png"}}]);