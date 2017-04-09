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
      <div style={{marginTop: 25}}>
        <div style={{margin: '10px 0', color: !isClosed ? grey600 : grey700}} className='vertical-center'>
          <Link style={{textDecoration: 'none'}} to={`/emailStats/charts?date=${reformatDatestring(datestring)}`}>
            <span className='hoverGray' style={{fontSize: '1.2em'}}>Sent on {datestring}</span>
          </Link>
          <IconButton
          tooltip='Collapse'
          tooltipPosition='top-right'
          iconStyle={{width: 14, height: 14, fontSize: '14px', color: grey600}}
          style={{width: 28, height: 28, padding: 7, margin: '0 5px'}}
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

export default EmailDateContainer;
