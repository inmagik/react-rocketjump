# React-RocketJump

Rocketjump your react! Manage state and side effects like a breeze

[![Build Status](https://travis-ci.com/inmagik/react-rocketjump.svg?branch=master)](https://travis-ci.com/inmagik/react-rocketjump)
[![npm version](https://badge.fury.io/js/react-rocketjump.svg)](https://badge.fury.io/js/react-rocketjump)
[![codecov](https://codecov.io/gh/inmagik/react-rocketjump/branch/master/graph/badge.svg)](https://codecov.io/gh/inmagik/react-rocketjump)

React RocketJump is a flexible, customizable, extensible tool to help developers dealing with side effects and asynchronous code in React Applications

Benefits of using React RocketJump

- asynchronous code is managed locally in your components, without the need of a global state
- you can start a task and then cancel it before it completes
- the library detects when components are mounted or unmounted, so that no asynchronous code is run on unmounted components
- extensible (but already powerful) and composable ecosystem of plugins to manage the most common and challenging tasks

## Quick start

### Install

```shell
yarn add react-rocketjump
```

### Your first rocket jump!

```js
// (1) Import rocketjump (rj for friends)
import { rj } from 'react-rocketjump'

// (2) Create a RocketJump Object
export const TodosState = rj({
  // (3) Define your side effect
  // (...args) => Promise | Observable
  effect: () => fetch(`/api/todos`).then(r => r.json()),
})

// (4) And then use it in your component
import { useRunRj } from 'react-rocketjump'
const TodoList = props => {

  // Here we use object destructuring operators to rename actions
  //    this allows to avoid name clashes and to have more auto documented code
  const [{
    data: todos, // <-- The result from effect, null at start
    pending,     // <-- Is effect in pending? false at start
    error        // <-- The eventually error from side effect, null when side effect starts 
  }] = useRunRj(TodosState) // Run side effects on mount only

  return  (
    <>
      {error && <div>Got some troubles</div>}
      {pending && <div>Wait...</div>}
      <ul>
        {
          todos !== null &&
          todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  )
}
```

### Trigger side effects on values changes

```js
import { rj } from 'react-rocketjump'
export const TodosState = rj({
  effect: (username = 'all') => fetch(`/api/todos/${username}`).then(r => r.json()),
})

import { useRunRj } from 'react-rocketjump'
const TodoList = ({ username }) => {
  
  // Every time the username changes the effect re-run
  // the previouse effect will be canceled if in pending
  const [
    { data: todos, pending, error },
    {
      // run the sie effect
      run,
      // stop the side effect and clear the state
      clean,
      // stop the side effect
      cancel,
    }
  ] = useRunRj(TodosState, [username]) 
  
  // ...
}
```

### Trigger side effects when you want

```js
import { rj } from 'react-rocketjump'
export const TodosState = rj({
  effect: (username = 'all') => fetch(`/api/todos/${username}`).then(r => r.json()),
})

import { useEffect } from 'react' 
import { useRunRj } from 'react-rocketjump'
const TodoList = ({ username }) => {
  
  // useRj don't auto trigger side effects
  // Give you the state and actions generated from the RocketJump Object
  // is up to you to trigger sie effect
  // useRunRj is implement with useRj and useEffect to call the run action with your deps
  const [
    { data: todos, pending, error },
    { run }  
  ] = useRj(TodosState, [username]) 
  
  useEffect(() => {
    if (username) {
      run(username)
    }  
  }, [username])
   
  function onTodosReload() {
    // or with callbacks
    run
      // in callbacks is saftly to run side effects or set react state
      // because callbacks are automatic unregistred when TodoList unmount
      .onSuccess((todos) => {
        console.log('Reload Y todos!', todos)
      })
      .onFailire((error) => {
        console.error("Can't reload Y todos sorry...", error)
      })
      .run()
  }
  
  // ...
}
```

### Mutations
```js
import { rj } from 'react-rocketjump'
export const TodosState = rj({
  mutations: {
    // Give a name to your mutation
    addTodo: {
      // Describe the side effect
      effect: todo => fetch(`${API_URL}/todos`, {
        method: 'post',
        headers: {
         'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo),
       }).then(r => r.json()),
       // Describe how to update the state in respond of effect success
       // (prevState, effectResult) => newState
       updater: (state, todo) => ({
        ...state,
        data: state.data.concat(todo),
      })
    }
  },

  effect: (username = 'all') => fetch(`/api/todos/${username}`).then(r => r.json()),
})

import { useEffect } from 'react' 
import { useRunRj } from 'react-rocketjump'
const TodoList = ({ username }) => {
  const [
    { data: todos, pending, error },
    {
      run,
      addTodo, // <-- Match the mutation name
    }  
  ] = useRj(TodosState, [username]) 
   
  // Mutations actions works as run, cancel and clean
  // trigger the realted side effects and update the state using give updater
  function handleSubmit(values) {
    addTodo
      .onSuccess((newTodo) => {
        console.log('Todo added!', newTodo)
      })
      .onFailire((error) => {
        console.error("Can't add todo sorry...", error)
      })
      .run(values)
  }
  
  // ...
}
```

## Deep dive

The full documentation with many examples and detailed information is mantained at

[https://inmagik.github.io/react-rocketjump](https://inmagik.github.io/react-rocketjump)

Be sure to check it out!!

## Run example

You can find an example under [example](https://github.com/inmagik/react-rocketjump/tree/master/example), it's a simple REST todo app that uses the great [json-server](https://github.com/typicode/json-server) as fake API server.

To run it first clone the repo:

```shell
git clone git@github.com:inmagik/react-rocketjump.git
```

Then run:

```shell
yarn install
yarn run-example
```
