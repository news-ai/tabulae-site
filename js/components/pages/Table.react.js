import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanelWrapper from '../pieces/EmailPanelWrapper.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import Radium from 'radium';
import _ from 'lodash';
import 'isomorphic-fetch';
import { globalStyles } from '../../constants/StyleConstants';


const styles = {
  nameBlock: {
    parent: {
      margin: '15px',
    },
    title: {
      marginLeft: '5px',
      marginRight: '5px'
    }
  },
  emailPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    zIndex: 100,
    height: '500px',
    width: '600px'
  }
};

class Table extends Component {
  constructor(props) {
    super(props);
    const { listData } = this.props;
    this.state = {
      name: null,
      onTitleEdit: false,
      emailPanelOpen: false,
      selectedContacts: []
    }
    this._onEmailClick = this._onEmailClick.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this._getCustomRow = this._getCustomRow.bind(this);
    this._updateName = e => this.setState({ name: e.target.value.substr(0, 140) });
    this._toggleTitleEdit = _ => this.setState({ onTitleEdit: !this.state.onTitleEdit });
    this._toggleEmailPanel = _ => this.setState({ emailPanelOpen: !this.state.emailPanelOpen });
    this._getSelectedRows = this._getSelectedRows.bind(this);
    this._updateContacts = this._updateContacts.bind(this);
  }

  componentDidMount() {
    const { dispatch, listId, listData } = this.props;
    dispatch(actionCreators.fetchList(listId))
    .then( _ => dispatch(actionCreators.fetchContacts(listId)));
  }

  componentWillReceiveProps(nextProps) {
    const { name } = nextProps;
    this.setState({ name: name });
  }

  _onEmailClick(rowData) {

  }

  _getCustomRow(row, customfields) {
    let customRow = [];
    customfields.map( customfield => {
      if (row[customfield] !== null && row[customfield]) if (row[customfield].length !== 0) customRow.push({ name: customfield, value: row[customfield]})
    });
    return customRow;
  }

  _getSelectedRows(contacts) {
    console.log(contacts);
    // const contactsWithEmails = contacts.filter( contact => contact.email.length > 4 );
    this.setState({ selectedContacts: contacts });
  }
  
  _updateContacts() {
    const { dispatch } = this.props;
    const selected = this.state.selectedContacts
    .filter( contact => contact.isoutdated )
    .map( contact => dispatch(actionCreators.updateContact(contact.id)));
  }

  _onSaveClick(localData, colHeaders, table, customfields) {
    const { dispatch, listId } = this.props;
    let addContactList = [];
    let patchContactList = [];
    localData.map( function(row) {
      let field = {};
      colHeaders.map( (name) => {
        if (row[name] !== null && row[name]) if (row[name].length !== 0) if (name !== 'employerString') field[name] = row[name];
      });
      // JANK EMPLOYER CODE
      if (row.employers) field.employers = row.employers;

      if (customfields !== null && customfields) if (customfields.length > 0) {
        let customRow = [];
        customfields.map( customfield => {
          if (row[customfield] !== null && row[customfield]) if (row[customfield].length !== 0) customRow.push({ name: customfield, value: row[customfield]})
        });
        field.customfields = customRow;
      }
      console.log(field);

      // filter out for empty rows with only id
      if (!_.isEmpty(field) && colHeaders.some( name => name !== 'id' && field[name])) {
        if (field.id) patchContactList.push(field);
        else addContactList.push(field)
      }
    });

    // update existing contacts
    const origIdList = patchContactList.map( contact => contact.id );
    if (patchContactList.length > 0) {
      dispatch(actionCreators.patchContacts(patchContactList));
    }

    // append new rows to LIST
    if (addContactList.length > 0) dispatch(actionCreators.addContacts(addContactList))
    .then( json => {
      const appendIdList = json.map( contact => contact.id);
      const newIdList = origIdList.concat(appendIdList);
      dispatch(actionCreators.patchList(listId, this.state.name, newIdList, customfields));
    });

    // clean up LIST by patching only non-empty rows
    else dispatch(actionCreators.patchList(listId, this.state.name, origIdList, customfields));
  }


  render() {
    const { listId, listData, isReceiving, contactIsReceiving, contacts } = this.props;
    return (
      <div>
      { contactIsReceiving ? <img src='/img/default_loading.gif' /> : null }
      { isReceiving || listData === undefined ? <span>LOADING..</span> :
        <div>
          <div style={[styles.nameBlock.parent]}>
            <div className='three columns'>
            { this.state.onTitleEdit ? 
              <input
              className='u-full-width'
              type='text'
              onBlur={this._toggleTitleEdit}
              value={this.state.name}
              onChange={this._updateName}
              autoFocus
              /> :
              <span
              style={[styles.nameBlock.title]}
              onClick={this._toggleTitleEdit}
              >{this.state.name}</span>
            }
            </div>
          </div>
          <button style={{
            position: 'fixed',
            top: 15,
            right: 30,
            zIndex: 150,
            backgroundColor: this.state.emailPanelOpen ? 'lightgray' : 'white'
          }} onClick={this._toggleEmailPanel}>Email</button>
          <button style={{
            position: 'fixed',
            top: 60,
            right: 30,
            zIndex: 150,
            backgroundColor: 'white'
          }} onClick={this._updateContacts}>Update Contacts</button>
          { this.state.emailPanelOpen ? 
            <div>
            <EmailPanelWrapper
            selectedContacts={this.state.selectedContacts}
            customfields={listData.customfields}
            />
            </div>
            : null }
          <HandsOnTable
          listId={this.props.listId}
          _onSaveClick={this._onSaveClick}
          listData={listData}
          contacts={contacts}
          isNew={false}
          _getSelectedRows={this._getSelectedRows}
          />
        </div>
      }
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const isReceiving = state.listReducer.isReceiving;
  const contactIsReceiving = state.contactReducer.isReceiving;
  const listData = state.listReducer[listId];
  let contacts = [];
  let contactsLoaded = false;
  if (listData) {
    if (listData.contacts !== null && listData.contacts) {
      if (listData.contacts.every( contactId => state.contactReducer[contactId] )) {
        contactsLoaded = true;
        contacts = listData.contacts.map( contactId => state.contactReducer[contactId] );
      }
    }
  }
  return {
    listId: listId,
    isReceiving: isReceiving,
    listData: listData,
    contacts: contactsLoaded ? contacts : [],
    name: listData ? listData.name : null,
    contactIsReceiving: contactIsReceiving
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Radium(Table));

