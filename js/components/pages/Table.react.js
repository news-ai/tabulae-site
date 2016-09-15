import React, { Component } from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Radium from 'radium';
import SkyLight from 'react-skylight';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';
import {globalStyles, skylightStyles, buttonStyle} from 'constants/StyleConstants';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ToggleableEditInput from '../pieces/ToggleableEditInput.react';
import DropFile from '../ImportFile';
import Waiting from '../Waiting';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const styles = {
  nameBlock: {
    parent: {
      marginTop: '40px',
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
  loading: {
    zIndex: 200,
    top: 80,
    right: 10,
    position: 'fixed'
  }
};

function escapeHtml(unsafe) {
  return unsafe
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
 }

function convertToCsvString(data, colHeaders) {
  let base = 'data:text/csv;charset=utf-8,';
  const headers = colHeaders.map(header => header.data);
  base += headers.toString() + '\n';
  data.map(row => {
    let rowStringArray = [];
    headers.map(header => {
      const el = row[header];
      if (el !== null && el) {
        if (el.split(',').length > 1) rowStringArray.push('\"' + escapeHtml(el) + '\"');
        else rowStringArray.push(escapeHtml(el));
      } else {
        rowStringArray.push('');
      }
    });
    base += rowStringArray.toString() + '\n';
  });
  return base;

}

class Table extends Component {
  constructor(props) {
    super(props);
    // const {listData} = this.props;
    this.state = {
      name: null,
      isTitleEditing: false,
      isEmailPanelOpen: false,
      selectedContacts: [],
      isSaved: true, // table without change
      person: null,
      lastSavedAt: null,
      isMenuOpen: false,
      searchValue: '',
      isSearchOn: false,
      searchContacts: [],
      errorText: null,
      localData: null,
      colHeaders: null
    }
    this.onMenuTouchTap = e => {
      e.preventDefault();
      this.setState({isMenuOpen: true, anchorEl: e.currentTarget});
    }
    this.handleRequestMenuClose = _ => this.setState({isMenuOpen: false});

    this._onSaveClick = this._onSaveClick.bind(this);
    this.onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this.onUpdateName = e => this.setState({name: e.target.value.substr(0, 140)});
    this.toggleEmailPanel = _ => this.setState({isEmailPanelOpen: !this.state.isEmailPanelOpen});
    this.getSelectedRows = contacts => this.setState({selectedContacts: contacts});
    this.updateContacts = this._updateContacts.bind(this);
    this._handleNormalField = this._handleNormalField.bind(this);
    this._createPublicationPromises = this._createPublicationPromises.bind(this);
    this._saveOperations = this._saveOperations.bind(this);
    this._fetchOperations = this._fetchOperations.bind(this);
    this.isDirty = _ => this.setState({isSaved: false});
    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onExportClick = this._onExportClick.bind(this);
  }

  componentWillMount() {
    if (this.props.searchQuery) {
      this._fetchOperations().then(_ => this.onSearchClick(this.props.searchQuery));
    } else {
      this._fetchOperations();
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    if (this.props.firstTimeUser) {
      setTimeout( _ => {
        const steps = [{
          text: 'If the contact is highlighted yellow, that means the Employer field is different from what the LinkedIn field tells us. You can auto-update selected contacts under Utilities tab.',
          selector: '.handsontable',
          position: 'top-left',
          type: 'hover'
        }, {
          text: 'Here is where you can do things like, update contacts in your sync that are out-of-date with LinkedIn and import existing Excel sheets.',
          selector: '.menubutton',
          position: 'bottom',
        }];
        this.props.addSteps(steps);
      }, 5000);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.state.name) this.setState({name: nextProps.name });
    if (this.state.person === null) this.setState({person: nextProps.person});
    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) this.onSearchClick(nextProps.searchQuery);
    }
  }

  routerWillLeave(nextLocation) {
    // return false to prevent a transition w/o prompting the user,
    // or return a string to allow the user to decide:
    if (!this.state.isSaved) return 'Your work is not saved! Are you sure you want to leave?'
    // return 'Are you sure you want to leave this page?'
  }

  _onSearchClick(searchValue) {
    const props = this.props;
    if (searchValue !== this.state.searchValue) this.setState({searchValue});
    props.searchListContacts(props.listId, searchValue)
    .then(obj => {
      const searchContacts = obj.ids.map(id => obj.searchContactMap[id]);
      let errorText = null;
      if (searchContacts.length === 0) errorText = 'No such term.'
      this.setState({searchContacts, errorText, isSearchOn: true});
    });
  }

  _onSearchClearClick() {
    this.props.router.push(`/lists/${this.props.listId}`);
    this.setState({
      searchContacts: [],
      searchValue: '',
      errorText: null,
      isSearchOn: false
    });
  }

  _fetchOperations() {
    const props = this.props;
    return props.fetchList(props.listId)
    .then(_ => props.fetchContacts(props.listId));
  }

  _updateContacts() {
    const selected = this.state.selectedContacts
    .filter(contact => contact.isoutdated )
    .map(contact => this.props.updateOutdatedContacts(contact.id));
  }

  _handleNormalField(colHeaders, row) {
    const {pubMapByName, publicationReducer, listData} = this.props;
    let field = {};
    const fieldsmap = listData.fieldsmap;
    colHeaders.map(header => {
      const name = header.data;
      if (!_.isEmpty(row[name])) {
        if (fieldsmap.some(fieldObj => fieldObj.value === name && !fieldObj.customfield)) {
          field[name] = row[name];
        }
        let employers = [];
        if (row['publication_name_1']) employers.push(publicationReducer[row['publication_name_1']]);
        if (row['publication_name_2']) employers.push(publicationReducer[row['publication_name_2']]);
        field.employers = employers;
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
    const props = this.props;
    let promises = [];
    localData.map( row => {
      if (row['publication_name_1']) {
        const pubName1 = row['publication_name_1'];
        if (!props.publicationReducer[pubName1]) {
          promises.push(props.createPublication({name: pubName1}));
        }
      }
      if (row['publication_name_2']) {
        const pubName2 = row['publication_name_2'];
        if (!props.publicationReducer[pubName2]) {
          promises.push(props.createPublication({name: pubName2}));
        }
      }
    });
    return promises;
  }

  _saveOperations(localData, colHeaders, fieldsmap, dirtyRows) {
    const props = this.props;
    const state = this.state;
    let addContactList = [];
    let patchContactList = [];
    this.setState({localData, colHeaders});

    localData.map( row => {
      let field = this._handleNormalField(colHeaders, row);

      // handle customfields
      let customRow = [];
      fieldsmap.map( fieldObj => {
        if (!_.isEmpty(row[fieldObj.value]) && fieldObj.customfield) {
          customRow.push({name: fieldObj.value, value: row[fieldObj.value]});
        }
      })
      if (customRow.length > 0) field.customfields = customRow;

      // filter out for empty rows with only id
      if (!_.isEmpty(field)) {
        if (field.id) {
          if (dirtyRows.some( rowId => rowId === field.id )) patchContactList.push(field);
        } else {
          field.listid = props.listId;
          addContactList.push(field);
        }
      }
    });

    // update existing contacts
    const origIdList = props.listData.contacts || [];
    // console.log(patchContactList);
    // console.log(addContactList);

    if (patchContactList.length > 0) props.patchContacts(patchContactList);

    // create new contacts and append new rows to LIST
    if (addContactList.length > 0 && !state.isSearchOn) {
      props.addContacts(addContactList)
      .then(json => {
        const appendIdList = json.map( contact => contact.id );
        const newIdList = origIdList.concat(appendIdList);
        props.patchList({
          listId: props.listId,
          name: state.name,
          contacts: newIdList,
          fieldsmap
        });
      });
    } else {
      // if no new contacts, see if list needs update
      if (state.name !== props.listData.name) {
        props.patchList({listId: props.listId, name: state.name});
      }

      if (addContactList.length > 0 && state.isSearchOn) {
        alertify.alert(`Can't add new rows while Search is on.`);
      }
    }
    const currentdate = new Date(); 
    const datetime = `Last Sync: ${currentdate.toTimeString()}`;
    this.setState({
      isSaved: true,
      lastSavedAt: datetime
    });
  }

  _onSaveClick(localData, colHeaders, fieldsmap, dirtyRows) {
    console.log('SAVE CLICKED');
    Promise.all(this._createPublicationPromises(localData, colHeaders))
    .then( _ => this._saveOperations(localData, colHeaders, fieldsmap, dirtyRows));
  }

  _onExportClick() {
    if (this.state.isDirty || this.state.localData === null) {
      alertify.alert('Please save first!')
      return;
    }
    const csvString = convertToCsvString(this.state.localData, this.state.colHeaders);
    const csvFile = encodeURI(csvString);
    const link = document.createElement('a');
    link.setAttribute('href', csvFile);
    link.setAttribute('download', this.state.name);
    link.click();
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div>
      <Waiting isReceiving={props.contactIsReceiving || props.listData === undefined} style={styles.loading} />
      {
        props.listData ?
        <div>
          <SkyLight
            ref='input'
            overlayStyles={skylightStyles.overlay}
            dialogStyles={skylightStyles.dialog}
            hideOnOverlayClicked
            title='File Drop'>
              <DropFile
              listId={props.listId}
              />
          </SkyLight>
          <div className='row' style={[styles.nameBlock.parent]}>
            <div className='small-12 medium-8 large-4 columns'>
              <ToggleableEditInput
              name={state.name}
              onUpdateName={this.onUpdateName}
              onToggleTitleEdit={this.onToggleTitleEdit}
              isTitleEditing={state.isTitleEditing}
              />
            </div>
            
            <div className='small-12 large-6 columns' style={{display: 'flex', alignItems: 'center'}}>
              <TextField
                hintText='Search...'
                value={this.state.searchValue}
                onChange={e => this.setState({searchValue: e.target.value})}
                onKeyDown={e => e.keyCode === 13 ? props.router.push(`/lists/${props.listId}?search=${state.searchValue}`) : null}
                errorText={state.errorText}
              />
              <RaisedButton style={{marginLeft: '5px'}} onClick={_=> props.router.push(`/lists/${props.listId}?search=${state.searchValue}`)} label='Search' labelStyle={{textTransform: 'none'}} />
              <RaisedButton style={{margin: '3px'}} onClick={this.onSearchClearClick} label='Clear' labelStyle={{textTransform: 'none'}} />
            </div>
            <div className='hide-for-small-only medium-1 medium-offset-10 large-1 large-offset-11 columns'>
              <div style={{position: 'fixed', top: 100, zIndex: 190}}>
                <RaisedButton
                className='menubutton'
                labelStyle={{textTransform: 'none'}}
                onClick={this.onMenuTouchTap}
                label='Utilities'
                icon={<i className='fa fa-cog' aria-hidden='true' />}
                />
              </div>
              <Popover
              open={state.isMenuOpen}
              anchorEl={state.anchorEl}
              onRequestClose={this.handleRequestMenuClose}
              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              >
                <Menu>
                  <MenuItem onClick={this.updateContacts} primaryText='Update Selected Contacts' />
                  <MenuItem checked={state.isEmailPanelOpen} primaryText='Email' onClick={this.toggleEmailPanel} />
                  <MenuItem primaryText='Import from File' onClick={_ => this.refs.input.show()} />
                  <MenuItem primaryText='Export' onClick={this.onExportClick} />
                </Menu>
              </Popover>
            </div>
          </div>
          {
            state.isEmailPanelOpen ? 
            <EmailPanel
            person={props.person}
            selectedContacts={state.selectedContacts}
            fieldsmap={props.listData.fieldsmap}
            listId={props.listId}
            onClose={this.toggleEmailPanel}
            /> : null
          }
          <div style={{marginTop: '30px'}}>
            <HandsOnTable
            {...props}
            isSearchOn={state.isSearchOn}
            lastSavedAt={state.lastSavedAt}
            listId={props.listId}
            onSaveClick={this._onSaveClick}
            _getSelectedRows={this.getSelectedRows}
            listData={props.listData}
            contacts={state.isSearchOn ? state.searchContacts : props.contacts}
            isNew={false}
            lastFetchedIndex={props.lastFetchedIndex}
            isDirty={this.isDirty}
            />
          </div>
        </div> : null
      }
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  let lastFetchedIndex = -1;
  const listId = parseInt(props.params.listId, 10);
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  let contacts = [];

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  if (listData) {
    if (!_.isEmpty(listData.contacts)) {
      listData.contacts.map( (contactId, i) => {
        if (state.contactReducer[contactId]) {
          lastFetchedIndex = i;
          contacts.push(state.contactReducer[contactId]);
        }
      });
    }
  }

  const searchQuery = props.location.query.search;

  return {
    searchQuery,
    listId: listId,
    listIsReceiving: state.listReducer.isReceiving,
    listData: listData,
    contacts: contacts,
    name: listData ? listData.name : null,
    contactIsReceiving: state.contactReducer.isReceiving,
    pubMapByName: publicationReducer,
    publicationReducer,
    lastFetchedIndex,
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: action => dispatch(action),
    searchListContacts: (listId, query) => dispatch(actionCreators.searchListContacts(listId, query)),
    patchList: listObj => dispatch(actionCreators.patchList(listObj)),
    patchContacts: contacts => dispatch(actionCreators.patchContacts(contacts)),
    addContacts: contacts => dispatch(actionCreators.addContacts(contacts)),
    createPublication: name => dispatch(actionCreators.createPublication(name)),
    updateOutdatedContacts: contactId => dispatch(actionCreators.updateContact(contactId)),
    fetchList: listId => dispatch(actionCreators.fetchList(listId)),
    fetchContacts: listId => dispatch(actionCreators.fetchContacts(listId)),
    searchPublications: query => dispatch(actionCreators.searchPublications(query))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Radium(Table)));

