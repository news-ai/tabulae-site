import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import * as actions from '../actions';

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);

  const emails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].delivered)
  .filter(id => !state.stagingReducer[id].archived)
  .map(id => state.stagingReducer[id])
  .filter(email => email.listid === listId);
  return {
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(actions.fetchListEmails(props.params.listId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailsList);
