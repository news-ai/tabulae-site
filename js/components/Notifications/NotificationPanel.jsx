import React from 'react';
import {connect} from 'react-redux';
import {grey300, grey700} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import EmailNotification from './EmailNotification';

const Notification = ({message}) => (
  <div className='vertical-center horizontal-center' style={{padding: 10, borderBottom: `1px dotted ${grey300}`}}>
    <span className='smalltext' style={{color: grey700}}>{message}</span>
  </div>
  );

const NotificationPanel = ({notifications}) => {
  console.log(notifications);
  return (
    <div style={{
      backgroundColor: '#ffffff',
      width: 250,
      minHeight: 30,
      maxHeight: 300
    }}>
    {
      notifications.map((message, i) => {
        switch (message.resourceName) {
          case 'email':
            return <EmailNotification key={`message-${i}`} {...message} />
          default:
            return <Notification {...message} />
        }
      })
    }

    {notifications.length === 0 &&
      <div className='vertical-center horizontal-center' style={{padding: 10}}>
        <span className='smalltext' style={{color: grey700}}>No new notifications.</span>
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
