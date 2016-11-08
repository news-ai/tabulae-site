import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';

import * as listfeedActions from './actions';
import * as actionCreators from '../../actions/AppActions';
import * as AppActions from 'actions/AppActions';
import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

const FEED_PADDING = 20;

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING,
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      firsttime: this.props.firstTimeUser
    };
    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING;
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.setState({screenWidth, screenHeight});
    };
  }

  componentWillMount() {
    this.props.fetchListFeed(this.props.listId);
    if (!this.props.list) this.props.fetchList(this.props.listId);
  }

  componentWillUnmount() {
    window.resize = undefined;
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <div style={{margin: 20}}>
              <span style={{fontWeight: 'bold'}}>List Feed</span> is a master feed all the attached social feeds and RSS feeds from all your contacts in a <span style={{fontWeight: 'bold'}}>Table</span>.
              Scroll down to check it out!
            </div>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <RaisedButton primary label='OK' onClick={_ => this.setState({firsttime: false}, _ => {
                hopscotch.startTour(tour);
              })}/>
            </div>
          </Dialog>
        }
        <div className='row horizontal-center' style={{marginTop: 30}}>
          <h4>{props.list ? props.list.name : 'List Feed'}</h4>
          <FlatButton
          id='read_only_btn_hop'
          className='noprint'
          label='Table'
          style={{marginLeft: 20}}
          onClick={_ => props.router.push(`/tables/${props.listId}`)}
          labelStyle={{textTransform: 'none', color: grey400}}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}/>
        </div>
        {props.feed && props.feed.length === 0 &&
          <div className='row horizontal-center vertical-center' style={{height: 400}}>
            <span>You are not tracking any RSS, Twitter, or Instagram in the contacts in your Sheet. Start adding some to see a master feed of all the posts here.</span>
          </div>}
        <div className='row horizontal-center'>
         <MixedFeed
         autoSizer
         rowStyle={{width: state.screenWidth < 800 ? state.screenWidth - 5 : 795}}
         containerWidth={state.screenWidth < 800 ? state.screenWidth : 800}
         fetchFeed={props.fetchListFeed}
         {...props}/>
        </div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId,
    list: state.listReducer[listId],
    feed: state.listfeedReducer[listId] && state.listfeedReducer[listId].received,
    didInvalidate: state.listfeedReducer.didInvalidate,
    offset: state.listfeedReducer[listId] && state.listfeedReducer[listId].offset,
    firstTimeUser: state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    fetchListFeed: _ => dispatch(listfeedActions.fetchListFeed(listId)),
    fetchList: _ => dispatch(actionCreators.fetchList(listId)),
    removeFirstTimeUser: _ => dispatch(AppActions.removeFirstTimeUser())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListFeed));
