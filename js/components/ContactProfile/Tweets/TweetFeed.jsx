import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as tweetActions from './actions';
import Tweet from './Tweet.jsx';
import GenericFeed from '../GenericFeed.jsx';

class TweetFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
    this.setRef = ref => (this._list = ref);
    this._cache = new CellMeasurerCache({fixedWidth: true, minHeight: 50});
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      this._cache.clearAll();
      if (this._list) this._list.recomputeRowHeights();
    }

    if (this.props.feed && nextProps.feed && this.props.feed.length !== nextProps.feed.length) {
      this._cache.clearAll();
      if (this._list) this._list.recomputeRowHeights();
    }
  }
  
  componentWillUnmount() {
    window.onresize = undefined;
  }

  _rowRenderer({key, index, style, parent}) {
    const feedItem = this.props.feed[index];
    const row = <Tweet screenWidth={this.props.containerWidth} {...feedItem} />;

    let newstyle = Object.assign({}, style, {padding: '0 18px'});
    return (
      <CellMeasurer
      cache={this._cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
      >
        <div
        className='vertical-center'
        key={key}
        style={newstyle}>
          {row}
        </div>
      </CellMeasurer>
      );
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      setRef={this.setRef}
      rowRenderer={this.rowRenderer}
      title='Twitter'
      cache={this._cache}
      {...props}
      />);
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.tweetReducer[contactId]
  && state.tweetReducer[contactId].received
  && state.tweetReducer[contactId].received.map(id => state.tweetReducer[id]);

  return {
    listId,
    contactId,
    feed,
    isReceiving: state.tweetReducer.isReceiving,
    didInvalidate: state.tweetReducer.didInvalidate,
    offset: state.tweetReducer[contactId] && state.tweetReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(tweetActions.fetchContactTweets(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TweetFeed);
