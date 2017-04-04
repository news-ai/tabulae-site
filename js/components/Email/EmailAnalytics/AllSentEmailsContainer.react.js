import {connect} from 'react-redux';
import EmailsList from './EmailsList.react';
import {actions as stagingActions} from 'components/Email';

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received.reduce((acc, id, i) => {
    if (state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].issent) {
      acc.push(state.stagingReducer[id]);
    }
    return acc;
  }, []);

  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.',
    hasNext: true
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
