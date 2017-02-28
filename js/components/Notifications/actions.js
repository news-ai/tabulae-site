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
