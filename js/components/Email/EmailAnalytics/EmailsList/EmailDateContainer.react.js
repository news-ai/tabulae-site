import React, {Component} from 'react';

import AnalyticsItem from './AnalyticsItem.react';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import {grey600, grey700} from 'material-ui/styles/colors';
import Collapse from 'react-collapse';
import Link from 'react-router/lib/Link';
import moment from 'moment-timezone';
import IconButton from 'material-ui/IconButton';

function reformatDatestring(datestring) {
  return moment(new Date(datestring)).format('YYYY-MM-DD');
}

class EmailDateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
  }

  render() {
    const {datestring, emailBucket, isClosed, onOpenClick} = this.props;
    const rightNow = new Date();
    return (
      <div style={styles.container}>
        <div style={{margin: '10px 0', color: !isClosed ? grey600 : grey700}} className='vertical-center'>
          <Link style={styles.link} to={`/emailstats/all?date=${reformatDatestring(datestring)}`}>
            <span className='hoverGray' style={styles.linkSpan}>{new Date(emailBucket[0].sendat) > rightNow ? 'Send' : 'Sent'} on {datestring}</span>
          </Link>
          <IconButton
          tooltip='Collapse'
          tooltipPosition='top-right'
          iconStyle={styles.iconButtonIcon}
          style={styles.iconButton}
          onClick={onOpenClick}
          iconClassName={!isClosed ? 'fa fa-chevron-down' : 'fa fa-chevron-up'}
          />
        </div>
        <Collapse isOpened={!isClosed}>
          {emailBucket.map((email, index) =>
            new Date(email.sendat) > rightNow ?
            <ScheduledEmailItem key={`email-analytics-${index}`} {...email}/> :
            <AnalyticsItem key={`email-analytics-${index}`} {...email}/>
            )}
        </Collapse>
      </div>);
  }
}

const styles = {
  linkStyle: {textDecoration: 'none'},
  linkSpan: {fontSize: '1.2em'},
  iconButtonIcon: {width: 14, height: 14, fontSize: '14px', color: grey600},
  iconButton: {width: 28, height: 28, padding: 7, margin: '0 5px'},
  container: {marginTop: 25},
};

export default EmailDateContainer;
