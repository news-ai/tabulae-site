import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as contactActions} from 'components/Contacts';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Textarea from 'react-textarea-autosize';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {yellow50} from 'material-ui/styles/colors';

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

function createParser(url) {
  let parser = document.createElement('a');
  parser.href = url;
  return parser;
}

class AddContactHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: {},
      pub1input: '',
      employerAutocompleteList: [],
      rssfeedsTextarea: ''
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
    this.updateAutoInput = this._updateAutoInput.bind(this);
    this.handleRSSTextarea = this._handleRSSTextarea.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
    }
  }

  _onSubmit() {
    let customRow = [];
    let contactBody = this.state.contactBody;
    const list = this.props.list;
    const pub1input = this.state.pub1input;
    list.fieldsmap
    .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
    .map(fieldObj => {
      if (fieldObj.customfield && this.refs[fieldObj.value]) {
        const value = this.refs[fieldObj.value].getValue();
        if (value.length > 0) customRow.push({name: fieldObj.value, value});
      }
    });
    if (customRow.length > 0) contactBody.customfields = customRow;
    contactBody.listid = list.id;

    this.props.addContacts([contactBody])
    .then(contacts => {
      const ids = contacts.map(contact => contact.id);
      if (pub1input.length > 0) {
        ids.map(id => this.props.createPublicationThenPatchContact(id, pub1input, 'employers'));
      }
      ids.map(id => this.handleRSSTextarea(id));
      const listBody = {
        listId: list.id,
        name: list.name,
        contacts: list.contacts === null ? ids : [...list.contacts, ...ids]
      };
      this.props.patchList(listBody);
      this.setState({open: false, contactBody: {}, rssfeedsTextarea: ''});
    });
  }

  _onChange(name, value, validator) {
    const content = validator ? validator(value) : value;
    this.setState({
      contactBody: Object.assign({}, this.state.contactBody, {[name]: content})
    });
  }

  _updateAutoInput(val) {
    this.setState({pub1input: val});
    setTimeout(_ => {
      this.props.searchPublications(this.state.pub1input)
      .then(response => this.setState({
        employerAutocompleteList: response,
      }));
    }, 500);
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
        onTouchTap={_ => this.setState({open: false, rssfeedsTextarea: ''})}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.onSubmit}
      />,
    ];
    return (
      <div>
        <Dialog autoScrollBodyContent modal actions={actions} open={state.open} title='Add Contact' onRequestClose={_ => this.setState({open: false})}>
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
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.twitter || ''}
              name='twitter'
              onChange={e => this.onChange(
                'twitter',
                e.target.value,
                value => {
                  if (isURL(value)) {
                    const parser = createParser(value);
                    if (parser.hostname === 'twitter.com') {
                      const path = parser.pathname.split('/');
                      return path[path.length - 1];
                    } else {
                      return value;
                    }
                  }
                  return value;
                }
                )}
              />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Instagram</span>
              <TextField
              hintText='adding will populate the feed'
              style={textfieldStyle}
              value={state.contactBody.instagram || ''}
              name='instagram'
              onChange={e => this.onChange(
                'instagram',
                e.target.value,
                value => {
                  if (isURL(value)) {
                    const parser = createParser(value);
                    if (parser.hostname === 'instagram.com' || parser.hostname === 'www.instagram.com') {
                      const path = parser.pathname.split('/').filter(val => val.length > 0);
                      return path[path.length - 1];
                    } else {
                      return value;
                    }
                  }
                  return value;
                }
                )}/>
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
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span style={{whiteSpace: 'nowrap'}}>Publication</span>
              <AutoComplete
              id='pub1input'
              style={textfieldStyle}
              filter={AutoComplete.noFilter}
              onUpdateInput={this.updateAutoInput}
              onNewRequest={pub1input => this.setState({pub1input})}
              openOnFocus
              dataSource={state.employerAutocompleteList}
              />
            </div>
            {props.list && props.list.fieldsmap !== null &&
              props.list.fieldsmap
              .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
              .map((fieldObj, i) => fieldObj.customfield && (
                <div key={i} className='large-6 medium-12 small-12 columns vertical-center'>
                  <span>{fieldObj.name}</span><TextField style={textfieldStyle} ref={fieldObj.value} name={fieldObj.value} />
                </div>
                ))}
            <div className='panel' style={{
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
            </div>
            <div className='large-12 medium-12 small-12 columns'>
              <span style={{whiteSpace: 'nowrap'}}>RSS Feeds</span>
              <span style={{whiteSpace: 'nowrap', fontSize: '0.8em'}}> * Separate feeds with a new line</span>
              <Textarea
              value={state.rssfeedsTextarea}
              maxRows={10}
              onChange={e => this.setState({rssfeedsTextarea: e.target.value})}
              />
            </div>
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
    publicationReducer: state.publicationReducer
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchList: listBody => dispatch(listActions.patchList(listBody)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, pubName, which) => dispatch(publicationActions.createPublicationThenPatchContact(contactId, pubName, which)),
    addFeeds: (contactId, feeds) => Promise.all(feeds.map(feed => dispatch(feedActions.addFeed(contactId, props.listId, feed))))

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContactHOC);

