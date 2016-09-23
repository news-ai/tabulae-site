import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import validator from 'validator';
import * as actions from './actions';

class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRssPanelOpen: false,
      feedUrl: ''
    };
    this.togglePanel = _ => this.setState({isRssPanelOpen: !this.state.isRssPanelOpen});
  }
  render() {
    const state = this.state;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={this.togglePanel}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.togglePanel}
      />,
    ];
    return (
      <div>
      ContactProfile - CONTACT INFO
        <div>
          <Dialog actions={actions} title='New Author RSS Feed' modal open={state.isRssPanelOpen} onRequestClose={this.togglePanel}>
            <TextField value={state.feedUrl} hintText='Enter RSS Url here' errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0  ? null : 'not valid URL'} onChange={e => this.setState({feedUrl: e.target.value})} />
          </Dialog>
          <RaisedButton label='Add New RSS Feed' onClick={this.togglePanel} labelStyle={{textTransformation: 'none'}} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const contactId = parseInt(props.params.contactId, 10);

  return {
    listId,
    contactId
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addFeed: (contactid, listid, url) => actions.addFeed(contactid, listid, url)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactProfile);
