import React from 'react';
import {connect} from 'react-redux';

const Notification = ({message}) => (
  <div className='vertical-center' style={{padding: '5px 0'}}>
    <span>{message}</span>
  </div>);

const NotificationPanel = ({notifications}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      width: 200
    }}>
    {notifications.map((message, i) => <Notification key={`message-${i}`} message={message}/>)}
    {notifications.length === 0 &&
      <div className='vertical-center horizontal-center' style={{padding: 10}}>
        <span>No notifications. Yay!</span>
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
