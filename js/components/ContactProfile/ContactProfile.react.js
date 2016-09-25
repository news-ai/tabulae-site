import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import validator from 'validator';
import * as actions from './actions';
import * as contactActions from '../../actions/contactActions';

class ContactProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRssPanelOpen: false,
      feedUrl: ''
    };
    this.togglePanel = _ => this.setState({isRssPanelOpen: !this.state.isRssPanelOpen});
    this.addFeedClick = this._addFeedClick.bind(this);
  }

  componentWillMount() {
    this.props.fetchContact(this.props.contactId);
    this.props.fetchFeed(this.props.contactId);
  }

  _addFeedClick() {
    const props = this.props;
    if (this.state.feedUrl.length === 0) return;
    props.addFeed(props.contactId, props.listId, this.state.feedUrl);
    this.togglePanel();
  }

  render() {
    const state = this.state;
    const props = this.props;
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
        onTouchTap={this.addFeedClick}
      />,
    ];
    const contact = props.contact;
    return (
      <div>
        <div>
          {contact && <div>
          <div className='row'>
            <h4>{contact.firstname} {contact.lastname}</h4>
          </div>
          <div className='row'>
            <span>{contact.email ? contact.email : 'email not available'}</span>
          </div>
          </div>}
        </div>
        <div>
          <Dialog actions={actions} title='New Author RSS Feed' modal open={state.isRssPanelOpen} onRequestClose={this.togglePanel}>
            <TextField
            value={state.feedUrl}
            hintText='Enter RSS Url here'
            errorText={validator.isURL(state.feedUrl) || state.feedUrl.length === 0 ? null : 'not valid URL'}
            onChange={e => this.setState({feedUrl: e.target.value})}
            />
          </Dialog>
          <RaisedButton label='Add New RSS Feed' onClick={this.togglePanel} labelStyle={{textTransform: 'none'}} />
          {props.headlines && props.headlines.map((headline, i) => {
            const date = new Date(headline.publishdate);
            return (
            <div key={i} style={{marginTop: 20}}>
              <a target='_blank' href={headline.url}><h4>{headline.title}</h4></a>
              <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
              <p>{headline.summary}</p>
            </div>
            )}
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const contactId = parseInt(props.params.contactId, 10);
  const headlines = state.feedReducer[contactId]
  && state.feedReducer[contactId].received
  && state.feedReducer[contactId].received.map(id => state.feedReducer[id]);
  const contact = state.contactReducer[contactId];

  return {
    listId,
    contactId,
    headlines,
    contact
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addFeed: (contactid, listid, url) => dispatch(actions.addFeed(contactid, listid, url)),
    fetchFeed: contactid => dispatch(actions.fetchContactHeadlines(contactid)),
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactProfile);
