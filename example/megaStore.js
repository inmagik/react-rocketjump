import { createStore, combineReducers } from 'redux'
import { TodosListState } from './pages/ReduxTodos/localstate'
import { UsersState } from './pages/DataTable/localstate'
import {
  GhUserState,
  GhUserStarsState,
  GhUserFollowersState,
} from './pages/GhProfile/localstate'
import { createReducer } from 'react-rocketjump/plugins/redux'

const rjReducer = createReducer([
  TodosListState,
  UsersState,
  GhUserState,
  GhUserStarsState,
  GhUserFollowersState,
])
const reducer = combineReducers({
  rj: rjReducer,
})

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store
