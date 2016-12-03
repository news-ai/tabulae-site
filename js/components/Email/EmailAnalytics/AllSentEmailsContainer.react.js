import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import * as actions from '../actions';

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].delivered)
  .filter(id => !state.stagingReducer[id].archived)
  .map(id => state.stagingReducer[id]);
  return {
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(actions.fetchSentEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailsList);
