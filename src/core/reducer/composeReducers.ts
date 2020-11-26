import { Reducer, Last } from '../types'

function composeReducers<R extends Reducer[]>(...reducers: R): Last<R>

function composeReducers<R extends Reducer[]>(...reducers: R): Reducer {
  return (prevState, action) =>
    reducers.reduce(
      (nextState, reducer) => reducer(nextState, action),
      prevState
    )
}

export default composeReducers
