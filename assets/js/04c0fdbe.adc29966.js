(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{121:function(e,t,n){"use strict";n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return j}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var u=o.a.createContext({}),p=function(e){var t=o.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=p(e.components);return o.a.createElement(u.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},m=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,c=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),l=p(n),m=r,j=l["".concat(c,".").concat(m)]||l[m]||b[m]||a;return n?o.a.createElement(j,i(i({ref:t},u),{},{components:n})):o.a.createElement(j,i({ref:t},u))}));function j(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,c=new Array(a);c[0]=m;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var u=2;u<a;u++)c[u]=n[u];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},65:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return i})),n.d(t,"toc",(function(){return s})),n.d(t,"default",(function(){return p}));var r=n(3),o=n(7),a=(n(0),n(121)),c={id:"connect_userj",title:"useRj",sidebar_label:"useRj",slug:"/connect-userj"},i={unversionedId:"connect_userj",id:"version-2.x/connect_userj",isDocsHomePage:!1,title:"useRj",description:"Generalities",source:"@site/versioned_docs/version-2.x/connect_userj.md",slug:"/connect-userj",permalink:"/react-rocketjump/docs/connect-userj",editUrl:"https://github.com/inmagik/react-rocketjump/edit/master/website/versioned_docs/version-2.x/connect_userj.md",version:"2.x",sidebar_label:"useRj",sidebar:"version-2.x/someSidebar",previous:{title:"Connecting RJ Objects",permalink:"/react-rocketjump/docs/connect-generalities"},next:{title:"useRunRj",permalink:"/react-rocketjump/docs/connect-userunrj"}},s=[{value:"Generalities",id:"generalities",children:[]},{value:"Basic usage",id:"basic-usage",children:[]}],u={toc:s};function p(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"generalities"},"Generalities"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"useRj")," is a React Hook that allows the instantiation of ",Object(a.b)("em",{parentName:"p"},"one")," RocketJump Object, which is then made available to the component. To instantiate more RocketJump objects in the same component, just invoke the hook once for each of them."),Object(a.b)("h2",{id:"basic-usage"},"Basic usage"),Object(a.b)("p",null,"The signature of the hook is"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"import { useRj } from 'react-rocketjump'\n\nconst Component = props => {\n  const [state, actions] = useRj(rjObject, mapStateToProps)\n}\n")),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"rjObject"),": output of the call to a ",Object(a.b)("inlineCode",{parentName:"p"},"RocketJump Constructor"),", refer to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/api-rj"},"defining RocketJump Objects")," section"),Object(a.b)("p",null,Object(a.b)("inlineCode",{parentName:"p"},"mapStateToProps")," is a function that is used to modify the shape of the state before returning it to the component. The role of this function is to extract information from the state and to shape it as needed by the component. To understand this function, you should read ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-state"},"working with state"),"."),Object(a.b)("p",null,"For what you can do with ",Object(a.b)("inlineCode",{parentName:"p"},"state")," refer to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-state"},"working with state"),", and for what you can do with ",Object(a.b)("inlineCode",{parentName:"p"},"actions")," to ",Object(a.b)("a",{parentName:"p",href:"/react-rocketjump/docs/usage-actions"},"working with actions")),Object(a.b)("p",null,"This is a very simple example of what you can expect when using this hook"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js"},"import { useRj } from 'react-rocketjump'\n\nconst Component = props => {\n  const [{ x }, { run: loadX }] = useRj(\n    rjObject,\n    (state, { getData }) => ({\n      x: getData(state),\n    }),\n  )\n\n  useEffect(() => {\n      // This actually triggers the side effect\n      //   and populates the x constant\n      loadX()\n  }, [])\n}\n")),Object(a.b)("blockquote",null,Object(a.b)("p",{parentName:"blockquote"},"Pro tip: you can use object destructuring to rename actions when using hooks. This allows to avoid name clashes with actions")))}p.isMDXComponent=!0}}]);