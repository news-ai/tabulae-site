import React, { Component } from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Radium from 'radium';
import SkyLight from 'react-skylight';
import Popout from 'react-popout';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';
import {globalStyles, skylightStyles, buttonStyle} from 'constants/StyleConstants';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Column, Table} from 'react-virtualized'

import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ToggleableEditInput from '../ToggleableEditInput';
import Waiting from '../Waiting';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
import 'react-virtualized/styles.css'

const styles = {
  nameBlock: {
    parent: {
      marginTop: 40,
    },
  },
  emailPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    zIndex: 100,
    height: 500,
    width: 600,
  },
  loading: {
    zIndex: 200,
    top: 80,
    right: 10,
    position: 'fixed'
  }
};

class ListTable extends Component {
  constructor(props) {
    super(props);
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.state = {
      searchValue: null,
      isSearchOn: false,
      errorText: '',
      searchContacts: []
    };
  }

  componentWillMount() {
    if (this.props.searchQuery) {
      this.fetchOperations().
      then(_ => this.onSearchClick(this.props.searchQuery));
    } else {
      this.fetchOperations();
    }
  }

  componentDidMount() {
  }

  _fetchOperations() {
    const props = this.props;
    return props.fetchList(props.listId)
    .then(_ => props.fetchContacts(props.listId));
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

  render() {
    const props = this.props;
    const state = this.state;

    const contacts= state.isSearchOn ? state.searchContacts : props.contacts;
    console.log(contacts);
    console.log(props.listData);
    return (
      <div style={{marginTop: 50}}>
        <Waiting isReceiving={props.contactIsReceiving || props.listData === undefined} style={styles.loading} />
        {contacts && 
          <Table
          width={1000}
          height={700}
          headerHeight={20}
          rowHeight={30}
          rowCount={contacts.length}
          rowGetter={({index}) => contacts[index]}
          >
          {props.listData.fieldsmap
            .filter((fieldObj, i) => !fieldObj.hidden)
            .map((fieldObj, i) => <Column
              label={fieldObj.name}
              dataKey={fieldObj.value}
              width={200}
              keu={i}
              />)
          }
          </Table>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  let contacts = [];

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  if (listData) {
    if (!_.isEmpty(listData.contacts)) {
      listData.contacts.map( (contactId, i) => {
        if (state.contactReducer[contactId]) contacts.push(state.contactReducer[contactId]);
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
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
  };
};

const mapDispatchToProps = (dispatch, props) => {
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
    searchPublications: query => dispatch(actionCreators.searchPublications(query)),
    fetchAllContacts: listId => dispatch(actionCreators.loadAllContacts(listId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Radium(ListTable)));
