import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import InfiniteScroll from '../InfiniteScroll';
import * as stagingActions from '../Email/actions';
import AnalyticsItem from '../Email/EmailAnalytics/AnalyticsItem.react';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

class ContactEmails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchContactEmails(this.props.contactId);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchContactEmails(props.contactId)}>
        {props.emails.map((email, i) =>
          <AnalyticsItem
          key={i}
          {...email}
          />)}
          {props.emails
          && props.emails.length === 0
          && <div className='row' style={styleEmptyRow}><p>No Emails. Emails sent through Tabulae to this contact will be reflected here.</p></div>}
        </InfiniteScroll>
      );
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const emails = state.stagingReducer.received.map(id => state.stagingReducer[id])
  .filter(email => email.contactId === contactId)
  .map(email => {
    if (email.listid !== 0 && state.listReducer[email.listid]) {
      email.listname = state.listReducer[email.listid].name;
    }
    return email;
  });
  return {
    listId,
    contactId,
    emails,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchContactEmails: contactId => dispatch(stagingActions.fetchContactEmails(contactId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactEmails);