import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import EmailsList from './EmailsList.react';

const mapStateToProps = (state, props) => {
  const rightNow = new Date();
  const emails = state.stagingReducer.received
  .filter(id => !state.stagingReducer[id].delivered)
  .map(id => state.stagingReducer[id])
  .filter(email => new Date(email.sendat) > rightNow);
  return {
    emails,
    isReceiving: state.stagingReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchScheduledEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailsList);
