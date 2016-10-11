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
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {blue200, grey500, grey400} from 'material-ui/styles/colors';
import {Column, Table, AutoSizer, Grid, ScrollSync} from 'react-virtualized'
import Draggable from 'react-draggable';

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

function escapeHtml(unsafe) {
  return unsafe
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;');
 }

function convertToCsvString(contacts, fieldsmap) {
  let base = 'data:text/csv;charset=utf-8,';
  const filteredfieldsmap = fieldsmap
  .filter(fieldObj => fieldObj.value !== 'selected' || fieldObj.data !== 'profile' || !fieldObj.hidden);
  base += filteredfieldsmap.map(fieldObj => fieldObj.name).toString() + '\n';
  contacts.map(contact => {
    let rowStringArray = [];
      filteredfieldsmap.map(fieldObj => {
        let el;
        if (fieldObj.customfield && contact.customfields !== null) {
          if (contact.customfields.some(obj => obj.name === fieldObj.value)) el = contact.customfields.find(obj => obj.name === fieldObj.value).value;
          else el = '';
        } else {
          el = contact[fieldObj.value];
        }
        if (typeof el === 'string') {
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

function exportOperations(contacts, fieldsmap, name) {
  const csvString = convertToCsvString(contacts, fieldsmap);
  const csvFile = encodeURI(csvString);
  const link = document.createElement('a');
  link.setAttribute('href', csvFile);
  link.setAttribute('download', name);
  link.click();
}

const TABLE_WIDTH = 1000;

class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      isSearchOn: false,
      errorText: '',
      searchContacts: [],
      isTitleEditing: false,
      name: null,
      selected: [],
      columnWidths: null,
      dragPositions: [],
      dragged: false,
      isEmailPanelOpen: false,
    };
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onUpdateName = e => this.setState({name: e.target.value.substr(0, 140)});
    this.onToggleTitleEdit = _ => this.setState({isTitleEditing: !this.state.isTitleEditing});
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.cellRenderer = this._cellRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.onExportClick = this._onExportClick.bind(this);
    this.onHeaderDragStart = this._onHeaderDragStart.bind(this);
    this.onHeaderDragStop = this._onHeaderDragStop.bind(this);
    this.setDataGridRef = ref => {
      this._DataGrid = ref;
    };
    this.setHeaderGridRef = ref => {
      this._HeaderGrid = ref;
    }
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
    if (this.props.listData && this.props.listData.name !== this.state.name) this.setState({name: this.props.listData.name});
    
    if (this.props.listData && this.state.columnWidths === null) {
      const columnWidths = this.props.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 60 ? size.width : 60;
      });

      if (this.props.contacts.length > 0 && !this.state.dragged) {
        // optimize with immutablejs
        this.props.fieldsmap.map((fieldObj, i) => {
          let max = columnWidths[i];
          this.props.contacts.map(contact => {
            let content;
            if (fieldObj.customfield) {
              if (contact.customfields === null) return;
              if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return;
              content = contact.customfields.find(obj => obj.name === fieldObj.value).value;
            } else {
              content = contact[fieldObj.value];
            }
            const size = measureSpanSize(content, '16px Source Sans Pro')
            if (size.width > max) max = size.width;
          });
          columnWidths[i] = max;
        });
       
      }
      this.setState({columnWidths}, _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listData && nextProps.listData.name !== this.state.name) this.setState({name: nextProps.listData.name});
    
    if (nextProps.listData && this.state.columnWidths === null) {
      const columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 60 ? size.width : 60;
      });
      this.setState({columnWidths})
    }

    if (nextProps.listData && nextProps.contacts.length > 0 && !this.state.dragged) {
      // optimize with immutablejs
      let columnWidths = this.state.columnWidths.slice();
      this.props.fieldsmap.map((fieldObj, i) => {
        let max = columnWidths[i];
        nextProps.contacts.map(contact => {
          let content;
          if (fieldObj.customfield) {
            if (contact.customfields === null) return;
            if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return;
            content = contact.customfields.find(obj => obj.name === fieldObj.value).value;
          } else {
            content = contact[fieldObj.value];
          }
          const size = measureSpanSize(content, '16px Source Sans Pro')
          if (size.width > max) max = size.width;
        });
        columnWidths[i] = max;
      });
      this.setState({columnWidths}, _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      });
    }

    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) this.onSearchClick(nextProps.searchQuery);
    }
  }

  _onHeaderDragStart(e, {x, y}, columnIndex) {
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x, y};
    this.setState({dragPositions});
  }

  _onHeaderDragStop(e, {x, y}, columnIndex) {
    let columnWidths = this.state.columnWidths.slice();
    columnWidths[columnIndex] += x;
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x: 0, y: 0};
    this.setState(
      {columnWidths, dragPositions, dragged: true},
      _ => {
      if (this._HeaderGrid && this._DataGrid) {
        this._HeaderGrid.recomputeGridSize();
        this._DataGrid.recomputeGridSize();
      }
    });
  }

  _headerRenderer({columnIndex, key, style}) {
    const content = this.props.fieldsmap[columnIndex].name;
    return <div
    className='headercell'
    key={key}
    style={style}>
      <span>{content}</span>
      <Draggable
      axis='x'
      bounds={{left: 0 - this.state.columnWidths[columnIndex]}}
      position={this.state.dragPositions[columnIndex]}
      onStop={(e, args) => this.onHeaderDragStop(e, args, columnIndex)}>
        <div className='draggable-handle right'></div>
      </Draggable>
    </div>;
  }

  _cellRenderer({columnIndex, rowIndex, key, style}) {
    const fieldObj = this.props.fieldsmap[columnIndex];
    const contacts = this.props.contacts;

    let content = '';
    if (fieldObj.customfield) {
      if (contacts[rowIndex].customfields !== null && contacts[rowIndex].customfields.some(obj => obj.name == fieldObj.value)) {
        content = contacts[rowIndex].customfields.find(obj => obj.name === fieldObj.value).value;
      }
    } else {
      content = contacts[rowIndex][fieldObj.value];
    }

    let contentBody;
    if (fieldObj.tableOnly) {
      const rowData = contacts[rowIndex];
      switch (fieldObj.value) {
        case 'index':
          contentBody = <span>{rowIndex + 1}</span>;
          break;
        case 'selected':
          const checked = this.state.selected.some(id => id === rowData.id);
          contentBody = <Checkbox
          iconStyle={{fill: checked ? blue200 : grey400}}
          checked={checked}
          onCheck={(e, checked) => this.onCheck(e, checked, rowData.id)}
          />
          break;
        default:
          contentBody = <span></span>;
      }
    } else {
      contentBody = <span>{content}</span>;
    }

    return (
      <div
      className={rowIndex % 2 === 0 ? 'cell evenRow' : 'cell oddRow'}
      key={key}
      style={style}>
      {contentBody}
      </div>);
    }

  _fetchOperations() {
    const props = this.props;
    return props.fetchList(props.listId)
    .then(_ => props.fetchContacts(props.listId));
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

  _onExportClick() {
    if (this.props.contacts.length < this.props.listData.contacts.length) {
      this.props.fetchAllContacts(this.props.listId)
      .then(_ => exportOperations(this.props.contacts, this.props.fieldsmap, this.state.name));
    } else {
      exportOperations(this.props.contacts, this.props.fieldsmap, this.state.name);
    }
  }

  render() {
    const props = this.props;
    const state = this.state;

    const contacts = state.isSearchOn ? state.searchContacts : props.contacts;
    return (
      <div style={{marginTop: 30}}>
        <div className='row vertical-center' style={{margin: 15}}>
          <div className='large-6 columns vertical-center'>
            <ToggleableEditInput
            name={state.name}
            onUpdateName={this.onUpdateName}
            onToggleTitleEdit={this.onToggleTitleEdit}
            isTitleEditing={state.isTitleEditing}
            />
            <IconButton
            tooltip='Email'
            tooltipPosition='top-left'
            iconClassName='fa fa-envelope'
            onClick={_ => this.setState({isEmailPanelOpen: true})}
            disabled={state.isEmailPanelOpen}
            />
            <IconButton
            tooltip='Export'
            tooltipPosition='top-left'
            iconClassName='fa fa-download'
            onClick={this.onExportClick}
            />
          </div>
          <div className='large-5 columns vertical-center'>
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
          <div className='large-1 columns'>
            <FlatButton className='noprint' label='Edit' onClick={_ => props.router.push(`/lists/${props.listId}`)} labelStyle={{textTransform: 'none', color: grey400}} icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}/>
          </div>
        </div>
        {state.isEmailPanelOpen &&
          <EmailPanel
          person={props.person}
          selected={state.selected}
          fieldsmap={props.listData.fieldsmap}
          listId={props.listId}
          onClose={_ => this.setState({isEmailPanelOpen: false})}
          />}
        <Waiting isReceiving={props.contactIsReceiving || props.listData === undefined} style={styles.loading} />
        <div style={{marginLeft: 20}}>
          {props.listData && props.contacts.length > 0 && state.columnWidths !== null && <ScrollSync>
           {
            ({clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) => <div>
              <div style={{marginBottom: 10}}>
                <Grid
                ref={ref => this.setHeaderGridRef(ref)}
                className='BodyGrid'
                cellRenderer={this.headerRenderer}
                columnCount={props.fieldsmap.length}
                columnWidth={({index}) => state.columnWidths[index] + 10}
                height={30}
                autoContainerWidth
                width={TABLE_WIDTH}
                rowCount={1}
                rowHeight={30}
                scrollLeft={scrollLeft}
                overscanColumnCount={3}
                />
              </div>
              <div>
                <Grid
                ref={ref => this.setDataGridRef(ref)}
                className='BodyGrid'
                cellRenderer={this.cellRenderer}
                columnCount={props.fieldsmap.length}
                columnWidth={({index}) => state.columnWidths[index] + 10}
                overscanRowCount={20}
                overscanColumnCount={3}
                height={600}
                width={TABLE_WIDTH}
                rowCount={props.contacts.length}
                rowHeight={30}
                onScroll={args => {
                  if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchContacts(props.listId);
                  onScroll(args);
                }}
                />
              </div>
            </div>}
          </ScrollSync>}
        </div>
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
      listData.contacts.map((contactId, i) => {
        if (state.contactReducer[contactId]) {
          let contact = state.contactReducer[contactId];
          contact.index = i;
          contacts.push(contact);
        }
      });
    }
  }

  const fieldsmap = listData ? [
  {
    name: '#',
    hidden: false,
    value: 'index',
    customfield: false,
    tableOnly: true
  },
  {
    name: 'Selected',
    hidden: false,
    value: 'selected',
    customfield: false,
    tableOnly: true
  },
  ...listData.fieldsmap.filter(fieldObj => !fieldObj.hidden),
  {
    customfield: false,
    name: 'Publication 1',
    value: 'publication_name_1',
    hidden: false
  },
  {
    customfield: false,
    name: 'Publication 2',
    value: 'publication_name_2',
    hidden: false
  }] : null;

  const searchQuery = props.location.query.search;

  return {
    searchQuery,
    listId: listId,
    listIsReceiving: state.listReducer.isReceiving,
    listData: listData,
    fieldsmap,
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
