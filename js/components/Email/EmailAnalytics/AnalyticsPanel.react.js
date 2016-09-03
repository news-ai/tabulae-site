import React, { PropTypes } from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import {deepOrange100, deepOrange700, deepOrange900, grey50} from 'material-ui/styles/colors';

const styles = {
  analytics: {
    margin: '10px',
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    padding: '5px',
    border: '1px gray solid',
    borderRadius: '1.2em',
    margin: '5px',
    backgroundColor: grey50
  }
};

function CountView({label, count, iconName}) {
  return (
      <Chip>
        <Avatar size={30}>{count}</Avatar>
        {label} <i className={iconName} aria-hidden='true'/>
      </Chip>
    );
}

function AnalyticsPanel({opened, clicked, to, subject, bounced, bouncedreason}) {
  const wrapperStyle = bounced ? Object.assign({}, styles.wrapper, {backgroundColor: deepOrange100}) : styles.wrapper;
  return (
    <div style={wrapperStyle}>
      <div className='email-analytics row' style={styles.analytics}>
        <div className='three columns'>
          <span style={{
            color: 'gray',
            fontSize: '0.8em',
            alignSelf: 'flex-start',
            marginRight: '5px'
          }}>To</span>
          <span>{to.substring(0, 30)} {to.length > 20 ? `...` : null}</span>
        </div>
        <div className='six columns'>
          <span style={{fontWeight: 'bold'}}>{subject.substring(0, 30)} {subject.length > 20 ? `...` : null}</span>
          {bounced ? <span style={{color: deepOrange700, float: 'right'}}>email bounced {bouncedreason}</span>: null}
          {bouncedreason ? <p style={{color: deepOrange900}}>{bouncedreason}</p> : null}
        </div>
        <div className='two columns'>
          {!bounced ? <CountView label='Opened' count={opened} iconName='fa fa-paper-plane-o fa-lg' /> : null}
        </div>
        <div className='two columns'>
          {!bounced ? <CountView label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o fa-lg'/> : null}
        </div>
      </div>
    </div>
    );
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
