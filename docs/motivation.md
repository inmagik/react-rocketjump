---
id: motivation
title: Motivation
---

## Why React-Rocketjump?
The journey of React-RocketJump started in 2018 under the name of Redux-Rocketjump, when React had still no hooks and Redux was the greatest tool for state management.Redux is pretty good in doing his job, but it has a great problem: verbosity.

Actions’ and reducers’ definitions can require many lines of code (if you care about readability, of course), and this usually ends up in writing code via copy - paste - adapt. Moreover, there are recurrent patterns, like pagination, which are not straightforward to implement starting from scratch and that are needed in a great number of projects. Again, this ends up in copypasting stuff, which is, at the end, a bad practice.

Redux-RocketJump tries to bridge this gap promoting better code organization and automating common tasks without losing control of what you are doing. In detail, it focuses on

* generating all you need for state management (actions, reducers, side effect management) from a single function call
* easing out extension and composition of common data-related patterns
* organizing redux folders by functionality instead of by type

Redux-RocketJump helps in this scenario, providing tools to reduce verbosity and reuse functionalities across composition. In detail, Redux-RocketJump focuses on

* generating all you need for state management (actions, reducers, side effect management) from a single function call
* easing out extension and composition of common data-related patterns
* organizing redux folders by functionality instead of by type

While Redux-Rocketjump is still in many cases a good solution, there are still some limitations, mainly due to Redux itself. In effect, Redux mantains a unique, monolithic, global state objects, which is through in various gateways (called connected components) spread in the application. Using Redux-Rockejump in our projects, we realized that the global state was not the ideal fitting for Redux-Rocketjump. In particular, since state is unique and monolithic and each RocketJump is bound to a subtree in the state, it was not possible to use a RocketJump to store two entities without duplicating it or relying on a list-based storage.

React-Rocketjump has been designed starting from Redux-Rocketjump and trying to instill in it our daily usage experience. React-Rocketjump is as powerful as our good old Redux-Rocketjump, but much more flexible: state management is no more monolithic, but distributed, and each component encapsulates its state. This is possible because we can now leverage the full power of React Hooks API, which allows to write powerful yet local code.

## When should I use React-Rocketjump?
React-Rocketjump is great in managing side effects of any type you could think of, especially with REST api integration. The tools provided by React-Rocketjump will help you integrate custom side effects inside React Components. Usually, the challanges that asynchronous tasks (or side effects) bring to React components are
* task management
  * starting a task
  * being able to cancel it before completion
  * being notified when it ends
  * keeping its result as long as we need it
* quickly setup an action-reducer based state management
  * create a state
  * define actions
  * create the reducer
  * create memoized selectors
* managing side-effects scheduling
  * enqueue tasks
  * keep only last invocation of a task
  * keep all the invocations of a task
  * managing tasks groups

## What about Redux-Rocketjump?
Redux-Rocketjump is still mantained and widely useful when Redux is in the loop for other reasons, or when the benefits of a centralized state overcome its limitations. Moreover, you can use Redux-Rocketjump and React-Rocketjump side by side, so to take the best of both. Beware, however, to be coherent in the usage: if you use Redux-Rocketjump, include plugins from Redux-Rocketjump, and the same for React-Rocketjump. Mixing up a core library with the plugins of the other one will probably lead to unexpected and tricky results. 