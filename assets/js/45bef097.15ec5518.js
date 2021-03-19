(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{122:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return d}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=o.a.createContext({}),u=function(e){var t=o.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=u(e.components);return o.a.createElement(c.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,i=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),p=u(n),b=r,d=p["".concat(i,".").concat(b)]||p[b]||m[b]||a;return n?o.a.createElement(d,l(l({ref:t},c),{},{components:n})):o.a.createElement(d,l({ref:t},c))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=b;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var c=2;c<a;c++)i[c]=n[c];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"},89:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return l})),n.d(t,"default",(function(){return c}));var r=n(3),o=(n(0),n(122));const a={id:"plugin_all",title:"Plugins",sidebar_label:"Introduction",slug:"/plugins"},i={unversionedId:"plugin_all",id:"version-2.x/plugin_all",isDocsHomePage:!1,title:"Plugins",description:"React-RocketJump ships with a set of plugins that can be used as out of the box solutions for common tasks. The creation and usage of plugins is heavily based on the composition features embedded in React-RocketJump.",source:"@site/versioned_docs/version-2.x/plugin_all.md",slug:"/plugins",permalink:"/react-rocketjump/docs/plugins",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/plugin_all.md",version:"2.x",sidebar_label:"Introduction",sidebar:"version-2.x/someSidebar",previous:{title:"Working with actions",permalink:"/react-rocketjump/docs/usage-actions"},next:{title:"List Plugin",permalink:"/react-rocketjump/docs/plugin-list"}},l=[],s={toc:l};function c({components:e,...t}){return Object(o.b)("wrapper",Object(r.a)({},s,t,{components:e,mdxType:"MDXLayout"}),Object(o.b)("p",null,"React-RocketJump ships with a set of plugins that can be used as out of the box solutions for common tasks. The creation and usage of plugins is heavily based on the composition features embedded in React-RocketJump."),Object(o.b)("p",null,"Plugins are usually implemented as ",Object(o.b)("inlineCode",{parentName:"p"},"RocketJump Partials")," that you use by composing them. This makes extremely easy to create new plugins: indeed, every RocketJump Partial is a plugin."),Object(o.b)("p",null,"We recommend you to read the documentation of the plugin(s) you are interested in to know more about the services it can offer and how to use it."),Object(o.b)("p",null,"The following plugins are available out of the box:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-list"},"List Plugin"),": tools for managing paginated state"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-plainlist"},"PlainList Plugin"),": tools for managing list-based state"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-listinsert"},"ListInsert Plugin"),": tools for easing out insertion of items in a list"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-listupdate"},"ListUpdate Plugin"),": tools for easing out updating operations on the items of a list"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-listdelete"},"ListDelete Plugin"),": tools for managing deletions of items from a list"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-map"},"Map Plugin"),": tools for organizing state like a map of substates"),Object(o.b)("li",{parentName:"ul"},Object(o.b)("a",{parentName:"li",href:"/react-rocketjump/docs/plugin-cache"},"Cache Plugin"),": tools for caching task outputs and avoid repeating invocations")))}c.isMDXComponent=!0}}]);