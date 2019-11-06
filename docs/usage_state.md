---
id: usage_state
title: Working with state
sidebar_label: Working with state
---
When you connect a RocketJump Object into a React Component, you get back two things: `state` and `actions`.

`state` is a state object managed by React RocketJump according to the effect you defined and the runs you triggered. You may access state in two ways:
- it might be returned as an object by a hook
- it might be spread into properties by a hoc

In both cases, what really matters is the shape of this state object.

The base state shape is the following:

```js
{
    data: any,          // Resolved value of the last (successful) execution - initially NULL
    error: any,         // Rejected error of the last (errorful) execution - initially NULL
    pending: false      // Flag stating if some run has yet to complete
}
```

There are various ways to transform the state shape before injecting it into a component

## Customizing the reducer
When creating a RocketJump Object you may set the *reducer* configuration option (or import a RocketJump Partial that defines it) to a reducer which shapes the state in a different way. You have to take into account the final state shape returned by your reducer in this case

Usually, if you customize the reducer, you will probably want to setup ad-hoc actions and selectors to work with it, since probably the default actions and values won't fit your shape if it is very different from the default

## Defining computed properties
When creating a RocketJump Object you may set the *computed* configuration option (or import a RocketJump Partial that defines it). In this case, the state shape is that of the shadow state created with computed properties.

## Using the mapStateToProps function
When connecting a RocketJump Object to a component, you always have available a `mapStateToProps` parameter, which allows you to pass a function. The signature of this function is

```
(state: Object, selectorBag: Object, computedState: Object) => state: Object
```

Differently from the previous options, this is a runtime (and not define-time) state transform function. Its parameters are:
- the state object, as shaped by the *reducer*
- the selector bag created during the definition of the RocketJump Object
- the shadow state computed using *computed* configuration properties

In this function hence you have all the elements to create a component-targeted state shape, as you can:
- directly expose state properties even if shadow state is defined
- apply selectors on state
- apply custom selectors on shadow state
- rename properties
- ...

## Sum up
1. The base state shape is defined by the *reducer* property at definition time
2. At instantiation time, the base state is generated with the *reducer*
3. If the *computed* configuration propery is set, the *shadow* state is generated accordingly starting from the base state
4. If no *mapStateToProps* is provided
   1. If a shadow state is defined, it is returned as `state` from the connection mechanism
   2. otherwise, the base state is returned
5. If a *mapStateToProps* function is defined, it is invoked and its output is returned as `state`
6. The way you access `state` depends on the connection mechanism
    - When using a HOC, state is spread among properties
    - When using a HOOK, state is returned as a plain object (you can access props or spread it, as you prefer)