import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

/** stores for  jest */

export const initialState = {
  tabReducer: {
    parentSize: null,
    childrenSize: null,
    flag: false,
  },
  publicReducer: {
    status: 'online',
    prewStatus: 'online',
    requestError: null,
    caches: {},
  },
  router: {
    currentActionTab: 'mainModule',
    actionTabs: ['MainModule'],
    routeDataActive: {},
    routeData: {},
  },
};

const middlewares = [thunk.withExtraArgument({})]; /** test middlewares */
const mockStore = configureStore(middlewares); /** test config store */

const store = mockStore(initialState); /** init test store */

export default store;
