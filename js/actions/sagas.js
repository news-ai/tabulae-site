import {
  REQUEST_PUBLICATION,
  RECEIVE_PUBLICATION,
} from '../constants/AppConstants';
import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { fetchPublication } from './api';


function* fetchPub(pubId) {
  yielf put({ type: REQUEST_PUBLICATION });
  const pub = yield call(fetchPublication, pubId);
  yield put({type: RECEIVE_PUBLICATION, publication: pub});
}

function* publicationSaga() {
  yield* takeEvery(REQUEST_PUBLICATION, fetchPub);
}

export default publicationSaga;