import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as listfeedActions from './actions';
import HeadlineItem from '../ContactProfile/Headlines/HeadlineItem.react';
import Tweet from '../ContactProfile/Tweets/Tweet.react';
import InstagramItem from '../ContactProfile/Instagram/InstagramItem.react';
import InfiniteScroll from '../InfiniteScroll';
import {List, CellMeasurer} from 'react-virtualized';

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillMount() {
    this.props.fetchListFeed(this.props.listId);
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
    return (
      <div>
      {props.listfeed &&
        <CellMeasurer
        cellRenderer={({rowIndex, ...rest}) => this.rowRenderer({index: rowIndex, ...rest})}
        columnCount={1}
        >
        {({getRowHeight}) => (
          <List
          width={1200}
          height={600}
          rowCount={props.listfeed.length}
          rowRenderer={this.rowRenderer}
          rowHeight={getRowHeight}
          onScroll={({scrollHeight, scrollTop, clientHeight}) => {
            if (((scrollHeight - scrollTop) / clientHeight) < 2) props.fetchListFeed(props.listId);
          }}
          />
          )}
        </CellMeasurer>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    listfeed: state.listfeedReducer[listId] && state.listfeedReducer[listId].received,
    didInvalidate: state.listfeedReducer.didInvalidate,
    offset: state.listfeedReducer[listId] && state.listfeedReducer[listId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchListFeed: listId => dispatch(listfeedActions.fetchListFeed(listId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListFeed);
