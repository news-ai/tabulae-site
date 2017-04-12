import {initialState} from 'reducers/initialState';
import {assignToEmpty} from 'utils/assign';

function isFetchingReducer(state = initialState.isFetchingReducer, action) {
  if (window.isDev) Object.freeze(state);

  switch (action.type) {
    case 'IS_FETCHING':
      return assignToEmpty(state, {
        [action.resource]: assignToEmpty(state[action.resource], {
          [action.id]: true
        })
      });
    case 'IS_FETCHING_DONE':
      return assignToEmpty(state, {
        [action.resource]: assignToEmpty(state[action.resource], {
          [action.id]: false
        })
      });
    default:
      return state;
  }
}

export default isFetchingReducer;
