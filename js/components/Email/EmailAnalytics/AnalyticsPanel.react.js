import React, { PropTypes } from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const styles = {
  analytics: {
    margin: '10px',
    border: '1px black solid'
  },
};

function CountView({label, count, iconName}) {
  return (
      <Chip>
        <Avatar size={30}>{count}</Avatar>
        {label} <i className={iconName} aria-hidden='true'/>
      </Chip>
    );
}

function AnalyticsPanel({opened, clicked, to, subject}) {
  return (
    <div className='email-analytics row' style={styles.analytics}>
      <div className='five columns'>
        <span>{to.substring(0, 30)} {to.length > 20 ? `...` : null}</span>
      </div>
      <div className='three columns'>
        <span>{subject.substring(0, 30)} {subject.length > 20 ? `...` : null}</span>
      </div>
      <div className='two columns'>
        <CountView label='Opened' count={opened} iconName='fa fa-paper-plane-o fa-lg' />
      </div>
      <div className='two columns'>
        <CountView label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o fa-lg'/>
      </div>
    </div>);
}

AnalyticsPanel.PropTypes = {
  // id: PropTypes.number.isRequired,
  // to: PropTypes.string.isRequired,
  // subject: PropTypes.string.isRequired,
  // body: PropTypes.string.isRequired,
  // onSendEmailClick: PropTypes.func,
  // issent: PropTypes.bool.isRequired,
  // bounced: PropTypes.bool.isRequired,
  // bouncedreason: PropTypes.string,
  // clicked: PropTypes.number,
  // opened: PropTypes.number
};

export default AnalyticsPanel;
