import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/AppActions';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const textfieldStyle = {
  marginLeft: 10
};

class AddContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onSubmit = this._onSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open === false && this.state.open === true) {
      // onRequestOpen hit
    }
  }

  _onSubmit() {
    let contactBody = {};
    const list = this.props.list;
    list.fieldsmap
    .map(fieldObj => {
      if (!fieldObj.customfield) {
        if (this.refs[fieldObj.value]) {
          if (this.refs[fieldObj.value].input.value.length > 0) {
            contactBody[fieldObj.value] = this.refs[fieldObj.value].input.value;
          }
        } else {
          console.log(fieldObj.value);
        }
      }
    });

    this.props.addContacts([contactBody])
    .then(contacts => {
      const ids = contacts.map(contact => contact.id);
      const listBody = {
        listId: list.id,
        name: list.name,
        contacts: list.contacts === null ? ids : [...list.contacts, ...ids]
      };
      this.props.patchList(listBody);
      this.setState({open: false});
    });
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
              <span>Firstname</span><TextField style={textfieldStyle} ref='firstname' name='firstname' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Lastname</span><TextField style={textfieldStyle} ref='lastname' name='lastname' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Email</span><TextField style={textfieldStyle} ref='email' name='email' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Twitter</span><TextField style={textfieldStyle} ref='twitter' name='twitter' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Instagram</span><TextField style={textfieldStyle} ref='instagram' name='instagram' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>LinkedIn</span><TextField style={textfieldStyle} ref='linkedin' name='linkedin' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Phone #</span><TextField style={textfieldStyle} ref='phone' name='phone' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Blog</span><TextField style={textfieldStyle} ref='blog' name='blog' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Website</span><TextField style={textfieldStyle} ref='website' name='website' />
            </div>
            <div className='large-6 medium-12 small-12 columns vertical-center'>
              <span>Notes</span><TextField style={textfieldStyle} ref='notes' name='notes' />
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
    list: state.listReducer[props.listId]
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    addContacts: contacts => dispatch(actionCreators.addContacts(contacts)),
    patchList: listBody => dispatch(actionCreators.patchList(listBody)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContact);

