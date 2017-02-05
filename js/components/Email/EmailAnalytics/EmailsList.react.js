import React, {Component} from 'react';
import AnalyticsItem from './AnalyticsItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import {grey400, grey600, grey700} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import Collapse from 'react-collapse';

const bucketEmailsByDate = (emails) => {
  if (emails.length === 0) return {dateOrder: [], emailMap: {}};
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
          <AnalyticsItem
          key={`email-analytics-${i}`}
          {...email}
          />)}
        </Collapse>
      </div>);
  }
}

class EmailsList extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchEmails();
  }

  render() {
    let style = {margin: '30px 0'};
    if (this.props.containerHeight) style.height = this.props.containerHeight;

    const {dateOrder, emailMap} = bucketEmailsByDate(this.props.emails);
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchEmails}>
        <div style={style}>
        {dateOrder.map((datestring) => (
          <EmailDateContainer
          key={`email-date-${datestring}`}
          datestring={datestring}
          emailBucket={emailMap[datestring]}
          />))}
        {this.props.emails.length === 0 &&
          <span>No emails scheduled for delivery.</span>}
        </div>
      {this.props.isReceiving &&
        <div className='horizontal-center'>
          <FontIcon style={{color: grey400}} className='fa fa-spinner fa-spin'/>
        </div>}
      </InfiniteScroll>
      );
  }
}

export default EmailsList;
