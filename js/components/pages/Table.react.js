import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import _ from 'lodash';
import 'isomorphic-fetch';

class Table extends Component {
  constructor(props) {
    super(props);
    this._onEmailClick = this._onEmailClick.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    const { dispatch, listId } = this.props;
    dispatch(actionCreators.fetchList(listId))
    .then( _ => dispatch(actionCreators.fetchContacts(listId)));
  }

  _onEmailClick(rowData) {

  }

  _onSaveClick(localData, colHeaders, table) {
    const { dispatch, listId } = this.props;
    let addContactList = [];
    let patchContactList = [];
    localData.map( function(row) {
      let field = {};
      colHeaders.map( (name) => {
        if (row[name] !== null) if (row[name].length !== 0) field[name] = row[name];
      });
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
      dispatch(actionCreators.patchList(listId, undefined, newIdList));
    });

    // clean up LIST by patching only non-empty rows
    else dispatch(actionCreators.patchList(listId, undefined, origIdList));
  }

  render() {
    const { listId, listData, isReceiving, contacts } = this.props;
    console.log(contacts);
    return (
      <div>
      { isReceiving || listData === undefined ? <span>LOADING..</span> :
        <div>
          <p>{listData.name}</p>
          <EmailPanel />
          <HandsOnTable
          listId={this.props.listId}
          _onSaveClick={this._onSaveClick}
          listData={listData}
          contacts={contacts}
          isNew={false}
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
  const listData = state.listReducer[listId];
  let contacts = [];
  let contactsLoaded = false;
  if (listData !== undefined) {
    if (listData.contacts !== null) {
      if (listData.contacts.every( contactId => state.contactReducer[contactId] )) {
        contactsLoaded = true;
        contacts = listData.contacts.map( contactId => state.contactReducer[contactId] );
      }
    }
  }
  console.log(contacts);
  return {
    listId: listId,
    isReceiving: isReceiving,
    listData: listData,
    contacts: contactsLoaded ? contacts : []
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
)(Table);