import React, { Component } from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import Radium from 'radium';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {Column, Table, AutoSizer, Grid, ScrollSync} from 'react-virtualized'

import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import ToggleableEditInput from '../ToggleableEditInput';
import Waiting from '../Waiting';

import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
import 'react-virtualized/styles.css'
import './Table.css';

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
  },
};

/*
class ListTable extends Component {
  constructor(props) {
    super(props);
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onUpdateName = e => this.setState({name: e.target.value.substr(0, 140)});
    this.onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.state = {
      searchValue: null,
      isSearchOn: false,
      errorText: '',
      searchContacts: [],
      isTitleEditing: false,
      name: null,
      selected: []
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.listData.name !== this.state.name) this.setState({name: nextProps.listData.name});
    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) this.onSearchClick(nextProps.searchQuery);
    }
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

  _onCheck(e, checked, contactId) {
    const selected = checked ?
    [...this.state.selected, contactId] :
    this.state.selected.filter(id => id !== contactId);
    this.setState({selected});
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
    this.props.router.push(`/tables/${this.props.listId}`);
    this.setState({
      searchContacts: [],
      searchValue: '',
      errorText: null,
      isSearchOn: false
    });
  }

  render() {
    const props = this.props;
    const state = this.state;

    const contacts = state.isSearchOn ? state.searchContacts : props.contacts;
    return (
      <div style={{marginTop: 30}}>
        <div className='vertical-center' style={{margin: 15}}>
          <ToggleableEditInput
          name={state.name}
          onUpdateName={this.onUpdateName}
          onToggleTitleEdit={this.onToggleTitleEdit}
          isTitleEditing={state.isTitleEditing}
          />
          <div className='vertical-center'>
            <TextField
            id='search-input'
            hintText='Search...'
            value={state.searchValue}
            onChange={e => this.setState({searchValue: e.target.value})}
            onKeyDown={e => e.keyCode === 13 ? props.router.push(`/tables/${props.listId}?search=${state.searchValue}`) : null}
            errorText={state.errorText}
            />
            <RaisedButton className='noprint' style={{marginLeft: '5px'}} onClick={_=> props.router.push(`/tables/${props.listId}?search=${state.searchValue}`)} label='Search' labelStyle={{textTransform: 'none'}} />
            <RaisedButton className='noprint' style={{margin: '3px'}} onClick={this.onSearchClearClick} label='Clear' labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
        <Waiting isReceiving={props.contactIsReceiving || props.listData === undefined} style={styles.loading} />
        {props.listData && contacts && 
          <AutoSizer disableHeight>
          {({width}) => 
          <Table
            ref='Table'
            headerClassName='headerColumn'
            rowClassName={({index}) => {
              if (index < 0) return 'headerRow';
              return index % 2 === 0 ? 'evenRow' : 'oddRow';
            }}
            width={width}
            height={600}
            headerHeight={20}
            rowHeight={30}
            overscanRowCount={60}
            rowCount={contacts.length}
            rowGetter={({index}) => contacts[index]}
            onScroll={({scrollTop, scrollHeight, clientHeight}) => {
              if (((scrollHeight - scrollTop) / clientHeight) < 2) props.fetchContacts(props.listId);
            }}
            >
              <Column
              label='#'
              cellDataGetter={({columnData, dataKey, rowData}) => rowData.index}
              dataKey='index'
              minWidth={10}
              maxWidth={70}
              />
              <Column
              label='Select'
              cellRenderer={({cellData, rowData, rowIndex}) => <Checkbox onCheck={(e, checked) => this.onCheck(e, checked, rowData.id)} />}
              dataKey='select'
              flexGrow={1}
              minWidth={30}
              maxWidth={90}
              />
              {props.listData.fieldsmap
                //.filter((fieldObj, i) => !fieldObj.hidden)
                .map((fieldObj, i) => <Column
                  label={fieldObj.name}
                  dataKey={fieldObj.value}
                  width={300}
                  columnData={fieldObj}
                  key={i}
                  />)}
              <Column
              label='Profile'
              cellRenderer={({cellData, rowData, rowIndex}) => <Link to={`/lists/${props.listId}/${rowData.id}`}>Profile</Link>}
              dataKey='index'
              width={200}
              />
            </Table>}
          </AutoSizer>}
      </div>);
  }
}
*/

function measureSpanSize(txt, font) {
  const element = document.createElement('canvas');
  const context = element.getContext('2d');
  context.font = font;
  var tsize = {
    width: context.measureText(txt).width,
    height: parseInt(context.font)
  };
  return tsize;
}

