---
id: concepts
title: General concepts
sidebar_label: General concepts
slug: /concepts
---

## One RocketJump One Task
Each RocketJump object is designed to manage a single asynchronous task, with all the structure needed to ensure a proper execution. This means that you will end up defining a RocketJump object for each endpoint of your API. RocketJump objects are just blueprints, not actual state containers, so this does not lead to state centralization, but enables a high reuse of functionalities.

This principle is applied consistently in all primitives. For instance, you cannot compose two RocketJump objects with two different tasks set: the setting of a task must happen only once for each RocketJump instance.

## RocketJump integration
RocketJump are encapsulated units and not isolated units, so it is possible to implement some kind of communication among them. For each RocketJump, you can customize the `reducer` (i.e. the function responsible for deducing the next state from the previous one given the action that connects them) to handle other actions that are not part of the RocketJump core. In this way we can instruct a RocketJump that manages a list to react to some add operation. Hence, when the RocketJump devoted to the `POST` endpoint completes a task, you can trigger this add action on the former and update the list consequently.

## RocketJump composition
We already dealt with composition in the tutorial, when we used `rjPlainList` to instruct our RocketJump about how to manage a list. RocketJump has been designed with composition and code reuse in mind, and so it has a strong composition behaviour. This allows to create plugins in order to customize the way we spawn tasks, their signature, the behaviour of the reducer and so on and so forth... RocketJump itself ships with a set of plugins used to deal with the most common data structures: lists and maps.

## Group code by functionality
RocketJumps can be defined and organized in many ways, and each company should be able to use custom policy. Our suggestion is to keep them in a `state` directory, one file for each `resource` managed by your `REST api`.
This allows to group together things that are related to the same endpoint, and that problably will use the same set of helpers and conventions to serialize and deserialize data over HTTP. Nothing forbids, however, to define RocketJump objects on the fly just near the component that needs them, it is only a matter of taste.