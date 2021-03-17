(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{121:function(e,t,n){"use strict";n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return j}));var o=n(0),r=n.n(o);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=r.a.createContext({}),m=function(e){var t=r.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=m(e.components);return r.a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},b=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),l=m(n),b=o,j=l["".concat(c,".").concat(b)]||l[b]||u[b]||a;return n?r.a.createElement(j,i(i({ref:t},p),{},{components:n})):r.a.createElement(j,i({ref:t},p))}));function j(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,c=new Array(a);c[0]=b;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:o,c[1]=i;for(var p=2;p<a;p++)c[p]=n[p];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},97:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return m}));var o=n(3),r=n(7),a=(n(0),n(121)),c={id:"connect_connectrj",title:"connectRj",sidebar_label:"connectRj",slug:"/connect-connectrj"},i={unversionedId:"connect_connectrj",id:"version-2.x/connect_connectrj",isDocsHomePage:!1,title:"connectRj",description:"Generalities",source:"@site/versioned_docs/version-2.x/connect_connectrj.md",slug:"/connect-connectrj",permalink:"/react-rocketjump/docs/connect-connectrj",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/v3-website/versioned_docs/version-2.x/connect_connectrj.md",version:"2.x",sidebar_label:"connectRj",sidebar:"version-2.x/someSidebar",previous:{title:"useRunRj",permalink:"/react-rocketjump/docs/connect-userunrj"},next:{title:"Working with state",permalink:"/react-rocketjump/docs/usage-state"}},s=[{value:"Generalities",id:"generalities",children:[]},{value:"Basic usage",id:"basic-usage",children:[]}],p={toc:s};function m(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(a.b)("wrapper",Object(o.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"generalities"},"Generalities"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"useRj")," is a React Higher Order Component that allows the instantiation of ",Object(a.b)("em",{parentName:"p"},"one")," RocketJump Object, which is then made available to the component. To instantiate more RocketJump objects in the same component, you need to nest many HOCs like these (but prefer to use hooks, if possible, as they are much more clear and readable)"),Object(a.b)("h2",{id:"basic-usage"},"Basic usage"),Object(a.b)("p",null,"The signature of the HOC is"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"import { connectRj } from 'react-rocketjump'\nimport { Component } from './my-component-library'\nimport { rjObject } from './localstate'\n\nconst ConnectedComponent = connectRj(\n  rjObject,\n  mapStateToProps,\n  mapDispatchToProps\n)(Component)\n")),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"rjObject"),": output of the call to a ",Object(a.b)("inlineCode",{parentName:"p"},"RocketJump Constructor"),", refer to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/api-rj"},"defining RocketJump Objects")," section"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"mapStateToProps")," is a function that is used to modify the shape of the state before spreading it in component props. The role of this function is to extract information from the state and to shape it as needed by the component. To understand this function, you should read ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-state"},"working with state"),"."),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"mapActionsToProps")," is a function that is used to modify the shape of the action bag before spreading it in component props. This is mainly meant to rename actions, avoiding name clashes. Its expected value is a function that accepts a plain JavaScript object (which contains as props action name and functions as values) and return another object with the same rationale, but possibly different keys. Before trying to write this function, please read ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-actions"},"working with actions")),Object(a.b)("p",null,"For what you can do with ",Object(a.b)("inlineCode",{parentName:"p"},"state")," refer to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-state"},"working with state"),", and for what you can do with ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-actions"},"working with actions"),". Please note that ",Object(a.b)("inlineCode",{parentName:"p"},"state")," and ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," are not props passed to ","<","Component /",">",", but are spread so that their keys are props. If you want to have ",Object(a.b)("inlineCode",{parentName:"p"},"state")," and ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," as props, you should do something like this"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"import { connectRj } from 'react-rocketjump'\nimport { Component } from './my-component-library'\nimport { rjObject } from './localstate'\n\nconst ConnectedComponent = connectRj(\n  rjObject,\n  state => ({ state }),\n  actions => ({ actions })\n)(Component)\n")),Object(a.b)("p",null,"In order to ease out the task of connecting multiple ",Object(a.b)("inlineCode",{parentName:"p"},"RocketJump Objects")," by nesting ",Object(a.b)("inlineCode",{parentName:"p"},"connectRj")," invocations, a ",Object(a.b)("inlineCode",{parentName:"p"},"compose")," helper is provided with the following syntax:"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"(hoc1, hoc2, hoc3, ...) => React.Component => React.Component\n")),Object(a.b)("p",null,"This means that the following are equivalent"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"import { connectRj, compose } from 'react-rocketjump'\nimport { Component } from './my-component-library'\nimport { rjObject, rjObjectB } from './localstate'\n\n/* #1 */\nconst ConnectedComponent =\n    connectRj(\n        rjObjectA,\n        mapStateAToProps,\n        mapActionsAToProps\n    )(\n        connectRj(\n            rjObjectB,\n            mapStateBToProps,\n            mapActionsBToProps\n        )(Component)\n    )\n\n/* #2 */\nconst ConnectedComponent = compose(\n    connectRj(rjObjectA, mapStateAToProps, mapActionsAToProps),\n    connectRj(rjObjectB, mapStateBToProps, mapActionsBToProps)\n)(Component)\n")),Object(a.b)("p",null,"This is a very simple example of what you can expect when using this hook and the ",Object(a.b)("inlineCode",{parentName:"p"},"compose")," utility"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"const ConnectedComponent = compose(\n  connectRj(\n    rjFirst,\n    state => ({ first: state.data }),\n    ({ run }) => ({ loadFirst: run })\n  ),\n  connectRj(\n    rjSecond,\n    state => ({ second: state.data }),\n    ({ run }) => ({ loadSecond: run })\n  ),\n  connectRj(\n    rjThird,\n    state => ({ third: state.data }),\n    ({ run }) => ({ loadThird: run })\n  )\n)(MySuperCoolComponent)\n")))}m.isMDXComponent=!0}}]);