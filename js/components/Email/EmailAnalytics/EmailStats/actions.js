import {emailStatsConstant} from './constants';
import * as api from 'actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const emailStatsSchema = new Schema('emailStats');

export function fetchEmailStats() {
  const PAGE_LIMIT = 7;
  return (dispatch, getState) => {
    const OFFSET = getState().templateReducer.offset;
    if (OFFSET === null || getState().templateReducer.isReceiving) return;
    return api.get(`/emails/stats?limit=${PAGE_LIMIT}&offset=${OFFSET}`);
  };
}
