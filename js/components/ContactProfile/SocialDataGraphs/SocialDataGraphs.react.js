import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as instaActions from './Instagram/actions';
import * as twitterActions from './Twitter/actions';
import SocialDataGraph from './SocialDataGraph.react';

class SocialDataGraphs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      twitterParams: {
        Likes: true,
        Posts: false,
        Followers: false,
        Following: false,
        Retweets: true,
      },
      instagramParams: {
        Likes: true,
        Posts: false,
        Followers: false,
        Following: false,
        Comments: false,
      },
      twitterDataKeys: ['Likes', 'Posts', 'Followers', 'Following', 'Retweets'],
      instaDataKeys: ['Likes', 'Posts', 'Followers', 'Following', 'Comments']
    };
  }

  componentWillMount() {
    this.props.fetchInstagramData();
    this.props.fetchTwitterData();
  }

  render() {
    const props = this.props;
    const state = this.state;

    return props.contact ? (
      <div style={{margin: '20px 0'}}>
        {props.instadata &&
          <SocialDataGraph
          data={props.instadata.received}
          title='Instagram'
          dataKeys={['Likes', 'Posts', 'Followers', 'Following', 'Comments']}
          params={{
            Likes: true,
            Posts: false,
            Followers: false,
            Following: false,
            Comments: false,
          }}
          />}
        {props.twitterdata &&
          <SocialDataGraph
          data={props.twitterdata.received}
          title='Twitter'
          dataKeys={['Likes', 'Posts', 'Followers', 'Following', 'Retweets']}
          params={{
            Likes: true,
            Posts: false,
            Followers: false,
            Following: false,
            Retweets: true,
          }}
          />}
      </div>) : null;
  }
}

function mapStateToProps(state, props) {
  return {
    contact: state.contactReducer[props.contactId],
    instadata: state.instagramDataReducer[props.contactId],
    twitterdata: state.twitterDataReducer[props.contactId],
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    fetchInstagramData: _ => dispatch(instaActions.fetchContactInstagramData(props.contactId)),
    fetchTwitterData: _ => dispatch(twitterActions.fetchContactTwitterData(props.contactId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SocialDataGraphs);
