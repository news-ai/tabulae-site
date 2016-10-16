import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InstagramItem from '../Instagram/InstagramItem.react';
import GenericFeed from '../GenericFeed.react';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.setRef = ref => {
      this._mixedList = ref;
    };
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.containerWidth !== this.props.containerWidth) {
      if (this._mixedList) this._mixedList.recomputeRowHeights();
    }
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
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

    let newstyle = style;
    if (newstyle) newstyle.padding = '0 18px';
    return (
      <div key={key} style={newstyle}>
        {row}
      </div>);
  }

  render() {
    const props = this.props;
    return (
      <GenericFeed
      rowRenderer={this.rowRenderer}
      {...props}
      />);
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  return {
    listId,
    contactId,
    feed: state.mixedReducer[contactId] && state.mixedReducer[contactId].received,
    didInvalidate: state.mixedReducer.didInvalidate,
    offset: state.mixedReducer[contactId] && state.mixedReducer[contactId].offset
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: _ => dispatch(mixedFeedActions.fetchMixedFeed(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MixedFeed);
