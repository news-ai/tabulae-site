import * as api from 'actions/api';
import alertify from 'alertifyjs';

import {loginConstant} from 'components/Login/constants';

import 'rxjs';
import {Observable} from 'rxjs';
import {normalize, Schema, arrayOf} from 'normalizr';

export const socket = io('https://live-1.newsai.org:443');

export const connectToSocket = (action$, store) =>
  action$.ofType(loginConstant.RECEIVE)
  .switchMap(({person}) => Observable.create(observable => {
    console.log('connecting to socket...');
    socket.on('connect', _ => {
      console.log('connect');
      observable.next({type: 'CONNECTED_TO_SOCKET', person})
    });
    socket.on('connect_error', _ => {
        console.log('connect error');
    });
    socket.on('message', msg => {
      console.log('message');
      if (msg.type === 'auth') {
        if (msg.status === 'success') {
          // success, do nothing

        } else if (msg.status === 'failure') {
          // TODO: dispatch action to handle socket failure
          console.log('Failed to authenticate');
          observable.next({type: 'REQUEST_SOCKET_TOKEN_ERROR'});
          observable.next({type: 'CONNECTED_TO_SOCKET'});
        } else {
          // if need to emit auth stuff based on failure, do it here
          observable.next({type: 'REQUEST_SOCKET_TOKEN_ERROR'});
          observable.next({type: 'CONNECTED_TO_SOCKET'});
        }
      } else {
        // console.log(msg);
        msg.map(message => observable.next({type: 'RECEIVE_NOTIFICATION', message}));
      }
    });
    socket.on('disconnect', function() {
      console.log('disconnected:', socket.connected);
    });
  }));

// const mockPromise = _ => new Promise((resolve, reject) => {
//   console.log('hit promise');
//   setTimeout(_ => {
//     console.log('REJECT');
//     reject('wha');
//   }, 2000);
// })

export const socketAuth = (action$, store) =>
  action$.ofType('CONNECTED_TO_SOCKET')
  .switchMap(({person}) =>
    Observable.merge(
      Observable.of({type: 'REQUEST_SOCKET_TOKEN'}),
      Observable.fromPromise(
        api.get('/users/me/live-token')
        // mockPromise()
        )
      .map(response => {
        console.log('connect to socket auth');
        const token = response.data.token;
        const authDetails = {
          userId: person.id,
          authToken: token,
          teamId: person.teamid,
          page: window.TABULAE_HOME
        };
        socket.emit('auth', authDetails);
        return {type: 'REQUEST_SOCKET_TOKEN_SUCCESS'};
      })
      )
      .retryWhen(err => {
        console.log('retry 5 times if hit socket auth error');
        let retries = 0;
        return err.delay(5000)
          .map(error => {
            if (retries++ === 5) throw error;
            return error;
          });
        })
      .catch(err => Observable.of({type: 'REQUEST_SOCKET_TOKEN_ERROR', message: err}))
    );

