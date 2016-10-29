import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import * as feedActions from '../ContactProfile/actions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Textarea from 'react-textarea-autosize';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {yellow50} from 'material-ui/styles/colors';
import {fromJS, is} from 'immutable';
import pickBy from 'lodash/pickBy';

const textfieldStyle = {
  marginLeft: 10
};

function removeDupe(list) {
  let m = {};
  let ret;
  return list.filter(item => {
    if (m[item] === true) ret = false;
    else ret = true;
    m[item] = true;
    return ret;
  });
}

const _getter = contact => {
  if (!contact) return;
  const {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website} = contact;
  return {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website};
};

class EditContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: _getter(this.props.contact),
      immutableContactBody: fromJS(_getter(this.props.contact)),
      customfields: this.props.contact.customfields,
      rssfeedsTextarea: ''
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onCustomChange = this._onCustomChange.bind(this);
    this.handleRSSTextarea = this._handleRSSTextarea.bind(this);
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.feeds !== nextProps.feeds) {
      this.setState({
        rssfeedsTextarea: nextProps.feeds ? nextProps.feeds.map(feed => feed.url).join('\n') : ''
      });
    }

    const immutableContactBody = fromJS(nextProps.contact);
    if (nextProps.contact && !is(immutableContactBody, this.state.immutableContactBody)) {
      this.setState({contactBody: _getter(nextProps.contact), immutableContactBody});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      // if (!this.props.feeds) this.props.fetchFeeds();
    }
  }

  _onSubmit() {
    let contactBody = this.state.contactBody;
    if (this.state.customfields !== null && this.state.customfields.length > 0) {
      contactBody.customfields = this.state.customfields.filter(field => !this.props.list.fieldsmap.some(fieldObj => fieldObj.readonly && fieldObj.value === field.name));
    }
    contactBody.listid = this.props.listId;
    this.props.patchContact(this.props.contact.id, contactBody);
    this.setState({open: false});
  }

  _onChange(name, value) {
    this.setState({
      contactBody: Object.assign({}, this.state.contactBody, {[name]: value})
    });
  }

  _onCustomChange(name, value) {
    let customfields = this.state.customfields;
    if (customfields === null) customfields = [];
    if (customfields.some(field => field.name === name)) {
      customfields = customfields.map(field => field.name === name ? ({name, value}) : field);
    } else {
      customfields = [...customfields, {name, value}];
    }
    this.setState({
      customfields,
      contactBody: Object.assign({}, this.state.contactBody, {customfields})
    });
  }

  _handleRSSTextarea(id) {
    const feeds = removeDupe(this.state.rssfeedsTextarea
      .split('\n')
      .filter(line => line.length > 0 && isURL(line)));
    if (feeds.length === 0) return;
    this.props.addFeeds(id, feeds);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => this.setState({
          open: false,
          contactBody: _getter(props.contact),
          customfields: props.contact.customfields
        })}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.onSubmit}
      />,
    ];
    return (
      <div className={props.className}>
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Edit Contact' onRequestClose={_ => this.setState({open: false})}>
          {props.isReceiving && <FontIcon className={'fa fa-spinner fa-spin'} />}
          <div className='row' style={{marginTop: 20}}>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span style={{whiteSpace: 'nowrap'}}>First Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.firstname || ''} name='firstname' onChange={e => this.onChange('firstname', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span style={{whiteSpace: 'nowrap'}}>Last Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.lastname || ''} name='lastname' onChange={e => this.onChange('lastname', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Email</span>
              <TextField style={textfieldStyle} value={state.contactBody.email || ''} name='email' onChange={e => this.onChange('email', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Twitter</span>
              <TextField hintText='adding will populate the feed' style={textfieldStyle} value={state.contactBody.twitter || ''} name='twitter' onChange={e => this.onChange('twitter', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Instagram</span>
              <TextField hintText='adding will populate the feed' style={textfieldStyle} value={state.contactBody.instagram || ''} name='instagram' onChange={e => this.onChange('instagram', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>LinkedIn</span>
              <TextField style={textfieldStyle} value={state.contactBody.linkedin || ''} name='linkedin' onChange={e => this.onChange('linkedin', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Phone #</span>
              <TextField style={textfieldStyle} value={state.contactBody.phonenumber || ''} name='phonenumber' onChange={e => this.onChange('phonenumber', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Blog</span>
              <TextField style={textfieldStyle} value={state.contactBody.blog || ''} name='blog' onChange={e => this.onChange('blog', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Website</span>
              <TextField style={textfieldStyle} value={state.contactBody.website || ''} name='website' onChange={e => this.onChange('website', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Notes</span>
              <TextField style={textfieldStyle} value={state.contactBody.notes || ''} name='notes' onChange={e => this.onChange('notes', e.target.value)}/>
            </div>
            {props.list && props.list.fieldsmap !== null &&
              props.list.fieldsmap
              .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
              .map((fieldObj, i) => fieldObj.customfield && (
                <div key={i} className='large-6 medium-12 small-12 columns vertical-center'>
                  <span>{fieldObj.name}</span>
                  <TextField
                  value={state.customfields === null || !state.customfields.some(field => field.name === fieldObj.value) ? '' : state.customfields.find(field => field.name === fieldObj.value).value}
                  style={textfieldStyle}
                  ref={fieldObj.value}
                  name={fieldObj.value}
                  onChange={e => this.onCustomChange(fieldObj.value, e.target.value)}
                  />
                </div>
                ))}
            {
              /*<div className='panel' style={{
              backgroundColor: yellow50,
              margin: 10,
              padding: 10
            }}>
              <span style={{fontSize: '0.8em'}}>
              Many websites can be followed with RSS if they are powered by WordPress or Tumblr. You can discover their feed link by simply adding <strong>/feed</strong> or <strong>/rss</strong>.
              For example:
                https://vogue.com/feed,
                https://nypost.com/author/firstname-lastname/feed,
                https://nycstreetfile.tumblr.com/rss
              </span>
            </div>*/
          }
          {/*
            <div className='large-12 medium-12 small-12 columns'>
              <span style={{whiteSpace: 'nowrap'}}>RSS Feeds</span>
              <span style={{whiteSpace: 'nowrap', fontSize: '0.8em'}}> * Separate feeds with a new line</span>
              <Textarea
              value={state.rssfeedsTextarea}
              maxRows={10}
              onChange={e => this.setState({rssfeedsTextarea: e.target.value})}
              />
            </div>*/
          }
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const feeds = state.feedReducer[props.contactId] && state.feedReducer[props.contactId].map(id => state.feedReducer[id]);
  return {
    contact: state.contactReducer[props.contactId],
    list: state.listReducer[props.listId],
    publicationReducer: state.publicationReducer,
    feeds
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(actionCreators.addContacts(contacts)),
    patchContact: (contactId, body) => dispatch(actionCreators.patchContact(contactId, body)),
    patchList: listBody => dispatch(actionCreators.patchList(listBody)),
    searchPublications: query => dispatch(actionCreators.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(actionCreators.createPublicationThenPatchContact(contactId, pubName, which)),
    addFeeds: (contactId, feeds) => Promise.all(feeds.map(feed => dispatch(feedActions.addFeed(contactId, props.listId, feed)))),
    fetchFeeds: _ => dispatch(feedActions.fetchContactFeeds(props.contactId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditContact);