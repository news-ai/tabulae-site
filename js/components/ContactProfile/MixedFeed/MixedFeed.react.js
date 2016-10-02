import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InfiniteScroll from '../../InfiniteScroll';

class MixedFeed extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchMixedFeed(props.contactId)}>
          {props.mixedfeed && props.mixedfeed.map((obj, i) => obj.type === 'headlines' ?
            <HeadlineItem key={i} {...obj} /> :
            <Tweet key={i} {...obj} />)}
        </InfiniteScroll>
      );
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  return {
    listId,
    contactId,
    mixedfeed: state.mixedReducer[contactId] && state.mixedReducer[contactId].received,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchMixedFeed: contactId => dispatch(mixedFeedActions.fetchMixedFeed(contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MixedFeed);
