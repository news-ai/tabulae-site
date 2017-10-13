import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import AnalyticsItem from 'components/Email/EmailAnalytics/EmailsList/AnalyticsItem.jsx';
import ScheduledEmailItem from 'components/Email/EmailAnalytics/EmailsList/ScheduledEmailItem.jsx';
import {fromJS} from 'immutable';

const fontIconStyle = {color: grey400};
const isReceivingContainerStyle = {margin: '10px 0'};
const iconButtonIconStyle = {color: grey600};
const placeholder = 'No emails found.';

class PlainEmailsList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => (this._list = ref);
    this._cache = new CellMeasurerCache({fixedWidth: true, minHeight: 10});
    window.onresize = () => {
      console.log('resize');
      this._cache.clearAll();
      if (this._list) this._list.recomputeRowHeights();
    }
  }

  componentDidMount() {
    this._cache.clearAll();
    if (this._list) this._list.recomputeRowHeights();
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _rowRenderer({key, index, isScrolling, style, parent}) {
    const rightNow = new Date();
    const email = this.props.emails[index];
    const renderNode = new Date(email.sendat) > rightNow ?
    <ScheduledEmailItem key={`email-analytics-${index}`} {...email} /> :
    <AnalyticsItem key={`email-analytics-${index}`} {...email} />;

    return (
      <CellMeasurer
      cache={this._cache}
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
        {({height, isScrolling, scrollTop, onChildScroll}) =>
          <AutoSizer disableHeight>
            {({width}) =>
              <List
              autoHeight
              ref={this.setRef}
              width={width}
              height={height}
              rowHeight={this._cache.rowHeight}
              deferredMeasurementCache={this._cache}
              rowCount={props.emails.length}
              rowRenderer={this.rowRenderer}
              overscanRowCount={15}
              scrollTop={scrollTop}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              />
            }
            </AutoSizer>
          }
        </WindowScroller>
      {props.isReceiving &&
        <div className='horizontal-center' style={isReceivingContainerStyle}>
          <FontIcon style={fontIconStyle} className='fa fa-spinner fa-spin' />
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


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PlainEmailsList);
