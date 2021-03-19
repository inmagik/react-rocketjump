(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{122:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var o=n(0),a=n.n(o);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,a=function(e,t){if(null==e)return{};var n,o,a={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=a.a.createContext({}),l=function(e){var t=a.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},u=function(e){var t=l(e.components);return a.a.createElement(p.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,i=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(n),d=o,m=u["".concat(i,".").concat(d)]||u[d]||b[d]||r;return n?a.a.createElement(m,c(c({ref:t},p),{},{components:n})):a.a.createElement(m,c({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,i=new Array(r);i[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:o,i[1]=c;for(var p=2;p<r;p++)i[p]=n[p];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},66:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return p}));var o=n(3),a=(n(0),n(122));const r={id:"api_connect",title:"Connecting RocketJumps",sidebar_label:"Connecting RocketJumps",slug:"/api-connect"},i={unversionedId:"api_connect",id:"version-2.x/api_connect",isDocsHomePage:!1,title:"Connecting RocketJumps",description:"mapStateToProps",source:"@site/versioned_docs/version-2.x/api_connect.md",slug:"/api-connect",permalink:"/react-rocketjump/docs/api-connect",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/api_connect.md",version:"2.x",sidebar_label:"Connecting RocketJumps"},c=[{value:"mapStateToProps",id:"mapstatetoprops",children:[]},{value:"mapActionsToProps",id:"mapactionstoprops",children:[]}],s={toc:c};function p({components:e,...t}){return Object(a.b)("wrapper",Object(o.a)({},s,t,{components:e,mdxType:"MDXLayout"}),Object(a.b)("h3",{id:"mapstatetoprops"},"mapStateToProps"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"(state, selectors, ownProps) => props")),Object(a.b)("p",null,"This function is used to gather values from the state, leveraging powerful selectors, and inject them in the component as props. When writing this function, you should treat the state as an opaque object, and rely on selectors to extract data from it. This allows to decouple the state shape and the code that needs data contained in the state."),Object(a.b)("p",null,"The ownProps object contains the props passed to the component from its parent, and can be accessed to write more direct bindings. When using ",Object(a.b)("inlineCode",{parentName:"p"},"useRj")," hook this parameter is not available (because props are already available in the context)"),Object(a.b)("p",null,"Predefined selectors included in the ",Object(a.b)("inlineCode",{parentName:"p"},"selectors")," bag are"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("strong",{parentName:"li"},"getData"),": returns the output of the last completed invocation of the task"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("strong",{parentName:"li"},"getError"),": returns the output of the last failed invocation of the task (if it failed, null otherwise)"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("strong",{parentName:"li"},"isPending"),": returns whether there is a pending invocation of the task")),Object(a.b)("p",null,"Plugins can add new selectors or change the behaviour of existing once, hence if you are using plugins refer to their documentation"),Object(a.b)("p",null,Object(a.b)("strong",{parentName:"p"},"Example")),Object(a.b)("p",null,"This example describes how to extract the output of the last task run and make it available to the component as a ",Object(a.b)("inlineCode",{parentName:"p"},"data")," prop."),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"const mapStateToProps = (state, selectors) => {\n  const x = selectors.getData(state)\n  return {\n    data: x,\n  }\n}\n")),Object(a.b)("h3",{id:"mapactionstoprops"},"mapActionsToProps"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"actions => props")),Object(a.b)("p",null,"This function is used to inject active props to your component, e.g. props that are functions. When you invoke one of this props, an action is dispatched to the store, and, if the action is constructed in a proper way, the async task is invoked."),Object(a.b)("p",null,"Predefined ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," bag contains"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"run"),": launches the task"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"cancel"),": cancels any pending instances of the task"),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"clean"),": cancels any pending instances of the task and resets the state to the original value")),Object(a.b)("p",null,"Plugins can add new actions or change the behaviour of existing ones, hence if you are using plugins refer to their documentation"),Object(a.b)("p",null,"This parameter is mainly intended to rename actions, with the aim of avoiding name clashes in properties (which would be a very common case when connecting two or more ",Object(a.b)("inlineCode",{parentName:"p"},"RocketJump Object")," instances to the same component). If you need to further customize actions, refer to the ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," configuration property when creating your ",Object(a.b)("inlineCode",{parentName:"p"},"RocketJump Object")," (you can find more info ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/api-rj"},"here"),")"),Object(a.b)("p",null,Object(a.b)("strong",{parentName:"p"},"Example")),Object(a.b)("p",null,"This example describes how to inject the ",Object(a.b)("inlineCode",{parentName:"p"},"run")," action in the ",Object(a.b)("inlineCode",{parentName:"p"},"loadTodos")," prop"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"const mapActionsToProps = ({ run }) => ({\n  loadTodos: run,\n})\n")))}p.isMDXComponent=!0}}]);