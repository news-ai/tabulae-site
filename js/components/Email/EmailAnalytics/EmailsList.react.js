// @flow
import React, {Component} from 'react';
import AnalyticsItem from './AnalyticsItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Collapse from 'react-collapse';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';

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
  dateOrder.map(datestring => {
    emailMap[datestring] = emailMap[datestring].sort((a, b) => b.opened - a.opened);
  });
  return {dateOrder, emailMap};
};

class EmailDateContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
  }

  render() {
    let {datestring, emailBucket, isClosed, onOpenClick} = this.props;
    const rightNow = new Date();
    return (
      <div style={{marginTop: 25}}>
        <div
        onClick={onOpenClick}
        style={{margin: '10px 0', color: !isClosed ? grey600 : grey700}} className='vertical-center pointer'>
          <span
          style={{fontSize: '1.2em'}}
          >{datestring}</span>
          <FontIcon
          color={grey600}
          style={{fontSize: '0.8em', margin: '0 5px'}}
          className={!isClosed ? 'fa fa-chevron-down' : 'fa fa-chevron-up'}/>
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

const placeholder = 'No emails scheduled for delivery.';

class EmailsList extends Component {
  constructor(props) {
    super(props);
    const {dateOrder, emailMap} = bucketEmailsByDate(this.props.emails);
    this.state = {
      dateOrder,
      emailMap,
      isClosedMap: {}
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    this._listCellMeasurerRef = this._listCellMeasurerRef.bind(this);
  }

  _listRef(ref) {
    this._list = ref;
  }

  _listCellMeasurerRef(ref) {
    this._listCellMeasurer = ref;
  }

  componentWillMount() {
    this.props.fetchEmails();
    // window.Intercom('trackEvent', 'checking_sent_emails', {route: window.location.pathname});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.listId !== nextProps.listId) this.props.fetchListEmails(nextProps.listId);
    if (this.props.emails.length !== nextProps.emails.length) {
      const {dateOrder, emailMap} = bucketEmailsByDate(nextProps.emails);
      this.setState({dateOrder, emailMap}, _ => {
        if (this._list) setTimeout(_ => {
          this._listCellMeasurer.resetMeasurements();
          this._list.recomputeRowHeights();
        }, 1000);
      });
    }
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const datestring = this.state.dateOrder[index];
    return (
      <div style={style} key={key}>
        <EmailDateContainer
        key={`email-date-${datestring}`}
        datestring={datestring}
        emailBucket={this.state.emailMap[datestring]}
        isClosed={this.state.isClosedMap[index]}
        onOpenClick={_ => this.setState({isClosedMap: Object.assign({}, this.state.isClosedMap, {[index]: !this.state.isClosedMap[index]})},
          _ => {
            console.log('RECOMPUTE');
            this._listCellMeasurer.resetMeasurements();
            this._list.recomputeRowHeights();
          })}
        />
      </div>);
  }

  render() {
    let style = {};
    const state = this.state;
    const props = this.props;
    if (this.props.containerHeight) style.height = props.containerHeight;

    return (
      <div>
      {props.refreshEmails &&
        <div className='vertical-center'>
          <div className='right'>
            <IconButton
            onClick={props.refreshEmails}
            iconStyle={{color: grey500}}
            className='right'
            iconClassName={`fa fa-refresh ${props.isReceiving ? 'fa-spin' : ''}`}
            />
          </div>
        </div>}
        <div style={style}>
        {this.state.dateOrder && this.state.dateOrder.length > 0 &&
          <WindowScroller>
          {({height, isScrolling, scrollTop}) =>
            <AutoSizer disableHeight>
              {({width}) =>
                <CellMeasurer
                ref={this._listCellMeasurerRef}
                cellRenderer={({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest})}
                columnCount={1}
                rowCount={state.dateOrder.length}
                width={width}
                >
                {({getRowHeight}) =>
                  <List
                  ref={this._listRef}
                  autoHeight
                  width={width}
                  height={height}
                  rowHeight={getRowHeight}
                  rowCount={state.dateOrder.length}
                  rowRenderer={this.rowRenderer}
                  scrollTop={scrollTop}
                  isScrolling={isScrolling}
                  />
                }
                </CellMeasurer>
              }
              </AutoSizer>
            }
          </WindowScroller>
        }
        {props.emails && props.emails.length === 0 &&
          <span style={{color: grey700, fontSize: '0.9em'}}>{props.placeholder || placeholder}</span>}
        </div>
      {props.isReceiving &&
        <div className='horizontal-center' style={{margin: '10px 0'}}>
          <FontIcon style={{color: grey400}} className='fa fa-spinner fa-spin'/>
        </div>}
        <div className='horizontal-center'>
          <IconButton
          tooltip='Load More'
          tooltipPosition='top-center'
          onClick={props.fetchEmails}
          iconClassName='fa fa-chevron-down'/>
        </div>
      </div>
      );
  }
}

export default EmailsList;
