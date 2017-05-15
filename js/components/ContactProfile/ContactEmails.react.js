import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stagingActions from '../Email/actions';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';

class ContactEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmails();
  }

  render() {
    return (<EmailsList {...this.props}/>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const emails = state.stagingReducer.received.map(id => state.stagingReducer[id])
  .filter(email => email.contactId === contactId)
  .filter(email => email.issent)
  .filter(email => email.delivered);
  return {
    listId,
    contactId,
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchContactEmails(props.contactId)),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_CONTACT_OFFSET', contactId: props.contactId});
      dispatch(stagingActions.fetchContactEmails(props.contactId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactEmails);
