import React, { PropTypes } from 'react';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';

const styles = {
  analytics: {
    margin: '10px',
    border: '1px black solid'
  },
};

function CountView({label, count, iconName}) {
  return (
    <Badge
    badgeContent={count}
    secondary
    badgeStyle={{top: 10, right: 10}}
    >
      <IconButton iconClassName={iconName} tooltip={label} />
    </Badge>
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
        <CountView label='Opened' count={opened} iconName='fa fa-paper-plane-o fa-fw' />
      </div>
      <div className='two columns'>
        <CountView label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o fa-fw'/>
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
