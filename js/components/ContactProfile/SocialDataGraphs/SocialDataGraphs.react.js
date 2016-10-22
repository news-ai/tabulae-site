import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as instaActions from './Instagram/actions';
import * as twitterActions from './Twitter/actions';
import LineGraph from './LineGraph.react';
import Checkbox from 'material-ui/Checkbox';

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
        {props.contact.instagram && props.instadata &&
          <div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
            <div className='large-12 large-offset-1 medium-12 medium-offset-1 small-12 columns'>
              <h5>Instagram Stats</h5>
            </div>
            <div className='large-8 medium-8 small-12 columns horizontal-center'>
              <LineGraph
              data={props.instadata.received}
              dataKeys={state.instaDataKeys.filter(key => state.instagramParams[key])} />
            </div>
            <div className='large-4 medium-3 small-12 columns'>
              {state.instaDataKeys.map((dataKey, i) =>
                <Checkbox
                key={i}
                label={dataKey}
                checked={state.instagramParams[dataKey]}
                onCheck={(e, checked) =>
                  this.setState({instagramParams: Object.assign({}, state.instagramParams, {[dataKey]: checked})})
                }/>)}
            </div>
          </div>
        }
        {props.contact.twitter && props.twitterdata &&
          <div className='row' style={{marginTop: '10px', marginBottom: '10px'}}>
            <div className='large-12 large-offset-1 medium-12 medium-offset-1 small-12 columns'>
              <h5>Twitter Stats</h5>
            </div>
            <div className='large-8 medium-8 small-12 columns horizontal-center'>
              <LineGraph
              data={props.twitterdata.received}
              dataKeys={state.twitterDataKeys.filter(key => state.twitterParams[key])} />
            </div>
            <div className='large-4 medium-4 small-12 columns'>
              {state.twitterDataKeys.map((dataKey, i) =>
                <Checkbox
                key={i}
                label={dataKey}
                checked={state.twitterParams[dataKey]}
                onCheck={(e, checked) =>
                  this.setState({twitterParams: Object.assign({}, state.twitterParams, {[dataKey]: checked})})
                }/>)}
            </div>
          </div>}
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
