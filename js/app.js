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
import ListManagerContainer from './components/Lists/ListManagerContainer.react';
import TagListsContainer from './components/Lists/TagListsContainer.react';
import ArchiveContainer from './components/Lists/ArchiveContainer.react';
import PublicListsContainer from './components/Lists/PublicListsContainer.react';
import Table from './components/pages/Table.react';
import SearchBar from './components/Search';
import OnboardingWrapper from './components/OnboardingWrapper';
import {EmailAnalytics} from './components/Email';
import HandsOnTablePrintable from './components/pieces/HandsOnTablePrintable.react';
import HandsOnTablePatchOnly from './components/pieces/HandsOnTablePatchOnly.react';
import ContactProfile from './components/ContactProfile';
import ListTable from './components/ListTable';
import ListFetchingContainer from './components/ListTable/ListFetchingContainer.react';
import UserProfile from './components/UserProfile';
import ListFeed from './components/ListFeed';
import HeaderNaming from './components/HeaderNaming/HeaderNaming.react';
import ClientDirectories from './components/ClientDirectories/ClientDirectories.react';
import ClientDirectory from './components/ClientDirectories/ClientDirectory.react';

import enUS from 'antd/lib/locale-provider/en_US';

import LocaleProvider from 'antd/lib/locale-provider';
import MultiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

const store = configureStore();

window.TABULAE_API_BASE = window.isDev ? `https://dev-dot-newsai-1166.appspot.com/api` : `https://tabulae.newsai.org/api`;


// third-party services setups
if (!window.isDev) Raven.config('https://c6c781f538ef4b6a952dc0ad3335cf61@sentry.io/100317').install();


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
  <LocaleProvider locale={enUS}>
    <MultiThemeProvider>
      <Provider store={store}>
          <Router onUpdate={() => window.scrollTo(0, 0)} history={browserHistory}>
            <Route path='/' name='Home' component={App}>
              <IndexRoute component={ListManagerContainer} />
              <Route path='lists' name='List Manager' component={ListManagerContainer} />
              <Route key='lists/:listId/static' staticName name='Printable Sheet' component={HandsOnTablePrintable} />
              <Route path='tables/:listId' staticName name='Table'>
                <IndexRoute component={ListFetchingContainer}/>
                <Route path=':contactId' staticName name='Profile' component={ContactProfile} />
              </Route>
              <Route path='lists/:listId' staticName name='List'>
                <IndexRoute component={OnboardingTable}/>
                <Route path=':contactId' staticName name='Profile' component={ContactProfile} />
              </Route>
              <Route path='tags/:tag' staticName name='Tag Search' component={TagListsContainer}/>
              <Route path='clients' staticName name='Clients' component={ClientDirectories}>
                <Route path=':clientname' component={ClientDirectory}/>
              </Route>
              <Route path='listfeeds/:listId' staticName name='List Feed' component={ListFeed} />
              <Route path='headersnaming/:listId' staticName name='Header Naming' component={HeaderNaming} />
              <Route path='archive' name='Archive' component={ArchiveContainer} />
              <Route path='public' name='Public Lists' component={PublicListsContainer} />
              <Route path='settings' name='Profile Settings' component={UserProfile} />
              <Route path='emailstats' name='Sent Emails' component={EmailAnalytics} />
              <Route path='emailstats/:listId' name='Email Analytics' component={EmailAnalytics} />
              <Route path='search' name='Search' component={SearchBar} />
              <Route path='search/table' name='Temp Table from Search' component={HandsOnTablePatchOnly} />
              <Route path='*' staticName name='Not Found' component={NotFound} />
            </Route>
          </Router>
        </Provider>
      </MultiThemeProvider>
    </LocaleProvider>,
  document.getElementById('app')
);
