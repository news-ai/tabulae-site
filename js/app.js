/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code. Routes are configured at the end of this file!
 *
 */

// Load the ServiceWorker, the Cache polyfill, the manifest.json file and the .htaccess file
import 'file?name=[name].[ext]!../serviceworker.js';
import 'file?name=[name].[ext]!../manifest.json';
import 'file?name=[name].[ext]!../.htaccess';

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/serviceworker.js').then(() => {
//     // Registration was successful
//   }).catch(() => {
//     // Registration failed
//   });
// } else {
//   // No ServiceWorker Support
// }

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';
import configureStore from './configureStore';

// Import the pages
import HomePage from './components/pages/HomePage.react';
import NotFound from './components/pages/NotFound.react';
import App from './components/App.react';
import ListManager from './components/pages/ListManager.react';
import Table from './components/pages/Table.react';
import NewTable from './components/pages/NewTable.react';
import Archive from './components/pages/Archive.react';
import EmailPanel from './components/pieces/EmailPanel.react';

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

const store = configureStore();

window.TABULAE_API_BASE = `https://tabulae.newsai.org/api`;

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default;
    store.replaceReducer(nextRootReducer);
  });
}

ReactDOM.render(
  <Provider store={store}>
      <Router onUpdate={() => window.scrollTo(0, 0)} history={createHistory()}>
        <Route path='/' name='Home' component={App}>
          <IndexRoute component={ListManager} />
            <Route path='lists' name='List Manager' component={ListManager}>
          </Route>
          <Route path='lists/new' name='New Sheet' component={NewTable} />
          <Route path='lists/:listId' staticName={true} name='Sheet' component={Table} />
          <Route path='archive' name='Archive' component={Archive} />
          <Route path='email' name='Email' component={EmailPanel} />
          <Route path='*' component={NotFound} />
        </Route>
      </Router>
    </Provider>,
  document.getElementById('app')
);
