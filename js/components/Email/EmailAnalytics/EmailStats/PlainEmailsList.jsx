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
    this.cellRenderer = ({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest});
    window.onresize = () => {
      if (this._list) {
        cache.clearAll();
        this._list.recomputeRowHeights();
      }
    };
  }

  componentDidMount() {
    console.log('weeeeeee');
    setTimeout(_ => {
      if (this._list) {
        console.log('hiiiiiiii');
        cache.clearAll();
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

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const rightNow = new Date();
    const email = this.props.emails[index];
    const renderNode = new Date(email.sendat) > rightNow ?
    <ScheduledEmailItem key={`email-analytics-${index}`} {...email}/> :
    <AnalyticsItem key={`email-analytics-${index}`} {...email}/>;

    return (
      <div style={style} key={key}>
      {renderNode}
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
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
              deferredMeasurementCache={cache}
              rowCount={props.emails.length}
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


const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PlainEmailsList);
