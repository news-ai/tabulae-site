import React, { PropTypes } from 'react';

const styles = {
  analytics: {
    margin: '10px'
  },
};

const button = {
  border: '1px solid black',
  display: 'inline-block',
  // alignItems: 'center',
  // justifyContent: 'center',
  borderRadius: '5px',
  padding: '2px'
};

function CountView({label, count}) {
  return (
    <div style={button}>
      <span style={{
        marginLeft: '3px',
        marginRight: '3px'
      }}>{label}</span>
      <span style={{
        marginLeft: '3px',
        marginRight: '3px'
      }}>{count}</span>
    </div>
    );
}
function AnalyticsPanel({opened, clicked, to}) {
  return (
    <div className='email-analytics' style={styles.analytics}>
      <CountView label='Opened' count={opened} />
      <CountView label='Clicked' count={clicked} />
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
