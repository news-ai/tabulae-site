import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';

import * as listfeedActions from './actions';
import * as actionCreators from '../../actions/AppActions';
import HeadlineItem from '../ContactProfile/Headlines/HeadlineItem.react';
import Tweet from '../ContactProfile/Tweets/Tweet.react';
import InstagramItem from '../ContactProfile/Instagram/InstagramItem.react';
import InfiniteScroll from '../InfiniteScroll';
import {List, CellMeasurer} from 'react-virtualized';

import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400} from 'material-ui/styles/colors';

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
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
        row = <HeadlineItem {...feedItem} />;
        break;
      case 'tweets':
        row = <Tweet {...feedItem} />;
        break;
      case 'instagrams':
        row = <InstagramItem {...feedItem} />;
        break;
      default:
        row = <HeadlineItem {...feedItem} />;
    }
    return (
      <div key={key} style={style}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    return (
      <div>
        <div className='row' style={{marginTop: 20}}>
          <h4>{props.list ? props.list.name : 'List Feed'}</h4>
          <FlatButton
          className='noprint'
          label='Read Only Table'
          style={{marginLeft: 20}}
          onClick={_ => props.router.push(`/tables/${props.listId}`)}
          labelStyle={{textTransform: 'none', color: grey400}}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}/>
        </div>
        <div className='row'>
        {props.listfeed &&
          <CellMeasurer
          cellRenderer={({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest})}
          columnCount={1}
          rowCount={props.listfeed.length}
          >
          {({getRowHeight}) => (
            <List
            width={screenWidth - 100}
            height={screenHeight - 150}
            rowCount={props.listfeed.length}
            rowRenderer={this.rowRenderer}
            rowHeight={args => {
              if (props.listfeed[args.index].type === 'instagrams') return 850;
              return getRowHeight(args);
            }}
            onScroll={({scrollHeight, scrollTop, clientHeight}) => {
              if (((scrollHeight - scrollTop) / clientHeight) < 2) props.fetchListFeed(props.listId);
            }}
            />
            )}
          </CellMeasurer>}
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
    offset: state.listfeedReducer[listId] && state.listfeedReducer[listId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchListFeed: listId => dispatch(listfeedActions.fetchListFeed(listId)),
    fetchList: listId => dispatch(actionCreators.fetchList(listId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListFeed));
