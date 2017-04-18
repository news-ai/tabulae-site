// @flow
import React, {Component} from 'react';
import InfiniteScroll from 'components/InfiniteScroll';
import AnalyticsItem from './AnalyticsItem.react';
import ScheduledEmailItem from './ScheduledEmailItem.react';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Collapse from 'react-collapse';
import {List, AutoSizer, CellMeasurer, WindowScroller} from 'react-virtualized';
import EmailDateContainer from './EmailDateContainer.react';

const DEFAULT_SENDAT = '0001-01-01T00:00:00Z';


const bucketEmailsByDate = (emails) => {
  if (!emails || emails.length === 0) return {dateOrder: [], emailMap: {}};

  const emailMap = emails.reduce((acc, email) => {
    const sendat = email.sendat === DEFAULT_SENDAT ? email.created : email.sendat;
    const datestring = new Date(sendat).toLocaleDateString();
    acc[datestring] = acc[datestring] ? [...acc[datestring], email] : [email];
    return acc;
  }, {});

  const dateOrder = Object.keys(emailMap)
  .map(date => new Date(date))
  .sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
  .map(date => date.toLocaleDateString());

  dateOrder.map(datestring => {
    emailMap[datestring] = emailMap[datestring].sort((a, b) => b.opened - a.opened);
  });

  return {dateOrder, emailMap};
};

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
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
  }

  componentWillMount() {
    if (this.props.fetchEmails) this.props.fetchEmails();
  }

  _listRef(ref) {
    this._list = ref;
  }

  _listCellMeasurerRef(ref) {
    this._listCellMeasurer = ref;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.listId !== nextProps.listId) this.props.fetchListEmails(nextProps.listId);
    if (this.props.emails.length !== nextProps.emails.length) {
      const {dateOrder, emailMap} = bucketEmailsByDate(nextProps.emails);
      this.setState({dateOrder, emailMap}, _ => {
        if (this._list) {
          this._listCellMeasurer.resetMeasurements();
          this._list.recomputeRowHeights();
        }
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
            iconStyle={styles.baseIcon}
            className='right'
            iconClassName={`fa fa-refresh ${props.isReceiving ? 'fa-spin' : ''}`}
            tooltip='Refresh'
            tooltipPosition='top-left'
            />
          </div>
        </div>
      }
        <div style={style}>
        {this.state.dateOrder && this.state.dateOrder.length > 0 &&
          <WindowScroller>
          {({height, isScrolling, scrollTop}) =>
            <AutoSizer disableHeight>
              {({width}) =>
                <CellMeasurer
                ref={this._listCellMeasurerRef}
                cellRenderer={this.cellRenderer}
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
          <span style={styles.placeholder}>{props.placeholder || placeholder}</span>}
        </div>
      {props.isReceiving &&
        <div className='horizontal-center' style={styles.loadingContainer}>
          <FontIcon style={styles.loadingIcon} className='fa fa-spinner fa-spin'/>
        </div>}
      {props.hasNext && !props.isReceiving &&
        <div className='horizontal-center'>
          <IconButton
          tooltip='Load More'
          tooltipPosition='top-center'
          onClick={props.fetchEmails}
          iconClassName='fa fa-chevron-down'
          iconStyle={styles.baseIcon}
          />
        </div>}
      </div>
      );
  }
}

const styles = {
  placeholder: {color: grey700, fontSize: '0.9em'},
  loadingIcon: {color: grey400},
  baseIcon: {color: grey600},
  loadingContainer: {margin: '10px 0'},
}

export default EmailsList;
