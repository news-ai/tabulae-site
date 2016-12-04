import React from 'react';
import {connect} from 'react-redux';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import * as actions from '../actions';
import InfiniteScroll from '../../InfiniteScroll';

const ScheduledEmails = props => {
  return (
    <InfiniteScroll onScrollBottom={props.fetchEmails}>
      <div style={{margin: '30px 0'}}>
        {props.emails.map((email, i) =>
          <ScheduledEmailItem
          key={i}
          {...email}
          />)}
        {props.emails.length === 0 && <span>No emails scheduled for delivery.</span>}
      </div>
    </InfiniteScroll>);
};

const mapStateToProps = (state, props) => {
  const rightNow = new Date();
  const emails = state.stagingReducer.received
  .filter(id => !state.stagingReducer[id].delivered)
  .map(id => state.stagingReducer[id])
  .filter(email => new Date(email.sendat) > rightNow);
  return {emails};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(actions.fetchSentEmails()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScheduledEmails);
