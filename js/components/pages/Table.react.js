import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import EmailPanelWrapper from '../pieces/EmailPanelWrapper.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ButtonMenu from '../pieces/ButtonMenu.react';
import Radium from 'radium';
import _ from 'lodash';
import { globalStyles } from 'constants/StyleConstants';

const styles = {
  nameBlock: {
    parent: {
      margin: '15px',
    },
    title: {
      marginLeft: '5px',
      marginRight: '5px',
      width: '500px',
      fontSize: '1.2em'
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
    this._onSaveClick = this._onSaveClick.bind(this);
    this._getCustomRow = this._getCustomRow.bind(this);
    this._updateName = e => this.setState({ name: e.target.value.substr(0, 140) });
    this._toggleTitleEdit = _ => this.setState({ onTitleEdit: !this.state.onTitleEdit });
    this._toggleEmailPanel = _ => this.setState({ emailPanelOpen: !this.state.emailPanelOpen });
    this._getSelectedRows = contacts => this.setState({ selectedContacts: contacts });
    this._updateContacts = this._updateContacts.bind(this);
    this._handleNormalField = this._handleNormalField.bind(this);
    this._passDataUp = this._passDataUp.bind(this);
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

  _getCustomRow(row, customfields) {
    let customRow = [];
    customfields.map( customfield => {
      if (!_.isEmpty(row[customfield])) if (row[customfield].length !== 0) customRow.push({ name: customfield, value: row[customfield]})
    });
    return customRow;
  }

  _updateContacts() {
    const { dispatch } = this.props;
    const selected = this.state.selectedContacts
    .filter( contact => contact.isoutdated )
    .map( contact => dispatch(actionCreators.updateContact(contact.id)));
  }

  _handleNormalField(colHeaders, row) {
    let field = {};
    colHeaders.map( (header) => {
      const name = header.data;
      if (!_.isEmpty(row[name])) {
        // only columns labeled as pass can send data to api
        if (header.pass) {
          field[name] = row[name];
        } else {
          if (name === 'employerString') {

          }

        }
      }
    });
    if (row.id) field.id = row.id;
    return field;
  }

  _onSaveClick(localData, colHeaders, customfields) {
    const { dispatch, listId } = this.props;
    let addContactList = [];
    let patchContactList = [];
    localData.map( row => {
      let field = this._handleNormalField(colHeaders, row);

      // handle customfields
      if (!_.isEmpty(customfields)) {
        let customRow = [];
        customfields.map( customfield => {
          if (!_.isEmpty(row[customfield])) customRow.push({ name: customfield, value: row[customfield]})
        });
        field.customfields = customRow;
      }

      // filter out for empty rows with only id
      if (!_.isEmpty(field) && colHeaders.some(header => header.pass && !_.isEmpty(field[header.data]))) {
        if (field.id) patchContactList.push(field);
        else addContactList.push(field)
      }
    });

    // update existing contacts
    const origIdList = patchContactList.map( contact => contact.id );
    // console.log(patchContactList);
    // console.log(addContactList);

    if (patchContactList.length > 0) dispatch(actionCreators.patchContacts(patchContactList));

    // create new contacts and append new rows to LIST
    if (addContactList.length > 0) {
        dispatch(actionCreators.addContacts(addContactList)).then( json => {
        const appendIdList = json.map( contact => contact.id);
        const newIdList = origIdList.concat(appendIdList);
        dispatch(actionCreators.patchList(listId, this.state.name, newIdList, customfields));
      });
    } else {
      // clean up LIST by patching only non-empty rows
      dispatch(actionCreators.patchList(listId, this.state.name, origIdList, customfields));
    }
  }

  _passDataUp() {
  }


  render() {
    const {
      listId,
      listData,
      isReceiving,
      contactIsReceiving,
      contacts,
      pubMapByName,
      pubArrayByName
    } = this.props;

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
          <ButtonMenu>
            <button style={{
              backgroundColor: this.state.emailPanelOpen ? 'lightgray' : 'white'
            }} onClick={this._toggleEmailPanel}>Email</button>
            <button style={{
              backgroundColor: 'white'
            }} onClick={this._updateContacts}>Update Contacts</button>
          </ButtonMenu>
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
          _getSelectedRows={this._getSelectedRows}
          _passDataUp={this._passDataUp}
          listData={listData}
          contacts={contacts}
          isNew={false}
          pubMapByName={pubMapByName}
          pubArrayByName={pubArrayByName}
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
  const publicationReducer = state.publicationReducer;
  let contacts = [];
  let contactsLoaded = false;
  if (listData) {
    if (!_.isEmpty(listData.contacts)) {
      if (listData.contacts.every( contactId => state.contactReducer[contactId] )) {
        contactsLoaded = true;
        contacts = listData.contacts.map( contactId => state.contactReducer[contactId] );
      }
    }
  }
  let pubMapByName = {};
  let pubArrayByName = [];
  // make employerString for table renderer
  contacts.map( (contact, i) => {
    if (!_.isEmpty(contact.employers)) {
      // generate string to be rendered by custom cell in table
      const employerString = contact.employers
      .filter( employerId => publicationReducer[employerId])
      .map( eId => {
        const name = publicationReducer[eId].name;
        if (!pubMapByName[name]) {
          pubMapByName[name] = eId;
          pubArrayByName.push(name);
        }
        return name;
      }).join(',');
      contacts[i].employerString = employerString;
    }
  })

  return {
    listId: listId,
    isReceiving: isReceiving,
    listData: listData,
    contacts: contactsLoaded ? contacts : [],
    name: listData ? listData.name : null,
    contactIsReceiving: contactIsReceiving,
    pubMapByName: pubMapByName,
    pubArrayByName: pubArrayByName
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

