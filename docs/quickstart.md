---
id: quickstart
title: Quick Start
sidebar_label: Quick Start
---
Ok, let's put our hands on! In this short tutorial, we'll write a simple todo list app using React-Rocketjump.

Before we can start, be sure to have setup a React project with React-Rocketjump [installed](installation.md)

## Creating the rocketjump object
Create a new file `state/index.js`, and put the following content

```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'

function makeAsyncCall() {
    return new Promise(resolve => {
        window.setTimeout(() => {
            resolve([
                { id: 1, caption: 'Create an async task', completed: true },
                { id: 2, caption: 'Make a rocketjump object', completed: true},
                { id: 3, caption: 'Connect the rocketjump object with your React component', completed: false },
                { id: 4, caption: 'Have fun with todos!', completed: false }
            ])
        }, Math.random() * 1000 + 500)
    })
}

export const TodosListState = rj(
  rjPlainList(),
  {
    effect: makeAsyncCall
  }
)
```

__What did we do?__

```js
import { rj } from 'react-rocketjump'
```
is importing the React-Rocketjump constructor in out file


```js
import rjPlainList from 'react-rocketjump/plugins/plainList'
```
is importing a plugin for managing lists

```js
function makeAsyncCall() {
    return new Promise(resolve => {
        window.setTimeout(() => {
            resolve([
                { id: 1, caption: 'Create an async task', completed: true },
                { id: 2, caption: 'Make a rocketjump object', completed: true},
                { id: 3, caption: 'Connect the rocketjump object with your React component', completed: false },
                { id: 4, caption: 'Have fun with todos!', completed: false }
            ])
        }, Math.random() * 1000 + 500)
    })
}
```
is the definition of the async task we want our rocketjump to manage. In this example we use a fake API, but since all is wrapped up in a `Promise` you can easily swap your own API in

```js
export const TodosListState = rj(
  rjPlainList(),
  {
    effect: makeAsyncCall
  }
)
```
is creating (and exporting) our RocketJump object, which is composed by the integration of the plain list plugin we imported beforehand and a custom configuration, where we simply describe the effect to wrap

## Creating the React component
Now we need a component capable of displaying todos. Create a `Todos.js` file with the following content

```js
import React, { Component } from 'react'

const Todo = ({ todo }) => (
  <div>
    <div style={{ display: 'flex' }}>
      <div className='todo-circle'>{todo.done ? '√' : ''}</div>
      <div className='todo-title'>{todo.title}</div>
    </div>
  </div>
)

class Todos extends Component {
  render() {
    const { todos } = this.props
    return (
      <div className='todos'>
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              key={todo.id}
              todo={todo}
            />
          ))}
        </div>
      </div>
    )
  }
}
```

## Empowering our component with RocketJump
The last thing we need to do is to endow our component with the superpowers of the RocketJump we created beforehand. Note that before we did not create a state object, but a rocketjump definition. The concrete state will be created when our definition is attached to a component.

So, start by importing our rocketjump definition and the connection utility provided by React-Rocketjump, by adding these lines at the top of the component file, just below the React import statement

```js
import { connectRj } from 'react-rocketjump'
import { TodosListState } from '../state'
```

Then, at the end of this file, create the connection (and export the connected component)

```js
export default connectRj(
  TodosListState,
  (state, { getList }) => ({
    todos: getList(state),
  }),
  ({ run, clean }) => ({
    loadTodos: run,
    unloadTodos: clean,
  })
)(Todos)

```
Redux users will find this construct familiar, since it behaves more or less like the `connect` primitive that ships with React-Redux.

With this statement, we are telling React-RocketJump to build a state object starting from `TodosListState` definition we imported.

The second parameter is a function called `mapStateToProps`, whose parameters are the state object and a bunch of selectors used to extract meaningful information from it. In this case, we want the list contained in the state, so we leverage the `getList` selector, but there are a bunch of them. If you are curious, head on to the API description.

The last but not least parameter is another function called `mapDispatchToProps`. In this function, we are deciding which action creator import in our component and under which name. In our example, we import the `run` action under the name `loadTodos` and the `clean` action under the name `unloadTodos`. `run` and `clean` are actions generated by the library, while `loadTodos` and `unloadTodos` are custom names. Action creators are just functions which trigger some behaviour from React-RocketJump: the `run` action triggers a side effect execution, while the `clean` action stops any pending execution and resets the state to the initial (empty) value.

The last tile needed to complete our mosaic is to use the props we defined in the Todos component. So, let's enrich it a little bit

```js
import React, { Component } from 'react'

const Todo = ({ todo }) => (
  <div>
    <div style={{ display: 'flex' }}>
      <div className='todo-circle'>{todo.done ? '√' : ''}</div>
      <div className='todo-title'>{todo.title}</div>
    </div>
  </div>
)

class Todos extends Component {

  componentDidMount() {
     this.props.loadTodos(); // Trigger the side effect when the component mounts
  }

  render() {
    const { todos } = this.props // Receive our todos in rendering function
    return (
      <div className='todos'>
        <div className='todo-list'>
          {todos && todos.map(todo => (
            <Todo
              key={todo.id}
              todo={todo}
            />
          ))}
        </div>
      </div>
    )
  }
}
```

## Well done
This is the starting point, React-RocketJump can do much more for you. Now you are ready to head on to the API documentation section to learn all the details to this rocket library! But first, some words on general concepts and best practices.
