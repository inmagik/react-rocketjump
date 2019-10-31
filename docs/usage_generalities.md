---
id: usage_generalities
title: Connecting RJ Objects
sidebar_label: Generalities
---
Connecting a RocketJump Object within a React component means:

- creating a state object to hold the result of the task
- creating selectors for easy access to the state object
- instantiating a reducer to manage the state object
- creating action creators to manage the task and the state object
- start a side effect pipeline

Once a RockerJump Object is connected to a component, you get back two useful objects
- the `state` object, which contains data produced by your side effect
- the `action` bag, which contains a bunch of action dispatchers you can use to control the RocketJump object

You can read more about `state` and `action` in the following section, now let's focus with the main alternatives the library offers to connect the *rocketjump* world and the *react* world

You can choose several options to instantiate a RocketJump Object:
- [useRj hook](usage_userj.md), which is the most simple (and most customizable)
- [useRunRj hook](usage_userunrj.md), which is a very descriptive and powerful solution for many common cases
- [connectRj HOC](usage_connectrj.md), which is a legacy solution to work with class based components
