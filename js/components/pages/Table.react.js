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
  },
  icon: {
    color: 'lightgray',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
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
    this._createPublicationPromises = this._createPublicationPromises.bind(this);
    this._saveOperations = this._saveOperations.bind(this);
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
    .map( contact => dispatch(actionCreators.updateContact(contact.id)) );
  }

  _handleNormalField(colHeaders, row) {
    const { pubMapByName, pubArrayByName, publicationReducer } = this.props;
    let field = {};
    colHeaders.map( header => {
      const name = header.data;
      if (!_.isEmpty(row[name])) {
        // only columns labeled as pass can send data to api
        if (header.pass) field[name] = row[name];
      }
    });
    if (!_.isEmpty(row.employerString)) {
      const employerNames = row.employerString.split(',');
      const employers = employerNames.map( eName => pubMapByName[eName] );
      field.employers = employers;
    }
    if (row.id) field.id = row.id;
    return field;
  }

  _createPublicationPromises(localData, colHeaders) {
    const { publicationReducer, dispatch } = this.props;
    let promises = [];
    localData.map( row => {
      colHeaders.map( header => {
        const name = header.data;
        if (!_.isEmpty(row[name])) {
          // only columns labeled as pass can send data to api
          if (!header.pass && name === 'employerString') {
              const employerNames = row[name].split(',');
              const createPubNameList = employerNames.filter( eName => !publicationReducer[eName]);
              createPubNameList.map( eName =>
                promises.push(dispatch(actionCreators.createPublication({ name: eName })))
                );
          }
        }
      });
    });
    return promises;
  }

  _saveOperations(localData, colHeaders, customfields) {
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

  _onSaveClick(localData, colHeaders, customfields) {
    // create publications for later usage
    Promise.all(this._createPublicationPromises(localData, colHeaders))
    .then( _ => {
      this._saveOperations(localData, colHeaders, customfields);
    })
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
      { contactIsReceiving ? <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> : null }
      { isReceiving || listData === undefined ? <i className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> :
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
              <div onClick={this._toggleTitleEdit}>
                <span
                style={[styles.nameBlock.title]}
                >{this.state.name}</span>
                <i
                className='fa fa-pencil-square-o'
                style={[styles.icon]}
                aria-hidden='true'></i>
              </div>
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

  // make employerString for table renderer
  contacts.map( (contact, i) => {
    if (!_.isEmpty(contact.employers)) {
      // generate string to be rendered by custom cell in table
      const employerString = contact.employers
      .filter( employerId => publicationReducer[employerId])
      .map( eId => {
        const name = publicationReducer[eId].name;
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
    pubMapByName: publicationReducer,
    publicationReducer: publicationReducer
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

