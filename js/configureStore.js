import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers/rootReducer';


export default function configureStore() {
	const loggerMiddleware = createLogger();
	const createStoreWithMiddleware = (process.env.NODE_ENV === 'development') ?
	  applyMiddleware(
      thunk,
      loggerMiddleware
      )(createStore) :
	  applyMiddleware(thunk)(createStore);
	return createStoreWithMiddleware(rootReducer);
};
