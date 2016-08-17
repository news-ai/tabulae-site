import React, { Component } from 'react';
import { connect } from 'react-redux';
import SkyLight from 'react-skylight';
import Radium from 'radium';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';
import { globalStyles } from 'constants/StyleConstants';
import EmailPanelWrapper from '../pieces/EmailPanelWrapper.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ButtonMenu from '../pieces/ButtonMenu.react';
import ToggleableEditInput from '../pieces/ToggleableEditInput.react';
import DropFile from '../pieces/DropFile.react';

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
    marginLeft: '5px',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  },
  loading: {
    zIndex: 160,
    bottom: 10,
    right: 10,
    position: 'fixed'
  }
};

class Table extends Component {
  constructor(props) {
    super(props);
    window.addEventListener('mousewheel', function(event) {
      // We don't want to scroll below zero or above the width and height
      var maxX = this.scrollWidth - this.offsetWidth;
      var maxY = this.scrollHeight - this.offsetHeight;

      // If this event looks like it will scroll beyond the bounds of the element, prevent it and set the scroll to the boundary manually
      if (this.scrollLeft + event.deltaX < 0 ||
         this.scrollLeft + event.deltaX > maxX ||
         this.scrollTop + event.deltaY < 0  ||
         this.scrollTop + event.deltaY > maxY) {

        event.preventDefault();

        // Manually set the scroll to the boundary
        this.scrollLeft = Math.max(0, Math.min(maxX, this.scrollLeft + event.deltaX));
        this.scrollTop = Math.max(0, Math.min(maxY, this.scrollTop + event.deltaY));
      }
    }, false);
    const { listData } = this.props;
    this.state = {
      name: null,
      onTitleEdit: false,
      emailPanelOpen: false,
      selectedContacts: []
    }
    this._onSaveClick = this._onSaveClick.bind(this);
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
    .then( _ => {
      dispatch(actionCreators.fetchContacts(listId));
    });
  }

  componentWillReceiveProps(nextProps) {
    const { name } = nextProps;
    this.setState({ name: name });
  }

  _updateContacts() {
    const { dispatch } = this.props;
    const selected = this.state.selectedContacts
    .filter( contact => contact.isoutdated )
    .map( contact => dispatch(actionCreators.updateContact(contact.id)) );
  }

  _handleNormalField(colHeaders, row) {
    const { pubMapByName, publicationReducer } = this.props;
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

  _saveOperations(localData, colHeaders, fieldsmap) {
    const { dispatch, listId } = this.props;
    let addContactList = [];
    let patchContactList = [];

    localData.map( row => {
      let field = this._handleNormalField(colHeaders, row);

      // handle customfields
      let customRow = [];
      fieldsmap.map( fieldObj => {
        if (!_.isEmpty(row[fieldObj.value])) customRow.push({ name: fieldObj.value, value: row[fieldObj.value]});
      })
      field.customfields = customRow;

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
      const appendIdList = json.map( contact => contact.id );
      const newIdList = origIdList.concat(appendIdList);
      dispatch(actionCreators.patchList({
        listId,
        name: this.state.name,
        contacts: newIdList,
        fieldsmap
      }));
      });
    } else {
      // clean up LIST by patching only non-empty rows
      dispatch(actionCreators.patchList({
        listId,
        name: this.state.name,
        contacts: origIdList,
        fieldsmap
      }));
    }
  }

  _onSaveClick(localData, colHeaders, fieldsmap) {
    // create publications for later usage
    Promise.all(this._createPublicationPromises(localData, colHeaders))
    .then( _ => {
      this._saveOperations(localData, colHeaders, fieldsmap);
    })
  }

  render() {
    const {
      listId,
      listData,
      listIsReceiving,
      contactIsReceiving,
      contacts,
      lastFetchedIndex
    } = this.props;

    return (
      <div>
      {
        contactIsReceiving ? <i
        style={styles.loading}
        className='fa fa-spinner fa-spin fa-3x'
        aria-hidden='true'></i> : null
      }
      {
        listData === undefined ? <i style={styles.loading} className='fa fa-spinner fa-spin fa-3x' aria-hidden='true'></i> :
        <div>
          <div style={[styles.nameBlock.parent]}>
            <div className='three columns'>
            <ToggleableEditInput
            name={this.state.name}
            updateName={this._updateName}
            toggleTitleEdit={this._toggleTitleEdit}
            onTitleEdit={this.state.onTitleEdit}
            />
            </div>
          </div>
          <SkyLight
          overlayStyles={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
          dialogStyles={{
            height: '600px',
            width: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            padding: '10px',
            zIndex: 1000,
            overflow: 'scroll',
            transform: 'translate(-50%, -50%)'
          }} hideOnOverlayClicked ref='input' title='File Drop'>
            <DropFile
            listId={listId}
            />
          </SkyLight>
          <ButtonMenu>
            <button className='button' style={{
              backgroundColor: this.state.emailPanelOpen ? 'lightgray' : 'white'
            }} onClick={this._toggleEmailPanel}>Email</button>
            <button className='button' style={{
              backgroundColor: 'white'
            }} onClick={this._updateContacts}>Update Contacts</button>
            <button
            className='button'
            style={{backgroundColor: 'white'}}
            onClick={ _ => this.refs.input.show() }>
            Upload from File</button>
          </ButtonMenu>
          { this.state.emailPanelOpen ? 
            <EmailPanelWrapper
            selectedContacts={this.state.selectedContacts}
            customfields={listData.customfields}
            /> : null }
          <HandsOnTable
          listId={this.props.listId}
          _onSaveClick={this._onSaveClick}
          _getSelectedRows={this._getSelectedRows}
          listData={listData}
          contacts={contacts}
          isNew={false}
          lastFetchedIndex={lastFetchedIndex}
          />
        </div>
      }
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  let lastFetchedIndex = -1;
  const listId = parseInt(props.params.listId, 10);
  const contactIsReceiving = state.contactReducer.isReceiving;
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  let contacts = [];

  if (listData) {
    if (!_.isEmpty(listData.contacts)) {
      contacts = listData.contacts.map( (contactId, i) => {
        if (state.contactReducer[contactId]) {
          lastFetchedIndex = i;
          return state.contactReducer[contactId];
        }
        else return {};
      });
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
    listIsReceiving: state.listReducer.isReceiving,
    listData: listData,
    contacts: contacts,
    name: listData ? listData.name : null,
    contactIsReceiving: contactIsReceiving,
    pubMapByName: publicationReducer,
    publicationReducer,
    lastFetchedIndex
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

