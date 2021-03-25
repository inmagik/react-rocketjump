(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{124:function(e,t,n){"use strict";n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return b}));var o=n(0),r=n.n(o);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=r.a.createContext({}),p=function(e){var t=r.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},l=function(e){var t=p(e.components);return r.a.createElement(u.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,i=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),l=p(n),m=o,b=l["".concat(i,".").concat(m)]||l[m]||d[m]||a;return n?r.a.createElement(b,c(c({ref:t},u),{},{components:n})):r.a.createElement(b,c({ref:t},u))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:o,i[1]=c;for(var u=2;u<a;u++)i[u]=n[u];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},95:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return u}));var o=n(3),r=(n(0),n(124));const a={id:"concepts",title:"General concepts",sidebar_label:"General concepts",slug:"/concepts"},i={unversionedId:"concepts",id:"version-2.x/concepts",isDocsHomePage:!1,title:"General concepts",description:"One RocketJump One Task",source:"@site/versioned_docs/version-2.x/concepts.md",slug:"/concepts",permalink:"/react-rocketjump/docs/concepts",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/concepts.md",version:"2.x",sidebar_label:"General concepts",sidebar:"version-2.x/someSidebar",previous:{title:"Quick Start",permalink:"/react-rocketjump/docs/quickstart"},next:{title:"RocketJump constructor",permalink:"/react-rocketjump/docs/api-rj"}},c=[{value:"One RocketJump One Task",id:"one-rocketjump-one-task",children:[]},{value:"RocketJump integration",id:"rocketjump-integration",children:[]},{value:"RocketJump composition",id:"rocketjump-composition",children:[]},{value:"Group code by functionality",id:"group-code-by-functionality",children:[]}],s={toc:c};function u({components:e,...t}){return Object(r.b)("wrapper",Object(o.a)({},s,t,{components:e,mdxType:"MDXLayout"}),Object(r.b)("h2",{id:"one-rocketjump-one-task"},"One RocketJump One Task"),Object(r.b)("p",null,"Each RocketJump object is designed to manage a single asynchronous task, with all the structure needed to ensure a proper execution. This means that you will end up defining a RocketJump object for each endpoint of your API. RocketJump objects are just blueprints, not actual state containers, so this does not lead to state centralization, but enables a high reuse of functionalities."),Object(r.b)("p",null,"This principle is applied consistently in all primitives. For instance, you cannot compose two RocketJump objects with two different tasks set: the setting of a task must happen only once for each RocketJump instance."),Object(r.b)("h2",{id:"rocketjump-integration"},"RocketJump integration"),Object(r.b)("p",null,"RocketJump are encapsulated units and not isolated units, so it is possible to implement some kind of communication among them. For each RocketJump, you can customize the ",Object(r.b)("inlineCode",{parentName:"p"},"reducer")," (i.e. the function responsible for deducing the next state from the previous one given the action that connects them) to handle other actions that are not part of the RocketJump core. In this way we can instruct a RocketJump that manages a list to react to some add operation. Hence, when the RocketJump devoted to the ",Object(r.b)("inlineCode",{parentName:"p"},"POST")," endpoint completes a task, you can trigger this add action on the former and update the list consequently."),Object(r.b)("h2",{id:"rocketjump-composition"},"RocketJump composition"),Object(r.b)("p",null,"We already dealt with composition in the tutorial, when we used ",Object(r.b)("inlineCode",{parentName:"p"},"rjPlainList")," to instruct our RocketJump about how to manage a list. RocketJump has been designed with composition and code reuse in mind, and so it has a strong composition behaviour. This allows to create plugins in order to customize the way we spawn tasks, their signature, the behaviour of the reducer and so on and so forth... RocketJump itself ships with a set of plugins used to deal with the most common data structures: lists and maps."),Object(r.b)("h2",{id:"group-code-by-functionality"},"Group code by functionality"),Object(r.b)("p",null,"RocketJumps can be defined and organized in many ways, and each company should be able to use custom policy. Our suggestion is to keep them in a ",Object(r.b)("inlineCode",{parentName:"p"},"state")," directory, one file for each ",Object(r.b)("inlineCode",{parentName:"p"},"resource")," managed by your ",Object(r.b)("inlineCode",{parentName:"p"},"REST api"),".\nThis allows to group together things that are related to the same endpoint, and that problably will use the same set of helpers and conventions to serialize and deserialize data over HTTP. Nothing forbids, however, to define RocketJump objects on the fly just near the component that needs them, it is only a matter of taste."))}u.isMDXComponent=!0}}]);