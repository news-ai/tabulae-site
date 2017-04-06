import React, {Component} from 'react';

import AnalyticsItem from './AnalyticsItem.react';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import {grey600, grey700} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import Collapse from 'react-collapse';
import Link from 'react-router/lib/Link';
import moment from 'moment-timezone';

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
        <div style={{margin: '10px 0', color: !isClosed ? grey600 : grey700}} className='vertical-center pointer'>
          <Link
          style={{fontSize: '1.2em', color: grey700}}
          to={`/emailStats/charts?date=${reformatDatestring(datestring)}`}
          >{datestring}</Link>
          <FontIcon
          color={grey600}
          onClick={onOpenClick}
          style={{fontSize: '0.8em', margin: '0 5px'}}
          className={!isClosed ? 'fa fa-chevron-down' : 'fa fa-chevron-up'}
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
