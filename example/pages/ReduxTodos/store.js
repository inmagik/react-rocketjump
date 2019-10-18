import { createStore, combineReducers } from 'redux'
import { TodosListState } from './localstate'
import { createReducer } from 'react-rocketjump/plugins/redux'

const rjReducer = createReducer([TodosListState])
const reducer = combineReducers({
  rj: rjReducer,
})

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store
