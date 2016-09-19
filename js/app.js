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
import {Provider} from 'react-redux';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import Router from 'react-router/lib/Router';
import browserHistory from 'react-router/lib/browserHistory';
import configureStore from './configureStore';

// Import the pages
import NotFound from './components/NotFound';
import App from './components/App.react';
import ListManagerContainer from './components/pages/ListManagerContainer.react';
import ArchiveContainer from './components/pages/ArchiveContainer.react';
import Table from './components/pages/Table.react';
import SearchBar from './components/Search/SearchBar.react';
import OnboardingWrapper from './components/OnboardingWrapper';
import {EmailAnalytics} from './components/Email';
import HandsOnTableStatic from './components/pieces/HandsOnTableStatic.react';

import intercomSetup from './chat';

import MultiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

const store = configureStore();

window.TABULAE_API_BASE = window.isDev ? `https://dev-dot-newsai-1166.appspot.com/api` : `https://tabulae.newsai.org/api`;

intercomSetup({app_id: 'ur8dbk9e'});


// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default;
    store.replaceReducer(nextRootReducer);
  });
}

// wrap components that we want onboarding to, pass down props like routes
const OnboardingTable = props => <OnboardingWrapper {...props}><Table /></OnboardingWrapper>;

ReactDOM.render(
  <MultiThemeProvider>
    <Provider store={store}>
        <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
          <Route path='/' name='Home' component={App}>
            <IndexRoute component={ListManagerContainer} />
              <Route path='lists' name='List Manager' component={ListManagerContainer}>
            </Route>
            <Route path='lists/:listId' staticName name='Sheet' component={OnboardingTable} />
            <Route path='lists/:listId/static' staticName name='Printable Sheet' component={HandsOnTableStatic} />
            <Route path='archive' name='Archive' component={ArchiveContainer} />
            <Route path='emailstats' name='Email Analytics' component={EmailAnalytics} />
            <Route path='emailstats/:listId' name='Email Analytics' component={EmailAnalytics} />
            <Route path='search' name='Search' component={SearchBar} />
            <Route path='*' component={NotFound} />
          </Route>
        </Router>
      </Provider>
    </MultiThemeProvider>,
  document.getElementById('app')
);
