import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as mixedFeedActions from './actions';
import Tweet from '../Tweets/Tweet.react';
import HeadlineItem from '../Headlines/HeadlineItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import {grey400} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

const tweetStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

const Instagram = ({text, createdat, instagramcomments, instagramid, instagramlikes, instagramimage, instagramlink, instagramusername, instagramvideo}) => {
  const date = new Date(createdat);
  return <div className='row' style={tweetStyle}>
    <div className='large-10 medium-9 small-8 columns'>
      <a target='_blank' href={instagramlink}>{text ? text : instagramlink}</a>
    </div>
    <div className='large-2 medium-3 small-4 columns'>
      <span style={{float: 'right'}}>
        {instagramusername ? <a target='_blank' href={`https://instagram.com/${instagramusername}`}>{instagramusername}</a> : instagramusername}
      </span>
    </div>
     <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
      <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
    </div>
    {!instagramvideo && <div className='large-12 medium-12 small-12 columns'>
      <img src={instagramimage} />
    </div>}
    {instagramvideo && <div className='large-12 medium-12 small-12 columns'>
      <video src={instagramvideo} controls>
      Your browser does not support the <code>video</code> element.
      </video>
    </div>}
    <div className='large-12 medium-12 small-12 columns'>
      <div className='row right'>
        <Chip style={{margin: 5}}>
          <Avatar size={30}>{instagramlikes}</Avatar>
          Likes
        </Chip>
        <Chip style={{margin: 5}}>
          <Avatar size={30}>{instagramcomments}</Avatar>
          Comments
        </Chip>
      </div>
    </div>
  </div>;
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
                return <Instagram key={i} {...obj} />;
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
