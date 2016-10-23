import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';

import 'react-select/dist/react-select.css';

const textfieldStyle = {
  marginLeft: 10
};

class AddContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      contactBody: {},
      dataSource: [],
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.onUpdateInput = this._onUpdateInput.bind(this);
    this.onChange = this._onChange.bind(this);
    this.handleUpdateInput = value =>
      this.setState({
        dataSource: [
          value,
          value + value,
          value + value + value
        ]});
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
    list.fieldsmap
    .map(fieldObj => {
      if (fieldObj.customfield && this.refs[fieldObj.value]) {
        const value = this.refs[fieldObj.value].getValue();
        if (value.length > 0) customRow.push({name: fieldObj.value, value});
      }
    });
    if (customRow.length > 0) contactBody.customfields = customRow;

    this.props.addContacts([contactBody])
    .then(contacts => {
      const ids = contacts.map(contact => contact.id);
      const listBody = {
        listId: list.id,
        name: list.name,
        contacts: list.contacts === null ? ids : [...list.contacts, ...ids]
      };
      this.props.patchList(listBody);
      this.setState({open: false, contactBody: {}});
    });
  }

  _onChange(name, value) {
    this.setState({
      contactBody: Object.assign({}, this.state.contactBody, {[name]: value})
    });
  }

  _onUpdateInput(input, callback) {
    this.props.searchPublicationsByIdName(input)
    .then(options => callback(null, {options, complete: true}));
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={_ => this.setState({open: false})}
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
              <TextField style={textfieldStyle} value={state.contactBody.twitter || ''} name='twitter' onChange={e => this.onChange('twitter', e.target.value)}/>
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Instagram</span>
              <TextField style={textfieldStyle} value={state.contactBody.instagram || ''} name='instagram' onChange={e => this.onChange('instagram', e.target.value)}/>
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
            {/*<div className='large-6 medium-12 small-12 columns vertical-center'>
              <span style={{whiteSpace: 'nowrap'}}>Publication 1</span>
              <AutoComplete
              name='pub1'
              style={textfieldStyle}
              dataSource={state.dataSource}
              onUpdateInput={this.handleUpdateInput}
              />
            </div>*/
            }
            {props.list && props.list.fieldsmap !== null &&
              props.list.fieldsmap.map((fieldObj, i) => fieldObj.customfield && (
                <div key={i} className='large-6 medium-12 small-12 columns vertical-center'>
                  <span>{fieldObj.name}</span><TextField style={textfieldStyle} ref={fieldObj.value} name={fieldObj.value} />
                </div>
                ))}
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
    list: state.listReducer[props.listId]
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(actionCreators.addContacts(contacts)),
    patchList: listBody => dispatch(actionCreators.patchList(listBody)),
    searchPublicationsByIdName: query => dispatch(actionCreators.searchPublicationsByIdName(query)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContact);

