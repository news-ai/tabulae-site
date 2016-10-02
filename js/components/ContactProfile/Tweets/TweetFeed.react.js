import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as tweetActions from './actions';
import Tweet from './Tweet.react';
import InfiniteScroll from '../../InfiniteScroll';

class TweetFeed extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchContactTweets(props.contactId)}>
          {props.tweets && props.tweets.map((tweet, i) => <Tweet key={i} {...tweet} />)}
        </InfiniteScroll>
      );
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const tweets = state.tweetReducer[contactId]
  && state.tweetReducer[contactId].received
  && state.tweetReducer[contactId].received.map(id => state.tweetReducer[id]);

  return {
    listId,
    contactId,
    tweets,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchContactTweets: contactId => dispatch(tweetActions.fetchContactTweets(contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TweetFeed);
