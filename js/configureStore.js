import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers/rootReducer';


export default function configureStore() {
	const loggerMiddleware = createLogger();
	const createStoreWithMiddleware = (window.isDev) ?
	  applyMiddleware(
      thunk,
      loggerMiddleware
      )(createStore) :
	  applyMiddleware(thunk)(createStore);
	return createStoreWithMiddleware(rootReducer);
};
