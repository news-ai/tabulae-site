// @flow
import React, {Component} from 'react';
import AnalyticsItem from './AnalyticsItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Collapse from 'react-collapse';

const bucketEmailsByDate = (emails) => {
  if (!emails || emails.length === 0) return {dateOrder: [], emailMap: {}};
  const firstDateString = new Date(emails[0].created).toLocaleDateString();
  let emailMap = {[firstDateString]: [emails[0]]};
  let dateOrder = [firstDateString];
  let dateMap = {[firstDateString]: true};
  let datestring;
  emails.map((email, i) => {
    if (i === 0) return null;
    datestring = new Date(email.created).toLocaleDateString();
    if (dateMap[datestring]) {
      emailMap = Object.assign({}, emailMap, {
        [datestring]: [...emailMap[datestring], email]
      });
    } else {
      dateMap[datestring] = true;
      dateOrder.push(datestring);
      emailMap = Object.assign({}, emailMap, {
        [datestring]: [email]
      });
    }
  });
  return {dateOrder, emailMap};
};

class EmailDateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
  }

  render() {
    const {datestring, emailBucket} = this.props;
    const rightNow = new Date();
    emailBucket.sort((a, b) => b.opened - a.opened);
    return (
      <div style={{marginTop: 25}}>
        <div
        onClick={_ => this.setState({open: !this.state.open})}
        style={{margin: '10px 0', color: this.state.open ? grey600 : grey700}} className='vertical-center pointer'>
          <span
          style={{fontSize: '1.2em'}}
          >{datestring}</span>
          <FontIcon
          color={grey600}
          style={{fontSize: '0.8em', margin: '0 5px'}}
          className={this.state.open ? 'fa fa-chevron-down' : 'fa fa-chevron-up'}/>
        </div>
        <Collapse isOpened={this.state.open}>
        {emailBucket && emailBucket.map((email, i) =>
          new Date(email.sendat) > rightNow ?
          <ScheduledEmailItem key={`email-analytics-${i}`} {...email}/> :
          <AnalyticsItem key={`email-analytics-${i}`} {...email}/>)}
        </Collapse>
      </div>);
  }
}

const placeholder = 'No emails scheduled for delivery.';

class EmailsList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmails();
    // window.Intercom('trackEvent', 'checking_sent_emails', {route: window.location.pathname});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.listId !== nextProps.listId) this.props.fetchListEmails(nextProps.listId);
  }

  render() {
    let style = {};
    if (this.props.containerHeight) style.height = this.props.containerHeight;

    const {dateOrder, emailMap} = bucketEmailsByDate(this.props.emails);
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchEmails}>
      {this.props.refreshEmails &&
        <div className='vertical-center'>
          <div className='right'>
            <IconButton
            onClick={this.props.refreshEmails}
            iconStyle={{color: grey500}}
            className='right'
            iconClassName={`fa fa-refresh ${this.props.isReceiving ? 'fa-spin' : ''}`}
            />
          </div>
        </div>}
        <div style={style}>
        {dateOrder.map((datestring) => (
          <EmailDateContainer
          key={`email-date-${datestring}`}
          datestring={datestring}
          emailBucket={emailMap[datestring]}
          />))}
        {this.props.emails && this.props.emails.length === 0 &&
          <span style={{color: grey700, fontSize: '0.9em'}}>{this.props.placeholder || placeholder}</span>}
        </div>
      {this.props.isReceiving &&
        <div className='horizontal-center' style={{margin: '10px 0'}}>
          <FontIcon style={{color: grey400}} className='fa fa-spinner fa-spin'/>
        </div>}
      </InfiniteScroll>
      );
  }
}

export default EmailsList;
