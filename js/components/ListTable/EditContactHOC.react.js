// DEPRECIATED
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as contactActions} from 'components/Contacts';
// import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Collapse from 'react-collapse';
import PublicationFormStateful from './PublicationFormStateful.react';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {fromJS, is} from 'immutable';
import {grey400} from 'material-ui/styles/colors';
import find from 'lodash/find';

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
  const {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, location} = contact;
  return {firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website, location};
};

const _getPublicationName = (contact, reducer) => {
  if (contact.employers === null) return '';
  else {
    const id = contact.employers[0];
    if (reducer[id]) return reducer[id].name;
    return '';
  }
};

const columnClassname = 'large-6 medium-12 small-12 columns vertical-center';

class EditContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: _getter(this.props.contact),
      immutableContactBody: fromJS(_getter(this.props.contact)),
      customfields: this.props.contact.customfields,
      rssfeedsTextarea: '',
      pub1input: _getPublicationName(this.props.contact, this.props.publicationReducer),
      employerAutocompleteList: [],
      addPublicationPanelOpen: false,
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.onCustomChange = this._onCustomChange.bind(this);
    this.handleRSSTextarea = this._handleRSSTextarea.bind(this);
    this.updateAutoInput = this._updateAutoInput.bind(this);
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
    const pubId = this.props.publicationReducer[this.state.pub1input];
    if (this.state.pub1input && pubId) {
      contactBody.employers = this.props.contact.employers === null ? [pubId] : [pubId, ...this.props.contact.employers.filter((id, i) => i > 0)];
    }
    contactBody.listid = this.props.listId;
    this.props.patchContact(this.props.contact.id, contactBody);
    this.setState({open: false});
  }

  _onChange(name, value) {
    this.setState({contactBody: Object.assign({}, this.state.contactBody, {[name]: value})});
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

  _updateAutoInput(val) {
    if (val.length > 0) this.props.requestPublication();
    this.setState({pub1input: val}, _ => {
      this.props.searchPublications(this.state.pub1input)
      .then(response => this.setState({
        employerAutocompleteList: response,
      }));
    });
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
        {state.open &&
          <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Edit Contact' onRequestClose={_ => this.setState({open: false})}>
        {props.isReceiving &&
          <FontIcon className={'fa fa-spinner fa-spin'}/>}
          <div className='row' style={{marginTop: 20}}>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>First Name</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.firstname || ''}
              name='firstname'
              onChange={e => this.onChange('firstname', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>Last Name</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.lastname || ''}
              name='lastname'
              onChange={e => this.onChange('lastname', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Email</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.email || ''}
              name='email'
              onChange={e => this.onChange('email', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Twitter</span>
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.twitter || ''}
              name='twitter'
              onChange={e => this.onChange('twitter', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Instagram</span>
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.instagram || ''}
              name='instagram'
              onChange={e => this.onChange('instagram', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>LinkedIn</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.linkedin || ''}
              name='linkedin'
              onChange={e => this.onChange('linkedin', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Phone #</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.phonenumber || ''}
              name='phonenumber'
              onChange={e => this.onChange('phonenumber', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Location</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.location || ''}
              name='location'
              onChange={e => this.onChange('location', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Blog</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.blog || ''}
              name='blog'
              onChange={e => this.onChange('blog', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Website</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.website || ''}
              name='website'
              onChange={e => this.onChange('website', e.target.value)}
              />
            </div>
            <div className={columnClassname}>
              <span>Notes</span>
              <TextField
              style={textfieldStyle}
              value={state.contactBody.notes || ''}
              name='notes'
              onChange={e => this.onChange('notes', e.target.value)}
              />
            </div>
        {props.list && props.list.fieldsmap !== null &&
          props.list.fieldsmap
          .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
          .map((fieldObj, i) => fieldObj.customfield && (
            <div key={i} className={columnClassname}>
              <span>{fieldObj.name}</span>
              <TextField
              value={state.customfields === null || !state.customfields.some(field => field.name === fieldObj.value) ? '' : find(state.customfields, field => field.name === fieldObj.value).value}
              style={textfieldStyle}
              ref={fieldObj.value}
              name={fieldObj.value}
              onChange={e => this.onCustomChange(fieldObj.value, e.target.value)}
              />
            </div>))}
           <div className='large-12 medium-12 small-12 columns vertical-center'>
              <span style={{whiteSpace: 'nowrap'}}>Publication</span>
              <AutoComplete
              id='pub1input'
              style={textfieldStyle}
              filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
              searchText={state.pub1input}
              onUpdateInput={this.updateAutoInput}
              onNewRequest={pub1input => this.setState({pub1input, employerAutocompleteList: []})}
              openOnFocus
              dataSource={state.employerAutocompleteList}
              />
            {props.publicationIsReceiving &&
              <FontIcon style={{color: grey400}} className='fa fa-spinner fa-spin'/>}
            </div>
            <div className='large-12 medium-12 small-12 columns vertical-center'>
            {state.pub1input.length > 0 && !props.publicationReducer[state.pub1input] && !props.publicationIsReceiving && !state.addPublicationPanelOpen &&
              <div style={{fontSize: '0.9em'}}>No publication found. <span className='pointer' onClick={_ => this.setState({addPublicationPanelOpen: true})}>Add one?</span></div>}
              <Collapse isOpened={state.addPublicationPanelOpen}>
                <PublicationFormStateful
                onHide={_ => this.setState({addPublicationPanelOpen: false})}
                bubbleUpValue={pub1input => this.setState({pub1input})}
                />
              </Collapse>
            </div>
          </div>
        </Dialog>}
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
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(publicationActions.createPublicationThenPatchContact(contactId, pubName, which)),
    addFeeds: (contactId, feeds) => Promise.all(feeds.map(feed => dispatch(feedActions.addFeed(contactId, props.listId, feed)))),
    fetchFeeds: _ => dispatch(feedActions.fetchContactFeeds(props.contactId)),
    requestPublication: () => dispatch(publicationActions.requestPublication()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditContact);
