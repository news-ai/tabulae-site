import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import AnalyticsItem from 'components/Email/EmailAnalytics/EmailsList/AnalyticsItem.jsx';
import ScheduledEmailItem from 'components/Email/EmailAnalytics/EmailsList/ScheduledEmailItem.jsx';

const fontIconStyle = {color: grey400};
const isReceivingContainerStyle = {margin: '10px 0'};
const iconButtonIconStyle = {color: grey600};
const placeholder = 'No emails found.';
const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 50
});

class PlainEmailsList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    window.onresize = () => {
      if (this._list) {
        console.log('hey');
        this._list.recomputeRowHeights();
      }
    };
  }

  componentDidMount() {
    setTimeout(_ => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    console.log('------');
    console.log(this.props.emails);
    console.log(nextProps.emails);
    if (this.props.emails.length !== nextProps.emails.length) {
      setTimeout(_ => this._list && this._list.recomputeRowHeights(), 1000);
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _listRef(ref) {
    this._list = ref;
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const rightNow = new Date();
    const email = this.props.emails[index];
    const renderNode = new Date(email.sendat) > rightNow ?
    <ScheduledEmailItem key={`email-analytics-${index}`} {...email}/> :
    <AnalyticsItem key={`email-analytics-${index}`} {...email}/>;

    return (
      <CellMeasurer
      cache={cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
      >
        <div style={style} key={key}>
        {renderNode}
        </div>
      </CellMeasurer>
      );
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <WindowScroller>
        {({height, isScrolling, onChildScroll, scrollTop}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <List
              ref={this._listRef}
              autoHeight
              width={width}
              height={height}
              rowHeight={cache.rowHeight}
              deferredMeasurementCache={cache}
              rowCount={props.emails.length}
              onScroll={onChildScroll}
              rowRenderer={this.rowRenderer}
              scrollTop={scrollTop}
              isScrolling={isScrolling}
              />
            }
            </AutoSizer>
          }
        </WindowScroller>
      {props.isReceiving &&
        <div className='horizontal-center' style={isReceivingContainerStyle}>
          <FontIcon style={fontIconStyle} className='fa fa-spinner fa-spin'/>
        </div>}
      {props.emails && props.emails.length === 0 &&
        <span style={styles.placeholder}>{props.placeholder || placeholder}</span>}
      {props.hasNext && !props.isReceiving &&
        <div className='horizontal-center'>
          <IconButton
          tooltip='Load More'
          tooltipPosition='top-center'
          onClick={props.fetchEmails}
          iconClassName='fa fa-chevron-down'
          iconStyle={iconButtonIconStyle}
          />
        </div>}
      </div>
      );
  }
}

const styles = {
  placeholder: {color: grey700, fontSize: '0.9em'},
};


export default PlainEmailsList;
