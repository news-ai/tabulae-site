import React from 'react';
import {connect} from 'react-redux';
import ScheduledEmailItem from './ScheduledEmailItem.react';

const ScheduledEmails = ({emails}) => {
  return emails.length > 0 ? (
    <div className='large-12 medium-12 small-12 columns'>
      <div style={{margin: '20px 0'}}>
        <span style={{fontSize: '1.3em', marginRight: '10px'}}>Scheduled Emails</span>
      </div>
     {emails.map((email, i) =>
        <ScheduledEmailItem
        key={i}
        {...email}
        />)}
    </div>
  ) : null;
};

const mapStateToProps = (state, props) => {
  const rightNow = new Date();
  const emails = state.stagingReducer.received
  .filter(id => !state.stagingReducer[id].delivered)
  .map(id => {
    let email = state.stagingReducer[id];
    if (email.listid !== 0 && state.listReducer[email.listid]) email.listname = state.listReducer[email.listid].name;
    return email;
  })
  .filter(email => new Date(email.sendat) > rightNow);
  return {
    emails
  };
};

export default connect(mapStateToProps)(ScheduledEmails);