class ListTable extends Component {
  constructor(props) {
    super(props);
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onUpdateName = e => this.setState({name: e.target.value.substr(0, 140)});
    this.onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.cellRenderer = this._cellRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.state = {
      searchValue: '',
      isSearchOn: false,
      errorText: '',
      searchContacts: [],
      isTitleEditing: false,
      name: null,
      selected: [],
      columnWidths: null
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.listData && nextProps.listData.name !== this.state.name) this.setState({name: nextProps.listData.name});
    if (nextProps.listData && this.state.columnWidths === null) {
      const columnWidths = nextProps.listData.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 60 ? size.width + 10 : 60;
      });
      this.setState({columnWidths})
    }
    if (nextProps.contacts.length > 0) {
      // optimize with immutablejs
      let columnWidths = this.state.columnWidths.slice();
      this.props.listData.fieldsmap.map((fieldObj, i) => {
        let max = columnWidths[i];
        nextProps.contacts.map(contact => {
          let content;
          if (fieldObj.customfield) {
            if (contact.customfields === null) return;
            content = contact.customfields.find(obj => obj.name === fieldObj.value).name
          } else {
            content = contact[fieldObj.value];
          }
          const size = measureSpanSize(content, '16px Source Sans Pro')
          if (size.width > max) max = size.width;
        });
        columnWidths[i] = max;
      });
      console.log(columnWidths);
      this.setState({columnWidths});
    }
    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) this.onSearchClick(nextProps.searchQuery);
    }
  }

  _cellRenderer({columnIndex, rowIndex, key, style}) {
    const fieldObj = this.props.listData.fieldsmap[columnIndex];
    const contacts = this.props.contacts;
    const content = fieldObj.customfield && contacts[rowIndex].customfields ?
    contacts[rowIndex].customfields.find(obj => obj.name === fieldObj.value).name :
    contacts[rowIndex][fieldObj.value];
    return (
    <div
    className={rowIndex % 2 === 0 ? 'evenRow' : 'oddRow'}
    key={key}
    style={style}>
    <span>{content}</span>
    </div>);
  }

  _headerRenderer({columnIndex, key, style}) {
    const content = this.props.listData.fieldsmap[columnIndex].name;
    return <div key={key} style={style}>
    <span>{content}</span>
    </div>;
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

  _onCheck(e, checked, contactId) {
    const selected = checked ?
    [...this.state.selected, contactId] :
    this.state.selected.filter(id => id !== contactId);
    this.setState({selected});
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
    this.props.router.push(`/tables/${this.props.listId}`);
    this.setState({
      searchContacts: [],
      searchValue: '',
      errorText: null,
      isSearchOn: false
    });
  }

  render() {
    const props = this.props;
    const state = this.state;

    const contacts = state.isSearchOn ? state.searchContacts : props.contacts;
    return (
      <div style={{marginTop: 30}}>
        <div className='vertical-center' style={{margin: 15}}>
          <ToggleableEditInput
          name={state.name}
          onUpdateName={this.onUpdateName}
          onToggleTitleEdit={this.onToggleTitleEdit}
          isTitleEditing={state.isTitleEditing}
          />
          <div className='vertical-center'>
            <TextField
            id='search-input'
            hintText='Search...'
            value={state.searchValue}
            onChange={e => this.setState({searchValue: e.target.value})}
            onKeyDown={e => e.keyCode === 13 ? props.router.push(`/tables/${props.listId}?search=${state.searchValue}`) : null}
            errorText={state.errorText}
            />
            <RaisedButton className='noprint' style={{marginLeft: '5px'}} onClick={_=> props.router.push(`/tables/${props.listId}?search=${state.searchValue}`)} label='Search' labelStyle={{textTransform: 'none'}} />
            <RaisedButton className='noprint' style={{margin: '3px'}} onClick={this.onSearchClearClick} label='Clear' labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
        <Waiting isReceiving={props.contactIsReceiving || props.listData === undefined} style={styles.loading} />
        {props.listData && props.contacts.length > 0 && <ScrollSync>
         {
          ({clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) => <div>
            <Grid
            cellRenderer={this.headerRenderer}
            columnCount={props.listData.fieldsmap.length}
            columnWidth={({index}) => state.columnWidths[index]}
            height={30}
            width={600}
            rowCount={1}
            rowHeight={30}
            scrollLeft={scrollLeft}
            />
            <Grid
            className='BodyGrid'
            cellRenderer={this.cellRenderer}
            columnCount={props.listData.fieldsmap.length}
            columnWidth={({index}) => state.columnWidths[index]}
            height={600}
            width={600}
            rowCount={props.contacts.length}
            rowHeight={30}
            onScroll={onScroll}
            />
          </div>
        }
        </ScrollSync>}
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
        if (state.contactReducer[contactId]) {
          let contact = state.contactReducer[contactId];
          contact.index = i;
          contacts.push(contact);
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
