import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import validator from 'validator';
import * as actions from './actions';
import * as contactActions from '../../actions/contactActions';
import {grey100, grey50, grey700} from 'material-ui/styles/colors';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

const styles = {
  parent: {
    marginBottom: 10,
    borderRadius: '1.5em',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    ':hover': {
      backgroundColor: grey50
    }
  },
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

const ContactDescriptor = ({content, contentTitle, onClick}) => {
  return (
    <div className='row'>
      <span>{content ? content : `${contentTitle} not available`}</span>
      <IconButton
        style={{marginLeft: 3}}
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName={content ? 'fa fa-edit' : 'fa fa-plus'}
        tooltip={`Add ${contentTitle}`}
        tooltipPosition='top-right'
        onClick={_ => alertify.prompt(`Enter ${contentTitle}`, '', onClick, function() {})}
        />
  </div>
  );
};

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
          <div>
            <ContactDescriptor content={contact.email} contentTitle='Email' onClick={(e, value) => isEmail(value) && props.patchContact(props.contactId, {email: value})}/>
            <ContactDescriptor content={contact.blog} contentTitle='Blog' onClick={(e, value) => isURL(value) && props.patchContact(props.contactId, {blog: value})}/>
            <ContactDescriptor content={contact.twitter} contentTitle='Twitter' onClick={(e, value) => isURL(value) && props.patchContact(props.contactId, {twitter: value})}/>
            <ContactDescriptor content={contact.linkedin} contentTitle='LinkedIn' onClick={(e, value) => isURL(value) && props.patchContact(props.contactId, {linkedin: value})}/>
            <ContactDescriptor content={contact.website} contentTitle='Website' onClick={(e, value) => isURL(value) && props.patchContact(props.contactId, {website: value})}/>
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
          <div style={{
            marginTop: 20,
            padding: 5,
            border: `solid 1px ${grey100}`}}>
            {props.headlines && props.headlines.map((headline, i) => {
              const date = new Date(headline.publishdate);
              return (
              <div key={i} style={{marginBottom: 20}}>
                <a target='_blank' href={headline.url}><h4>{headline.title}</h4></a>
                <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
                <p>{headline.summary}</p>
              </div>
              )}
            )}
          </div>
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
    fetchContact: contactid => dispatch(contactActions.fetchContact(contactid)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactProfile);
