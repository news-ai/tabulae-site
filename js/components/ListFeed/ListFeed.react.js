import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';

import * as listfeedActions from './actions';
import * as actionCreators from '../../actions/AppActions';
import HeadlineItem from '../ContactProfile/Headlines/HeadlineItem.react';
import Tweet from '../ContactProfile/Tweets/Tweet.react';
import InstagramItem from '../ContactProfile/Instagram/InstagramItem.react';
import InfiniteScroll from '../InfiniteScroll';
import {List, CellMeasurer, WindowScroller, AutoSizer} from 'react-virtualized';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

const FEED_PADDING = 20;

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.state = {
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING,
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      firsttime: this.props.firstTimeUser
    }
    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING;
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.setState({screenWidth, screenHeight});
    }
  }

  componentWillMount() {
    this.props.fetchListFeed(this.props.listId);
    if (!this.props.list) this.props.fetchList(this.props.listId);
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.listfeed[index];
    let row;
    switch (feedItem.type) {
      case 'headlines':
        row = <HeadlineItem showProfile screenWidth={this.state.screenWidth} {...feedItem} />;
        break;
      case 'tweets':
        row = <Tweet showProfile screenWidth={this.state.screenWidth} {...feedItem} />;
        break;
      case 'instagrams':
        row = <InstagramItem showProfile screenWidth={this.state.screenWidth} {...feedItem} />;
        break;
      default:
        row = <HeadlineItem showProfile screenWidth={this.state.screenWidth} {...feedItem} />;
    }
    let newStyle = style;
    if (newStyle) newStyle.padding = '0 15px';
    return (
      <div key={key} style={newStyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <div style={{margin: 20}}>
              <span style={{fontWeight: 'bold'}}>List Feed</span> is a master feed all the attached social feeds and RSS feeds from all your contacts in a <span style={{fontWeight: 'bold'}}>Table</span>.
              Scroll down to check it out!
            </div>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <RaisedButton primary label='OK' onClick={_ => this.setState({firsttime: false}, _ => hopscotch.startTour(tour))}/>
            </div>
          </Dialog>
        }
        <div className='row horizontal-center' style={{marginTop: 20}}>
          <h4>{props.list ? props.list.name : 'List Feed'}</h4>
          <FlatButton
          id='read_only_btn_hop'
          className='noprint'
          label='Table'
          style={{marginLeft: 20}}
          onClick={_ => props.router.push(`/tables/${props.listId}`)}
          labelStyle={{textTransform: 'none', color: grey400}}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}/>
        </div>
        {props.listfeed && props.listfeed.length === 0 &&
          <div className='row horizontal-center vertical-center' style={{height: 400}}>
            <span>You are not tracking any RSS, Twitter, or Instagram in the contacts in your Sheet. Start adding some to see a master feed of all the posts here.</span>
          </div>}
        <div className='row horizontal-center' style={{padding: `0 ${FEED_PADDING/2}px`}}>
        {props.listfeed && props.listfeed.length > 0 &&
          <WindowScroller>
          {({height, scrollTop}) => (
            <CellMeasurer
            cellRenderer={({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest})}
            columnCount={1}
            rowCount={props.listfeed.length}
            >
            {({getRowHeight}) => (
              <List
              width={state.screenWidth < 800 ? state.screenWidth : 800}
              autoHeight
              height={height}
              scrollTop={scrollTop}
              rowCount={props.listfeed.length}
              rowRenderer={this.rowRenderer}
              overscanRowCount={10}
              rowHeight={getRowHeight}
              onScroll={(args) => {
                if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchListFeed(props.listId);
              }}
              />
              )}
            </CellMeasurer>)}
          </WindowScroller>}
        </div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    list: state.listReducer[listId],
    listfeed: state.listfeedReducer[listId] && state.listfeedReducer[listId].received,
    didInvalidate: state.listfeedReducer.didInvalidate,
    offset: state.listfeedReducer[listId] && state.listfeedReducer[listId].offset,
    firstTimeUser: state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchListFeed: listId => dispatch(listfeedActions.fetchListFeed(listId)),
    fetchList: listId => dispatch(actionCreators.fetchList(listId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListFeed));
