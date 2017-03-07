import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import {actions as stagingActions} from 'components/Email';

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].delivered)
  .filter(id => !state.stagingReducer[id].archived)
  .map(id => state.stagingReducer[id]);

  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.'
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchSentEmails()),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_OFFSET'});
      dispatch(stagingActions.fetchSentEmails());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailsList);
