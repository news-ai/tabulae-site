import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Radium from 'radium';
import SkyLight from 'react-skylight';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';
import { globalStyles, skylightStyles, buttonStyle } from 'constants/StyleConstants';

import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';

import { EmailPanel } from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ButtonMenu from '../pieces/ButtonMenu.react';
import ToggleableEditInput from '../pieces/ToggleableEditInput.react';
import DropFile from '../ImportFile';
import Waiting from '../pieces/Waiting.react.js';


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
    top: 80,
    right: 10,
    position: 'fixed'
  }
};

const paperStyle = {
  display: 'inline-block',
  float: 'left',
  margin: '16px 32px 16px 0', 
}


class Table extends Component {
  constructor(props) {
    super(props);
    const { listData } = this.props;
    this.state = {
      name: null,
      isTitleEditing: false,
      emailPanelOpen: false,
      selectedContacts: [],
      isSaved: true, // table without change
      person: null,
      lastSavedAt: null,
      isMenuOpen: false
    }
    this.toggleMenu = _ => this.setState({isMenuOpen: !this.state.isMenuOpen});
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this._onUpdateName = e => this.setState({ name: e.target.value.substr(0, 140) });
    this._toggleEmailPanel = _ => this.setState({ emailPanelOpen: !this.state.emailPanelOpen });
    this._getSelectedRows = contacts => this.setState({ selectedContacts: contacts });
    this._updateContacts = this._updateContacts.bind(this);
    this._handleNormalField = this._handleNormalField.bind(this);
    this._createPublicationPromises = this._createPublicationPromises.bind(this);
    this._saveOperations = this._saveOperations.bind(this);
    this._fetchOperations = this._fetchOperations.bind(this);
    this._isDirty = _ => this.setState({ isSaved: false });
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentDidMount() {
    this._fetchOperations();
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    setTimeout( _ => {
      const steps = [{
        text: 'If the contact is highlighted green, that means the Employer field is different from what the LinkedIn field tells us. You can auto-update selected contacts under Utilities tab. Select the contacts you want to email/update. Right click to see Context Menu that lets you add/change/remove columns.',
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
    

  componentWillReceiveProps(nextProps) {
    if (nextProps.name !== this.state.name) this.setState({ name: nextProps.name });
    if (this.state.person === null) {
      const person = nextProps.person;
      this.setState({ person });
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
        // only columns labeled as pass can send data to api
        if (fieldsmap.some( fieldObj => fieldObj.value === name && !fieldObj.customfield)) {
          field[name] = row[name];
        }
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

  _saveOperations(localData, colHeaders, fieldsmap, dirtyRows) {
    const { dispatch, listId, listData } = this.props;
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

    // console.log(patchContactList);
    // console.log(addContactList);

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
      /*<ButtonMenu style={{zIndex: 300, top: 100}}>
                <button className='button' style={{
                    backgroundColor: state.emailPanelOpen ? 'lightgray' : 'white',
                  }} onClick={this._toggleEmailPanel}>Email</button>
                <button className='button' style={buttonStyle} onClick={this._updateContacts}>Update Contacts</button>
                <button
                className='button'
                style={buttonStyle}
                onClick={ _ => this.refs.input.show() }>
                Upload from File</button>
              </ButtonMenu>*/

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
            <div className='seven columns'>
              <ToggleableEditInput
              name={state.name}
              onUpdateName={this._onUpdateName}
              onToggleTitleEdit={this._onToggleTitleEdit}
              isTitleEditing={state.isTitleEditing}
              />
            </div>
            <div className='offset-by-seven two columns'>
            <Popover
            open={state.isMenuOpen}
            onRequestClose={this.toggleMenu}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
              <Paper style={paperStyle}>
                <Menu>
                  <MenuItem primaryText='Maps' />
                  <MenuItem primaryText="Books" />
                  <MenuItem primaryText="Flights" />
                  <MenuItem primaryText="Apps" />
                </Menu>
              </Paper>
            </Popover>
            </div>
          </div>
          {
            state.emailPanelOpen ? 
            <EmailPanel
            person={props.person}
            selectedContacts={state.selectedContacts}
            customfields={props.listData.customfields}
            /> : null
          }
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
    contactIsReceiving: state.contactReducer.isReceiving,
    pubMapByName: publicationReducer,
    publicationReducer,
    lastFetchedIndex,
    person: state.personReducer.person
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

