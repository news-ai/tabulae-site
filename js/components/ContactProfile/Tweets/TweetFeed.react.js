import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as tweetActions from './actions';
import Tweet from './Tweet.react';
import InfiniteScroll from '../../InfiniteScroll';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50
};

class TweetFeed extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchContactTweets(props.contactId)}>
          {props.tweets && props.tweets.map((tweet, i) => <Tweet key={i} {...tweet} />)}
          {props.tweets
            && !props.didInvalidate
            && props.tweets.length === 0
            && <div className='row' style={styleEmptyRow}><p>No Tweets attached. Try filling in Twitter field with a handle to start seeing tweets.</p></div>}
          {props.didInvalidate
            && <div className='row' style={styleEmptyRow}><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
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
    didInvalidate: state.tweetReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchContactTweets: contactId => dispatch(tweetActions.fetchContactTweets(contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TweetFeed);
