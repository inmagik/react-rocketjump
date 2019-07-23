import preval from 'babel-plugin-preval/macro'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import React, { Suspense } from 'react'

const examples = preval`
  const fs = require('fs');
  module.exports = fs.readdirSync(__dirname + '/pages').filter(item => item[0] !== '.');
`
const lazyExamples = examples.map(example =>
  React.lazy(() => import(`./pages/${example}`))
)

const BackButton = () => (
  <div style={{ position: 'fixed', top: 5, left: 5, fontSize: 14 }}>
    <Link to="/">{'<- Back 2 examples'}</Link>
  </div>
)

function ListExamples() {
  return (
    <div>
      <h1>RJ examples</h1>~
      <ul>
        {examples.map((example, i) => (
          <li key={i}>
            <Link to={`/examples/${example}`}>{example}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ExamplePage({ match }) {
  const { example } = match.params

  const index = examples.indexOf(example)

  if (index === -1) {
    return null
  }

  const ExampleComponent = lazyExamples[index]

  return (
    <>
      <BackButton />
      <ExampleComponent />
    </>
  )
}

class Bond extends React.Component {
  // componentDidCatch(shit) {
  //   console.log('SHIT', shit)
  // }
  render() {
    return this.props.children
  }
}

export default function App() {
  return (
    <Router>
      <Bond>
        <Suspense fallback={<div>Loading ...</div>}>
          <Switch>
            <Route exact path="/" component={ListExamples} />
            <Route path="/examples/:example" component={ExamplePage} />
          </Switch>
        </Suspense>
      </Bond>
    </Router>
  )
}
