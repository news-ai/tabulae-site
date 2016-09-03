import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Radium from 'radium';
import SkyLight from 'react-skylight';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';
import { globalStyles, skylightStyles, buttonStyle } from 'constants/StyleConstants';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';

import { EmailPanel } from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ToggleableEditInput from '../pieces/ToggleableEditInput.react';
import DropFile from '../ImportFile';
import Waiting from '../pieces/Waiting.react.js';


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
    top: 80,
    right: 10,
    position: 'fixed'
  }
};

class Table extends Component {
  constructor(props) {
    super(props);
    const {listData} = this.props;
    this.state = {
      name: null,
      isTitleEditing: false,
      isEmailPanelOpen: false,
      selectedContacts: [],
      isSaved: true, // table without change
      person: null,
      lastSavedAt: null,
      isMenuOpen: false
    }
    this.onMenuTouchTap = e => {
      e.preventDefault();
      this.setState({isMenuOpen: true, anchorEl: e.currentTarget});
    }
    this.handleRequestMenuClose = _ => this.setState({isMenuOpen: false});

    this._onSaveClick = this._onSaveClick.bind(this);
    this._onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this._onUpdateName = e => this.setState({name: e.target.value.substr(0, 140)});
    this.toggleEmailPanel = _ => this.setState({isEmailPanelOpen: !this.state.isEmailPanelOpen});
    this._getSelectedRows = contacts => this.setState({selectedContacts: contacts});
    this._updateContacts = this._updateContacts.bind(this);
    this._handleNormalField = this._handleNormalField.bind(this);
    this._createPublicationPromises = this._createPublicationPromises.bind(this);
    this._saveOperations = this._saveOperations.bind(this);
    this._fetchOperations = this._fetchOperations.bind(this);
    this._isDirty = _ => this.setState({isSaved: false});
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentDidMount() {
    this._fetchOperations();
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    if (this.props.firstTimeUser) {
      console.log(this.props.firstTimeUser);
      setTimeout( _ => {
        const steps = [{
          text: 'If the contact is highlighted green, that means the Employer field is different from what the LinkedIn field tells us. You can auto-update selected contacts under Utilities tab.',
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
    if (nextProps.name !== this.state.name) this.setState({ name: nextProps.name });
    if (this.state.person === null) {
      const person = nextProps.person;
      this.setState({person});
    }
  }

  routerWillLeave(nextLocation) {
    // return false to prevent a transition w/o prompting the user,
    // or return a string to allow the user to decide:
    if (!this.state.isSaved) return 'Your work is not saved! Are you sure you want to leave?'
    return 'Are you sure you want to leave this page?'
  }

  _fetchOperations() {
    const { dispatch, listId } = this.props;
    dispatch(actionCreators.fetchList(listId))
    .then( _ => {
      dispatch(actionCreators.fetchContacts(listId));
    });
  }

  _updateContacts() {
    const { dispatch } = this.props;
    const selected = this.state.selectedContacts
    .filter( contact => contact.isoutdated )
    .map( contact => dispatch(actionCreators.updateContact(contact.id)) );
  }

  _handleNormalField(colHeaders, row) {
    const { pubMapByName, publicationReducer, listData} = this.props;
    let field = {};
    const fieldsmap = listData.fieldsmap;
    colHeaders.map( header => {
      const name = header.data;
      if (!_.isEmpty(row[name])) {
        if (fieldsmap.some( fieldObj => fieldObj.value === name && !fieldObj.customfield)) {
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
    const { publicationReducer, dispatch } = this.props;
    let promises = [];
    localData.map( row => {
      if (row['publication_name_1']) {
        const pubName1 = row['publication_name_1'];
        if (!publicationReducer[pubName1]) {
          promises.push(actionCreators.createPublication({name: pubName1}));
        }
      }
      if (row['publication_name_2']) {
        const pubName2 = row['publication_name_2'];
        if (!publicationReducer[pubName2]) {
          promises.push(actionCreators.createPublication({name: pubName2}));
        }
      }
    });
    return promises;
  }

  _saveOperations(localData, colHeaders, fieldsmap, dirtyRows) {
    const {dispatch, listId, listData, lastFetchedIndex} = this.props;
    let addContactList = [];
    let patchContactList = [];

    localData.map( row => {
      let field = this._handleNormalField(colHeaders, row);

      // handle customfields
      let customRow = [];
      fieldsmap.map( fieldObj => {
        if (!_.isEmpty(row[fieldObj.value]) && fieldObj.customfield) {
          customRow.push({ name: fieldObj.value, value: row[fieldObj.value]});
        }
      })
      if (customRow.length > 0) field.customfields = customRow;

      // filter out for empty rows with only id
      if (!_.isEmpty(field)) {
        if (field.id) {
          if (dirtyRows.some( rowId => rowId === field.id )) patchContactList.push(field);
        } else {
          addContactList.push(field);
        }
      }
    });

    // update existing contacts
    const origIdList = listData.contacts || [];

    if (patchContactList.length > 0) dispatch(actionCreators.patchContacts(patchContactList));

    // create new contacts and append new rows to LIST
    if (addContactList.length > 0) {
      dispatch(actionCreators.addContacts(addContactList))
      .then( json => {
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
      // if no new contacts, see if list needs update
      if (this.state.name !== listData.name) {
        dispatch(actionCreators.patchList({ listId, name: this.state.name }));
      }
    }
    const currentdate = new Date(); 
    const datetime = 'Last Sync: ' + currentdate.getHours() + ':'
                + currentdate.getMinutes() + ':' 
                + currentdate.getSeconds();
    this.setState({
      isSaved: true,
      lastSavedAt: datetime
    });
  }

  _onSaveClick(localData, colHeaders, fieldsmap, dirtyRows) {
    console.log('SAVE CLICKED');
    if (dirtyRows.length === 0) {
      this._saveOperations(localData, colHeaders, fieldsmap, dirtyRows);
    } else {
      // create publications for later usage
      Promise.all(this._createPublicationPromises(localData, colHeaders))
      .then( _ => {
        this._saveOperations(localData, colHeaders, fieldsmap, dirtyRows);
      });
    }
    this.setState({ isSaved: true });
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
          <div className='row' style={[styles.nameBlock.parent]}>
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
            <div className='six columns'>
              <ToggleableEditInput
              name={state.name}
              onUpdateName={this._onUpdateName}
              onToggleTitleEdit={this._onToggleTitleEdit}
              isTitleEditing={state.isTitleEditing}
              />
            </div>
            <div className='offset-by-nine two columns'>
              <div style={{position: 'fixed', top: 100, zIndex: 200}}>
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
                  <MenuItem onClick={this._updateContacts} primaryText='Update Selected Contacts' />
                  <MenuItem checked={state.isEmailPanelOpen} primaryText='Email' onClick={this.toggleEmailPanel} />
                  <MenuItem primaryText='Upload from File' onClick={_ => this.refs.input.show()} />
                </Menu>
              </Popover>
            </div>
          </div>
          {
            state.isEmailPanelOpen ? 
            <EmailPanel
            person={props.person}
            selectedContacts={state.selectedContacts}
            customfields={props.listData.customfields}
            onClose={this.toggleEmailPanel}
            /> : null
          }
          <div style={{marginTop: '10px'}}>
            <HandsOnTable
            {...props}
            lastSavedAt={state.lastSavedAt}
            listId={props.listId}
            onSaveClick={this._onSaveClick}
            _getSelectedRows={this._getSelectedRows}
            listData={props.listData}
            contacts={props.contacts}
            isNew={false}
            lastFetchedIndex={props.lastFetchedIndex}
            isDirty={this._isDirty}
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

  const contactWithEmployers = contacts.map(contact => {
    if (!_.isEmpty(contact.employers)) {
      contact.employers.map((id, i) => {
        if (publicationReducer[id]) contact[`publication_name_${i + 1}`] = publicationReducer[id].name;
      });
    }
    return contact;
  });

  return {
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
    firstTimeUser: state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Radium(Table)));

