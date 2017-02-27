import React from 'react';
import {connect} from 'react-redux';
import {grey200, grey700} from 'material-ui/styles/colors';

const Notification = ({message}) => (
  <div className='vertical-center horizontal-center' style={{padding: 10, borderBottom: `1px dotted ${grey200}`}}>
    <span style={{color: grey700, fontSize: '0.8em'}}>{message}</span>
  </div>);

const NotificationPanel = ({notifications}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      width: 250,
      minHeight: 30
    }}>
    {notifications.map((message, i) => <Notification key={`message-${i}`} message={message}/>)}
    {notifications.length === 0 &&
      <div className='vertical-center horizontal-center' style={{padding: 10}}>
        <span style={{color: grey700, fontSize: '0.8em'}}>No new notifications.</span>
      </div>}
    </div>
    );
};

const mapStateToProps = (state, props) => {
  return {
    notifications: state.notificationReducer.messages
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationPanel);
