import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import validator from 'validator';
import * as feedActions from './actions';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';

class FeedsController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedUrl: '',
      isPanelOpen: false,
    };
    this.togglePanel = _ => this.setState({isPanelOpen: !this.state.isPanelOpen});
    this.addFeedClick = this._addFeedClick.bind(this);
  }

  _addFeedClick() {
    const props = this.props;
    if (this.state.feedUrl.length === 0) return;
    props.addFeed(props.contactId, props.listId, this.state.feedUrl);
    this.togglePanel();
    window.location.reload();
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div>
        <Dialog autoScrollBodyContent open={state.isPanelOpen} onRequestClose={this.togglePanel}>
          <h5>Settings</h5>
          <div>
            <span style={{marginRight: 10}}>Attach New RSS Feed</span>
            <TextField
            value={state.feedUrl}
            hintText='Enter RSS link here'
            errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0 ? null : 'not valid URL'}
            onChange={e => this.setState({feedUrl: e.target.value})}
            />
            <FlatButton
            label='Add'
            primary
            onTouchTap={this.addFeedClick}
            />
          </div>
          <span style={{fontSize: '0.9em'}}>* feeds will begin aggregating in a few minutes</span>
        </Dialog>
        <div className='row' style={{marginTop: 15, marginBottom: 15}}>
          <div className='large-10 medium-8 small-12 columns'>
            <span>Currently Attached Feeds:</span>
            {props.feeds && props.feeds.map((feed, i) => <Chip
              style={{margin: 4}}
              key={i}
              onRequestDelete={_ => props.deleteFeed(feed.id).then(_ => props.fetchContactFeeds(props.contactId))}>{feed.url}</Chip>)}
          </div>
          <div className='large-2 medium-4 small-12 columns vertical-center'>
            <RaisedButton style={{marginTop: 10, marginBottom: 10, float: 'right'}} label='Settings' onClick={this.togglePanel} labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const feeds = state.feedReducer[contactId] && state.feedReducer[contactId].map(id => state.feedReducer[id]);
  const attachedfeeds = feeds && feeds.map(feed => feed.url);
  return {
    feeds,
    attachedfeeds
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addFeed: (contactid, listid, url) => dispatch(feedActions.addFeed(contactid, listid, url)),
    deleteFeed: feedId => dispatch(feedActions.deleteFeed(feedId)),
    fetchContactFeeds: (contactId) => dispatch(feedActions.fetchContactFeeds(contactId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(FeedsController);
