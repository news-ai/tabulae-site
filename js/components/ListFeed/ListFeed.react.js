import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';

import * as listfeedActions from './actions';
import {actions as loginActions} from 'components/Login';
import {actions as listActions} from 'components/Lists';
import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey700} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

const FEED_PADDING = 20;

class ListFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING,
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      firsttime: this.props.firstTimeUser,
      height: 400
    };
    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - FEED_PADDING;
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      this.setState({screenWidth, screenHeight});
    };
    this.getPosition = this._getPosition.bind(this);
  }

  componentWillMount() {
    this.props.fetchListFeed(this.props.listId);
    if (!this.props.list) this.props.fetchList(this.props.listId);
  }

  componentDidMount() {
    this.getPosition();
    window.Intercom('trackEvent', 'check_list_feed', {listId: this.props.listId});
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _getPosition() {
    const containerY = this.refs.listfeedNameContainer.offsetTop + this.refs.listfeedNameContainer.clientHeight;
    this.setState({height: document.body.clientHeight - containerY});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={{paddingTop: 30}}>
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
        <div ref='listfeedNameContainer' className='row horizontal-center'>
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
            <span style={{color: grey700}}>You are not tracking any RSS, Twitter, or Instagram in the contacts in your Sheet. Start adding some to contacts in Table to see a master feed of all the posts here.</span>
          </div>}
        <div className='row horizontal-center'>
          <MixedFeed
          containerHeight={state.height}
          rowStyle={{width: state.screenWidth < 800 ? state.screenWidth - 5 : 795}}
          containerWidth={state.screenWidth < 800 ? state.screenWidth : 800}
          fetchFeed={props.fetchListFeed}
          hideEmptyPlaceholder
          {...props}
          />
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
    fetchList: _ => dispatch(listActions.fetchList(listId)),
    removeFirstTimeUser: _ => dispatch(loginActions.removeFirstTimeUser())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListFeed));
