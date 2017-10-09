import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, AutoSizer, CellMeasurer, CellMeasurerCache, WindowScroller} from 'react-virtualized';
import {grey400, grey600, grey700, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AnalyticsItem from 'components/Email/EmailAnalytics/EmailsList/AnalyticsItem.jsx';
import ScheduledEmailItem from 'components/Email/EmailAnalytics/EmailsList/ScheduledEmailItem.jsx';
import OpenAnalytics from 'components/Email/EmailAnalytics/EmailsList/OpenAnalytics.jsx';
import LinkAnalytics from 'components/Email/EmailAnalytics/EmailsList/LinkAnalytics.jsx';
import StaticEmailContent from 'components/Email/PreviewEmails/StaticEmailContent.jsx';
import {fromJS} from 'immutable';

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
    console.log('PlainEmailsList');
    this.state = {
      dialogOpen: false,
      dialogContentType: undefined,
      dialogContentProps: {}
    };
    this.rowRenderer = this._rowRenderer.bind(this);
    this._listRef = this._listRef.bind(this);
    this.onDialogRequestClose = _ => this.setState({dialogOpen: false, dialogContentType: undefined});
    this.onDialogRequestOpen = _ => this.setState({dialogOpen: true});
    window.onresize = () => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    };
  }

  componentDidMount() {
    this.recomputeIntervalTimer = setInterval(_ => {
      if (this._list) {
        this._list.recomputeRowHeights();
      }
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props.emails);
    // console.log(nextProps.emails);
    if (!fromJS(this.props.emails).equals(fromJS(nextProps.emails))) {
      setTimeout(_ => {
        if (this._list) {
          this._list.recomputeRowHeights();
        }
      }, 1000);
      // setTimeout(_ => cache.clearAll(), 1000);
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
    clearInterval(this.recomputeIntervalTimer);
  }

  _listRef(ref) {
    this._list = ref;
  }

  _rowRenderer({key, index, isScrolling, isVisible, style}) {
    const rightNow = new Date();
    const email = this.props.emails[index];
    const renderNode = new Date(email.sendat) > rightNow ?
    <ScheduledEmailItem key={`email-analytics-${index}`} {...email} /> :
    <AnalyticsItem
    key={`email-analytics-${index}`}
        onOpenClick={_ => this.setState({
          dialogContentProps: {emailId: email.id, count: email.opened},
          dialogOpen: true,
          dialogContentType: 'open',
        })}
        onLinkClick={_ => this.setState({
          dialogContentProps: {emailId: email.id, count: email.clicked},
          dialogOpen: true,
          dialogContentType: 'click',
        })}
        onPreviewClick={emailProps => this.setState({
          dialogContentProps: emailProps,
          dialogOpen: true,
          dialogContentType: 'preview',
        })}
    {...email}
    />;

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

    let dialogContent = null;
    let dialogTitle = undefined;
    switch (state.dialogContentType) {
      case 'open':
        dialogContent = <OpenAnalytics {...state.dialogContentProps} />;
        dialogTitle = 'Open Timeline';
        break;
      case 'click':
        dialogContent = <LinkAnalytics {...state.dialogContentProps} />;
        dialogTitle = 'Link Click Count';
        break;
      case 'preview':
        dialogContent = <StaticEmailContent {...state.dialogContentProps} />;
        break;
    }
    return (
      <div>
        <Dialog
        autoScrollBodyContent
        title={dialogTitle}
        open={state.dialogOpen}
        onRequestClose={this.onDialogRequestClose}
        >
        {dialogContent}
        </Dialog>
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
