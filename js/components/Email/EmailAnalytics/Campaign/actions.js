import {campaignStatsConstant} from './constants';
import * as api from 'actions/api';
import {normalize, Schema, arrayOf} from 'normalizr';
const campaignStatsSchema = new Schema('campaignStats', {idAttribute: 'subject'});

export function fetchCampaignStats(limit = 7) {
  const PAGE_LIMIT = limit;
  return (dispatch, getState) => {
    const OFFSET = getState().campaignStatsReducer.offset;
    if (OFFSET === null || getState().campaignStatsReducer.isReceiving) return;
    dispatch({type: campaignStatsConstant.REQUEST, limit: PAGE_LIMIT});
    return api.get(`/emails/campaigns?limit=${PAGE_LIMIT}&offset=${OFFSET}`)
    .then(
      response => {
        const res = normalize(response, {data: arrayOf(campaignStatsSchema)});
        const newOffset = response.data.length < PAGE_LIMIT ? null : OFFSET + PAGE_LIMIT;
        return dispatch({
          type: campaignStatsConstant.RECEIVE,
          stats: res.entities.campaignStats,
          ids: res.result.data.reverse(),
          offset: newOffset
        });
      },
      error => dispatch({type: campaignStatsConstant.REQUEST_FAIL, error: error.message})
      );
  };
}
