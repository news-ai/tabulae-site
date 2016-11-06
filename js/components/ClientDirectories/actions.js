import * as constants from './constants';
import * as api from '../../actions/api';
// const listSchema = new Schema('lists');

export function fetchClientNames() {
  return dispatch => {
    dispatch({type: constants.CLIENT_NAMES_REQUEST});
    return api.get('/lists/clients')
    .then(response => dispatch({type: constants.CLIENT_NAMES_RECEIVED, clientnames: response.data.clients}))
    .catch(err => dispatch({type: constants.CLIENT_NAMES_REQUEST_FAIL, err}));
  };
}
