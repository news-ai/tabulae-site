import * as api from 'actions/api';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
alertify.set('notifier', 'position', 'top-right');

function notification(dispatch, args) {
  var notifications = JSON.parse(args.data);
  for (var i = notifications.length - 1; i >= 0; i--) {
    dispatch({type: 'RECEIVE_NOTIFICATION', message: notifications[i].message});
    alertify.notify(notifications[i].message, 'custom', 5, function() {});
  }
}

function log(argument) {
  console.log(argument);
}

export function fetchNotifications() {
  return dispatch => {
    return api.get('/users/me/token')
    .then(response => {
      const channel = new goog.appengine.Channel(response.token);
      const socket = channel.open();
      socket.onopen = log;
      socket.onmessage = args => notification(dispatch, args);
      socket.onerror = log;
      socket.onclose = log;
    });
  };
}


const socket = io('https://live-1.newsai.org:443');
export function setupNotificationSocket() {
  return (dispatch, getState) => {
    dispatch({type: 'REQUEST_SOCKET_TOKEN'});
    socket.on('connect', _ => {
      api.get('users/me/live-token')
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
        var notifications = msg;
        for (var i = 0; i < notifications.length; i++) {
          notifications[i].data = JSON.parse(notifications[i].data);
          console.log(notifications[i]);
        }
      }
    });

    socket.on('disconnect', function() {
      // Re-authenticate
      console.log('disconnected:', socket.connected);
    });

  }
}
