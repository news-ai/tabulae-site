import * as api from 'actions/api';
import alertify from 'alertifyjs';

import 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';

import 'node_modules/alertifyjs/build/css/alertify.min.css';
alertify.set('notifier', 'position', 'top-right');

// function notification(dispatch, args) {
//   var notifications = JSON.parse(args.data);
//   for (var i = notifications.length - 1; i >= 0; i--) {
//     dispatch({type: 'RECEIVE_NOTIFICATION', message: notifications[i].message});
//     alertify.notify(notifications[i].message, 'custom', 5, function() {});
//   }
// }

// function log(argument) {
//   console.log(argument);
// }

// export function fetchNotifications() {
//   return dispatch => {
//     return api.get('/users/me/token')
//     .then(response => {
//       const channel = new goog.appengine.Channel(response.token);
//       const socket = channel.open();
//       socket.onopen = log;
//       socket.onmessage = args => notification(dispatch, args);
//       socket.onerror = log;
//       socket.onclose = log;
//     });
//   };
// }


const socket = io('https://live-1.newsai.org:443');
export function setupNotificationSocket() {
  return (dispatch, getState) => {
    dispatch({type: 'REQUEST_SOCKET_TOKEN'});
    socket.on('connect', _ => {
      api.get('/users/me/live-token')
      .then(response => {
        const token = response.data.token;
        const person = getState().personReducer.person;
        const authDetails = {
          userId: person.id,
          authToken: token,
          teamId: person.teamid,
          page: window.TABULAE_HOME
        };
        dispatch({type: 'CONNECTED_TO_SOCKET'});
        socket.emit('auth', authDetails);
      })
    });

    socket.on('message', msg => {
      if (msg.type === 'auth') {
        if (msg.status === 'failure') {
          // TODO: dispatch action to handle socket failure
          console.log('Failed to authenticate');
        } else {
          // if need to emit auth stuff based on failure, do it here

        }
      } else {
        console.log(msg);
        msg.map(message => {
          dispatch({type: 'RECEIVE_NOTIFICATION', message})
          // alertify.notify(data, 'custom', 5, function() {});
        });
      }
    });

    socket.on('disconnect', function() {
      // Re-authenticate
      console.log('disconnected:', socket.connected);
    });
  }
}

// export const searchPublicationsEpic = action$ =>
//   action$.ofType('NOTIFICATION_SOCKET_RECEIVE')
//   .map(action => action.message)
//   .filter(msg => msg.type !== 'auth')
//   .switchMap(notifications =>
//      api.get(`/publications?q="${q}"`)
//     .then(response => normalize(response, {data: arrayOf(publicationSchema)})))
//   .flatMap(res => {
//     return [
//         {
//           type: publicationConstant.RECEIVE_MULTIPLE,
//           publications: res.entities.publications,
//           ids: res.result.data
//         },
//         {
//           type: 'SEARCH_PUBLICATION_RECEIVE',
//           received: res.result.data
//         }
//     ];
//   });
