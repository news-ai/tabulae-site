import React, {Component} from 'react';
import {connect} from 'react-redux';
import InstagramItem from './InstagramItem.jsx';
import * as instagramActions from './actions';
import GenericFeed from '../GenericFeed.jsx';
import {CellMeasurerCache, CellMeasurer} from 'react-virtualized';

class InstagramFeed extends Component {
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
    const transformFeedItem = Object.assign({}, feedItem, {
      instagramlikes: feedItem.likes,
      instagramcomments: feedItem.comments,
      instagramimage: feedItem.image,
      instagramlink: feedItem.link,
      instagramusername: feedItem.Username,
      instagramvideo: feedItem.video,
    });
    const row = <InstagramItem {...transformFeedItem} />;

    let newstyle = Object.assign({}, style, {padding: '0 18px'});
    return (
      <CellMeasurer
      cache={this._cache}
      columnIndex={0}
      key={key}
      rowIndex={index}
      parent={parent}
      >
        <div className='vertical-center horizontal-center' key={key} style={newstyle}>
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
      title='Instagram'
      cache={this._cache}
      {...props}
      />);
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.instagramReducer[contactId]
  && state.instagramReducer[contactId].received
  && state.instagramReducer[contactId].received.map(id => state.instagramReducer[id]);
  return {
    listId,
    contactId,
    feed,
    isReceiving: state.instagramReducer.isReceiving,
    didInvalidate: state.instagramReducer.didInvalidate,
    offset: state.instagramReducer[contactId] && state.instagramReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(instagramActions.fetchContactInstagrams(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InstagramFeed);
