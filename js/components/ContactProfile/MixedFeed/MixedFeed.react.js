import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import InstagramItem from '../Instagram/InstagramItem.react';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

class MixedFeed extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchMixedFeed(this.props.contactId);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchMixedFeed(props.contactId)}>
          {props.mixedfeed && props.mixedfeed.map((obj, i) => {
            switch (obj.type) {
              case 'headlines':
                return <HeadlineItem key={i} {...obj} />;
                break;
              case 'tweets':
                return <Tweet key={i} {...obj} />;
                break;
              case 'instagrams':
                return <InstagramItem key={i} {...obj} />;
                break;
              default:
                return <HeadlineItem key={i} {...obj} />;
            }
          })}
          {props.mixedfeed
            && !props.didInvalidate
            && props.mixedfeed.length === 0
            && <div className='row' style={styleEmptyRow}><p>No RSS/Tweets attached. Try clicking on 'Settings' to start seeing some headlines.</p></div>}
          {props.didInvalidate
            && <div className='row' style={styleEmptyRow}><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
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
    didInvalidate: state.mixedReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchMixedFeed: contactId => dispatch(mixedFeedActions.fetchMixedFeed(contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MixedFeed);
