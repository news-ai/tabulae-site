import {instagramDataConstant} from './constants';
import _ from 'lodash';

import {initialState} from '../../../../reducers/initialState';
import {assignToEmpty, canAccessReducer} from '../../../../utils/assign';
const types = _.values(instagramDataConstant);

function instagramDataReducer(state = initialState.instagramDataReducer, action) {
  if (window.isDev) Object.freeze(state);
  if (!canAccessReducer(action.type, types)) return state;

  let obj = assignToEmpty(state, {});
  let oldContact, filteredData;
  switch (action.type) {
    case instagramDataConstant.REQUEST_MULTIPLE:
      obj.isReceiving = true;
      obj.didInvalidate = false;
      return obj;
    case instagramDataReducer.RECEIVE_MULTIPLE:
      obj.isReceiving = false;
      obj.didInvalidate = false;
      return obj;
    case instagramDataConstant.REQUEST_MULTIPLE_FAIL:
      obj.isReceiving = true;
      obj.didInvalidate = true;
      return obj;
    case instagramDataConstant.REQUEST:
      obj.isReceiving = true;
      return obj;
    case instagramDataConstant.RECEIVE:
      oldContact = state[action.contactId] || {received: []};
      filteredData = action.data.filter(dataObj => !oldContact.received.some(dObj => dObj.CreatedAt === dataObj.CreatedAt));
      obj[action.contactId] = assignToEmpty(
        state[action.contactId], {
          received: [
            ...filteredData.reverse(),
            ...oldContact.received,
          ],
          offset: action.offset
        });
      obj.isReceiving = false;
      return obj;
    case instagramDataConstant.REQUEST_FAIL:
      obj.didInvalidate = true;
      return obj;
    default:
      return state;
  }
}

export default instagramDataReducer;
