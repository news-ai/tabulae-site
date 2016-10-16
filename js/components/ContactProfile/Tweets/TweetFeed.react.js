import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as tweetActions from './actions';
import Tweet from './Tweet.react';
import GenericFeed from '../GenericFeed.react';

class TweetFeed extends Component {
  constructor(props) {
    super(props);
    this.rowRenderer = this._rowRenderer.bind(this);
  }

  _rowRenderer({key, index, style}) {
    const feedItem = this.props.feed[index];
    const row = <Tweet {...feedItem} />;

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
  const feed = state.tweetReducer[contactId]
  && state.tweetReducer[contactId].received
  && state.tweetReducer[contactId].received.map(id => state.tweetReducer[id]);

  return {
    listId,
    contactId,
    feed,
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
