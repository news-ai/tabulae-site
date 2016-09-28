import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import validator from 'validator';
import * as feedActions from './actions';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import {grey500} from 'material-ui/styles/colors';

class FeedsController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedUrl: '',
      isPanelOpen: false
    };
    this.togglePanel = _ => this.setState({isPanelOpen: !this.state.isPanelOpen});
    this.addFeedClick = this._addFeedClick.bind(this);
  }

  _addFeedClick() {
    const props = this.props;
    if (this.state.feedUrl.length === 0) return;
    props.addFeed(props.contactId, props.listId, this.state.feedUrl);
    this.togglePanel();
  }

  render() {
    const props = this.props;
    const state = this.state;
    const addFeedActions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={this.togglePanel}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.addFeedClick}
      />,
    ];
    return (
      <div>
        <Dialog actions={addFeedActions} title='New Author RSS Feed' modal open={state.isPanelOpen} onRequestClose={this.togglePanel}>
          <TextField
          value={state.feedUrl}
          hintText='Enter RSS Url here'
          errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0 ? null : 'not valid URL'}
          onChange={e => this.setState({feedUrl: e.target.value})}
          />
        </Dialog>
        <div className='row' style={{marginTop: 15, marginBottom: 15}}>
          <div className='large-9 medium-8 small-12 columns' style={{color: grey500, fontSize: '0.7em'}}>
            Attached Feeds:
            {props.attachedfeeds && props.attachedfeeds.map((feed, i) => <div key={i} style={{marginLeft: 3}}><span>{feed}</span></div>)}
          </div>
           <div className='large-3 medium-4 small-12 columns'>
            <RaisedButton style={{marginTop: 10, marginBottom: 10, float: 'right'}} label='Add New Feed' onClick={this.togglePanel} labelStyle={{textTransform: 'none'}} />
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(FeedsController);
