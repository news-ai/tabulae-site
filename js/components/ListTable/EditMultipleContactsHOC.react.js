import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as contactActions} from 'components/Contacts';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Textarea from 'react-textarea-autosize';
import Collapse from 'react-collapse';
import PublicationFormStateful from './PublicationFormStateful.react';

import 'react-select/dist/react-select.css';
import isURL from 'validator/lib/isURL';
import {fromJS, is} from 'immutable';
import {yellow50} from 'material-ui/styles/colors';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

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
  const {listid, id, firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website} = contact;
  return {listid, id, firstname, lastname, email, twitter, instagram, linkedin, phonenumber, blog, notes, website};
};

const _getPublicationName = (contact, reducer) => {
  if (contact.employers === null) return '';
  else {
    const id = contact.employers[0];
    return reducer[id].name;
  }
};

const columnClassname = 'large-6 medium-12 small-12 columns vertical-center';

class EditMultipleContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: {},
      customfields: []
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onChange = this._onChange.bind(this);
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
      // if (!this.props.feeds) this.props.fetchFeeds();
    }
  }

  _onSubmit() {
    let patchCustomfields = {};
    this.props.list.fieldsmap
    .filter(fieldObj => fieldObj.customfield && !fieldObj.readonly)
    .map(fieldObj => {
      const val = this.refs[fieldObj.name].input.value;
      if (!val) return;
      patchCustomfields[fieldObj.value] = val;
    });
    if (isEmpty(patchCustomfields) && isEmpty(this.state.contactBody)) return;
    let patchContact = {};
    Object.keys(this.state.contactBody)
    .filter(key => this.state.contactBody[key])
    .map(key => patchContact[key] = this.state.contactBody[key]);

    let strippedCustomfieldsMap = {};
    this.props.list.fieldsmap.filter(fieldObj => strippedCustomfieldsMap[fieldObj.value] = fieldObj.readonly);

    const newContacts = this.props.selectContacts.map(contact => {
      let fields = contact.customfields === null ? [] : contact.customfields;
      let customfields = fields
      .filter(field => !strippedCustomfieldsMap[field.name] && !patchCustomfields[field.name]);
      Object.keys(patchCustomfields).map(key => customfields.push({name: key, value: patchCustomfields[key]}));
      return Object.assign({}, _getter(contact), patchContact, {customfields});
    });
    this.props.patchContacts(newContacts)
    .then(_ => this.setState({open: false, contactBody: {}, customfields: []}));
  }

  _onChange(name, value) {
    this.setState({contactBody: Object.assign({}, this.state.contactBody, {[name]: value})});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
      label='Cancel'
      onClick={_ => this.setState({open: false, contactBody: {}, customfields: []})}
      />,
      <FlatButton
      label='Submit'
      onClick={this.onSubmit}
      />,
    ];
    return (
      <div className={props.className}>
        {state.open &&
          <Dialog actions={actions} autoScrollBodyContent modal open={state.open} title='Edit Multiple Contacts' onRequestClose={_ => this.setState({open: false})}>
          <div style={{margin: 10,padding: 10, fontSize: '0.8em', backgroundColor: yellow50}}>
            Warning: content added here will be applied to all selected contacts.
          </div>
          <div className='row' style={{marginTop: 20}}>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>First Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.firstname || ''} name='firstname' onChange={e => this.onChange('firstname', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span style={{whiteSpace: 'nowrap'}}>Last Name</span>
              <TextField style={textfieldStyle} value={state.contactBody.lastname || ''} name='lastname' onChange={e => this.onChange('lastname', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Email</span>
              <TextField style={textfieldStyle} value={state.contactBody.email || ''} name='email' onChange={e => this.onChange('email', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Phone #</span>
              <TextField style={textfieldStyle} value={state.contactBody.phonenumber || ''} name='phonenumber' onChange={e => this.onChange('phonenumber', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Blog</span>
              <TextField style={textfieldStyle} value={state.contactBody.blog || ''} name='blog' onChange={e => this.onChange('blog', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Website</span>
              <TextField style={textfieldStyle} value={state.contactBody.website || ''} name='website' onChange={e => this.onChange('website', e.target.value)}/>
            </div>
            <div className={columnClassname}>
              <span>Notes</span>
              <TextField style={textfieldStyle} value={state.contactBody.notes || ''} name='notes' onChange={e => this.onChange('notes', e.target.value)}/>
            </div>
            {props.list.fieldsmap.filter(fieldObj => fieldObj.customfield && !fieldObj.readonly).map(fieldObj =>
            <div key={fieldObj.name} className={columnClassname}>
              <span>{fieldObj.name}</span>
              <TextField ref={fieldObj.name} name={fieldObj.name} style={textfieldStyle}/>
            </div>)}
          </div>
        </Dialog>}
        {props.children({onRequestOpen: _ => this.setState({open: true})})}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listId],
    selectContacts: props.selected.map(id => state.contactReducer[id]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    patchContact: (contactId, body) => dispatch(contactActions.patchContact(contactId, body)),
    patchContacts: (contactList) => dispatch(contactActions.patchContacts(contactList)),
    patchList: listBody => dispatch(listActions.patchList(listBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditMultipleContacts);
