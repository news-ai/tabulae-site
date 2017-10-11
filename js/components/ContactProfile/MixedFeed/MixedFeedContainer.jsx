import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import MixedFeed from './MixedFeed.jsx';

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feed = state.mixedReducer[contactId] && state.mixedReducer[contactId].received;
  return {
    listId,
    contactId,
    isReceiving: state.mixedReducer.isReceiving,
    feed: feed || [],
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
