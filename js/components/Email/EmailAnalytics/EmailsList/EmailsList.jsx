// @flow
import React, {Component} from 'react';
import InfiniteScroll from 'components/InfiniteScroll';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Collapse from 'react-collapse';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
// import EmailDateContainer from './EmailDateContainer.jsx';
import {fromJS} from 'immutable';
import AnalyticsItem from './AnalyticsItem.jsx';
import ScheduledEmailItem from './ScheduledEmailItem.jsx';
import Link from 'react-router/lib/Link';
import moment from 'moment-timezone';
import find from 'lodash/find';

const DEFAULT_SENDAT = '0001-01-01T00:00:00Z';
const cache = new CellMeasurerCache({fixedWidth: true});

const reformatEmails = (emails, prevDateOrder) => {
  if (!emails || emails.length === 0) return {dateOrder: [], emailMap: {}, reformattedEmails: []};
  const emailMap = emails.reduce((acc, email) => {
    const sendat = email.sendat === DEFAULT_SENDAT ? email.created : email.sendat;
    const datestring = new Date(sendat).toLocaleDateString();
    acc[datestring] = acc[datestring] ? [...acc[datestring], email] : [email];
    return acc;
  }, {});

  const dateOrder = Object.keys(emailMap)
  .map(date => new Date(date))
  .sort((a, b) => a > b ? -1 : a < b ? 1 : 0)
  .map(date => {
    const datestring = date.toLocaleDateString();
    const prevDateOrderObj = find(prevDateOrder, dateOrderObj => dateOrderObj.datestring === datestring);
    const isClosed = prevDateOrderObj ? prevDateOrderObj.isClosed : false;
    return {type: 'datestring', datestring, isClosed};
  });

  let reformattedEmails = [];
  dateOrder.map(dateOrderObj => {
    const sortedEmails = emailMap[dateOrderObj.datestring].sort((a, b) => b.opened - a.opened);
    reformattedEmails.push(dateOrderObj);
    if (!dateOrderObj.isClosed) {
      reformattedEmails = [...reformattedEmails, ...sortedEmails];
    }
  });
  return {dateOrder, emailMap, reformattedEmails};
}

const placeholder = 'No emails scheduled for delivery.';

const dividerStyles = {
  linkStyle: {textDecoration: 'none'},
  linkSpan: {fontSize: '1.2em'},
  iconButtonIcon: {width: 14, height: 14, fontSize: '14px', color: grey600},
  iconButton: {width: 28, height: 28, padding: 7, margin: '0 5px'},
  container: {marginTop: 25},
};

function reformatDatestring(datestring) {
  return moment(new Date(datestring)).format('YYYY-MM-DD');
}

const DatestringDivider = ({isClosed, datestring, onOpenClick}) => (
  <div style={{margin: '10px 0', marginTop: 15, color: !isClosed ? grey600 : grey700}} className='vertical-center'>
    <span style={dividerStyles.linkSpan}>Sent on {datestring}</span>
    <IconButton
    tooltip='Collapse'
    tooltipPosition='top-right'
    iconStyle={dividerStyles.iconButtonIcon}
    style={dividerStyles.iconButton}
    onClick={_ => onOpenClick(datestring)}
    iconClassName={!isClosed ? 'fa fa-chevron-down' : 'fa fa-chevron-up'}
    />
  </div>);

class EmailsList extends Component {
  constructor(props) {
    super(props);
    const {dateOrder, emailMap, reformattedEmails} = reformatEmails(this.props.emails);
    this.state = {
      dateOrder,
      emailMap,
      isClosedMap: {},
      reformattedEmails
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    this.onOpenContainer = this._onOpenContainer.bind(this);
    window.onresize = () => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    };
  }

  componentWillMount() {
    if (typeof this.props.fetchEmails === 'function') {
      this.props.fetchEmails();
    }
  }

  componentDidMount() {
    setTimeout(_ => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    }, 2000);
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _listRef(ref) {
    this._list = ref;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.listId !== nextProps.listId) this.props.fetchListEmails(nextProps.listId);
    if (!fromJS(this.props.emails).equals(fromJS(nextProps.emails))) {
      console.log('hit');
      const {dateOrder, emailMap, reformattedEmails} = reformatEmails(nextProps.emails, this.state.dateOrder);
      this.setState({reformattedEmails, dateOrder, emailMap}, _ => {
        if (this._list) {
          this._listCellMeasurer.resetMeasurements();
          this._list.recomputeRowHeights();
        }
      });
    }
  }

  _onOpenContainer(datestring) {
    const dateOrder = this.state.dateOrder.reduce((acc, dateOrderObj) => {
      if (dateOrderObj.datestring === datestring) acc.push(Object.assign({}, dateOrderObj, {isClosed: !dateOrderObj.isClosed}));
      else acc.push(dateOrderObj);
      return acc;
    }, []);
    let reformattedEmails = [];
    dateOrder.map(dateOrderObj => {
      const sortedEmails = this.state.emailMap[dateOrderObj.datestring];
      reformattedEmails.push(dateOrderObj);
      if (!dateOrderObj.isClosed) {
        reformattedEmails = [...reformattedEmails, ...sortedEmails];
      }
    });
    this.setState({dateOrder, reformattedEmails}, _ => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    });
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const node = this.state.reformattedEmails[index];
    const rightNow = new Date();
    let renderNode;
    if (node.type === 'emails') {
      const email = node;
      renderNode = new Date(email.sendat) > rightNow ?
        <ScheduledEmailItem isScrolling={isScrolling} key={`email-analytics-${index}`} {...email}/> :
        <AnalyticsItem isScrolling={isScrolling} key={`email-analytics-${index}`} {...email}/>;
    } else {
      renderNode = <DatestringDivider onOpenClick={this.onOpenContainer} {...node} />;
    }
    return (
      <div style={style} key={key}>
        {renderNode}
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
        <WindowScroller>
        {({height, isScrolling, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <List
              ref={this._listRef}
              autoHeight
              width={width}
              height={height}
              rowHeight={cache.rowHeight}
              rowCount={state.reformattedEmails.length}
              deferredMeasurementCache={cache}
              rowRenderer={rowProps => (
                <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={rowProps.key}
                parent={rowProps.parent}
                rowIndex={rowProps.rowIndex}
                >
                {this.rowRenderer(rowProps)}
                </CellMeasurer>)
              }
              scrollTop={scrollTop}
              isScrolling={isScrolling}
              />
            }
            </AutoSizer>
          }
        </WindowScroller>
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
          onClick={_ => {
            window.Intercom('trackEvent', 'load_more_emails');
            mixpanel.track('load_more_emails');
            props.fetchEmails();
          }}
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
