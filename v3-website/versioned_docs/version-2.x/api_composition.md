---
id: api_composition
title: RocketJump Composition
sidebar_label: Composition
slug: /api-composition
---
RocketJumps can be merged!

As stated in the initial part of the API description, the `rj` constructor can take several arguments, each of which can be the result of a previous call (provided that the `effect` property was not set), a provided plugin, or a configuration object. Calling `rj` with several arguments is interpreted as a composition will.

```js
const rj1 = rj({ /* config 1 */ })

const rj2 = rj({ /* config 2 */ })

const __GENERATED__ = rj(
  rj1,
  rj2,
  {/* last config */ },
)
```

## How does composition work?
Consider the following example

```js
const rj0 = rj({ /* config R */ });
const rj1 = rj(rj0, { /* config O */ });
const rj2 = rj({ /* config C */ });
const final = rj(rj1, rj2, { /* config K */ });
```

The composition order goes from top to bottom and from left to right. Hence, in our example, we have the following composition order: `config R > config O > config C > config K`.

### Different composition strategies
Due to the wide variety of available configuration properties, it is not possible to define a global composition strategy. Instead, we can describe some composition strategies which describe how different properties are composed

#### Chain properties

> Chain properties are *actions* and *selectors*

Chain properties are so called because they are functions that are invoked in chain (i.e. the output of the previous one is the input of the second one) in composition order at composition time. The argument of the first call is the default value. At the end, the RocketJump Object will contain only the output of the last call.

In our example, let's pretend that all the four config objects (R, O, C, K) define the *actions* property. Composition works like this:
- the default action bag is generated
- the *actions* transform of `configR` is called with the default action bag as parameter, and its output merged with the default action bag to produce `tempActionBag1`
- the *actions* transform of `configO` is called with `tempActionBag1` as parameter, and its output is merged with `tempActionBag1` to create `tempActionBag2`
- - the *actions* transform of `configC` is called with `tempActionBag2` as parameter, and its output is merged with `tempActionBag2` to create `tempActionBag3`
- - the *actions* transform of `configK` is called with `tempActionBag3` as parameter, and its output is merged with `tempActionBag3` to create `tempActionBag4`
- `tempActionBag4` is the final action bag

#### Recursive properties

> Recursive properties are *reducer*, (*composeReducer*), *effectCaller*

Recursive properties are so called because they involve runtime function composition: the final value is a function which is the mathematical composition of the functions defined in the merged configurations in composition order.

*composeReducer* here is put in parenthesis because it is not involved directly in composition, being squashed onto the *reducer* property before composition starts (i.e. with respect to composition, there is no *composeReducer* property, but only *reducer*, which contains also all the composed reducers)

Let's pretend that all the four config objects (R, O, C, K) define the *reducer* property. Composition works like this:
- the default reducer is generated
- a new reducer is created by transforming the default reducer as stated in `configR` to create `tempReducer1`
- a new reducer is created by transforming `tempReducer1` as stated in `configO` to create `tempReducer2`
- a new reducer is created by transforming `tempReducer2` as stated in `configC` to create `tempReducer3`
- a new reducer is created by transforming `tempReducer3` as stated in `configK` to create `tempReducer4`
- `tempReducer4` is the final reducer

Let's pretend that all the four config objects (R, O, C, K) define the *effectCaller* property. Composition works like this:
- the default effectCaller is generated
- when the user triggers an effect run, the following things happen:
  - the `effectCaller` specified in `configR` is called, with its `effect` argument set to a fake effect function
  - when the fake effect function is called with `...args`, the `effectCaller` set in `configO` is called with `...args` and with a second fake effect function
  - when this second fake effect function is called with `...args`, the `effectCaller` set in `configC` is called with `...args` and with a third fake effect function
  - when this third fake effect function is called with `...args`, the `effectCaller` set in `configK` is called with `...args` and with a the default effect caller as its `effect` parameter

### Merged properties

> Merged property is only *computed*

Merged properties are merged using plain object assignment in composition order

### Overwrite properties

> Overwrite properties are *takeEffect*, *name*

Overwrite properties are not merged, the last configuration in composition order defining it wins