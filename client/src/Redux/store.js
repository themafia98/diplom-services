import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import Request from '../Models/Rest';
import { clientDB } from '../Models/ClientSideDatabase';
import Schema from '../Models/Schema';
import combineReducers from './reducers';

const schema = new Schema('no-strict');
/** For devtools */
const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && process.env.NODE_ENV !== 'production'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const middleware = composeEnhancers(
  /** @Include moddleware */
  applyMiddleware(thunk.withExtraArgument({ schema, Request, clientDB })),
);

const store = createStore(combineReducers, middleware);
export default store;
