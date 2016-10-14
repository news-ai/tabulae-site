import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as listfeedActions from './actions';
import HeadlineItem from '../ContactProfile/Headlines/HeadlineItem.react';
import Tweet from '../ContactProfile/Tweets/Tweet.react';
import InstagramItem from '../ContactProfile/Instagram/InstagramItem.react';
import InfiniteScroll from '../InfiniteScroll';

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    this.props.fetchListFeed(this.props.listId);
  }

  render() {
    const props = this.props;
    return (
      <InfiniteScroll onScrollBottom={_ => props.fetchListFeed(props.listId)}>
      {props.listfeed && props.listfeed.map((obj, i) => {
        switch (obj.type) {
          case 'headlines':
            return <HeadlineItem key={i} {...obj} />;
          case 'tweets':
            return <Tweet key={i} {...obj} />;
          case 'instagrams':
            return <InstagramItem key={i} {...obj} />;
          default:
            return <HeadlineItem key={i} {...obj} />;
          }
        })}
      </InfiniteScroll>);
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
