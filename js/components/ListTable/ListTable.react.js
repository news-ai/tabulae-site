import React, {Component} from 'react';
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
import {Column, Table, AutoSizer, Grid, ScrollSync, WindowScroller} from 'react-virtualized'
import Draggable from 'react-draggable';
import Overlay from 'react-overlays';

import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';
import CopyOrMoveTo from './CopyOrMoveTo.react';
import AddOrHideColumns from './AddOrHideColumns.react';
import AddContact from './AddContact.react';

import {
  generateTableFieldsmap,
  measureSpanSize,
  escapeHtml,
  convertToCsvString,
  exportOperations,
} from './helpers';
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


function _getter(contact, fieldObj) {
  if (fieldObj.customfield) {
    if (contact.customfields === null) return undefined;
    else if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return undefined;
    else return contact.customfields.find(obj => obj.name === fieldObj.value).value;
  } else {
    return contact[fieldObj.value];
  }
}

const localStorage = window.localStorage;

class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      isSearchOn: false,
      errorText: '',
      searchContacts: [],
      selected: [],
      columnWidths: null,
      dragPositions: [],
      dragged: false,
      isEmailPanelOpen: false,
      sortPositions: this.props.fieldsmap === null ? null : this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2),
      onSort: false,
      sortedIds: [],
      lastRowIndexChecked: null,
      showProfileTooltip: false,
      profileContactId: null,
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    };
    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      this.setState({screenWidth, screenHeight});
    }
    this.setColumnStorage = columnWidths => localStorage.setItem(this.props.listId, JSON.stringify({columnWidths}));
    this.getColumnStorage = _ => {
      const store = JSON.parse(localStorage.getItem(this.props.listId));
      if (!store) return undefined;
      else return store.columnWidths;
    }
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearchClick = this._onSearchClick.bind(this);
    this.cellRenderer = this._cellRenderer.bind(this);
    this.headerRenderer = this._headerRenderer.bind(this);
    this.onExportClick = this._onExportClick.bind(this);
    this.onHeaderDragStart = this._onHeaderDragStart.bind(this);
    this.onHeaderDragStop = this._onHeaderDragStop.bind(this);
    this.onSort = this._onSort.bind(this);
    this.onRemoveContacts = this._onRemoveContacts.bind(this);
    this.setDataGridRef = ref => {
      this._DataGrid = ref;
    };
    this.setHeaderGridRef = ref => {
      this._HeaderGrid = ref;
    }
  }

  componentWillMount() {
    // get locally stored columnWidths
    let columnWidths = this.getColumnStorage();
    if (columnWidths) this.setState({columnWidths});

    if (this.props.searchQuery) {
      this.fetchOperations(this.props)
      .then(_ => this.onSearchClick(this.props.searchQuery));
    } else {
      this.fetchOperations(this.props);
    }
  }

  componentDidMount() {
    if (this.props.listData && this.props.listData.name !== this.state.name) this.setState({name: this.props.listData.name});

    if (this.props.listData && this.state.sortPositions === null) {
      const sortPositions = this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }
    
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
    if (nextProps.listId !== this.props.listId) {
      // essentially reload
      let columnWidths = this.getColumnStorage();
      if (columnWidths) this.setState({columnWidths});

      if (nextProps.searchQuery) {
        this.fetchOperations(nextProps).
        then(_ => this.onSearchClick(nextProps.searchQuery));
      } else {
        this.fetchOperations(nextProps);
      }
    }

    if (
      this.props.listData &&
      nextProps.listData &&
      this.props.listData.fieldsmap.length !== nextProps.listData.fieldsmap.length
      ) {
      const columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 60 ? size.width : 60;
      });
      this.setState({columnWidths})
    }

    if (this.props.listData && this.state.sortPositions === null) {
      const sortPositions = this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }
    
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
          } else if (fieldObj.tableOnly) {
            return;
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

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _onHeaderDragStart(e, {x, y}, columnIndex) {
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x, y};
    this.setState({dragPositions});
  }

  _onHeaderDragStop(e, {x, y}, columnIndex) {
    let columnWidths = this.state.columnWidths.slice();
    columnWidths[columnIndex] += x
    let dragPositions = this.state.dragPositions.slice();
    dragPositions[columnIndex] = {x: 0, y: 0};
    this.setState(
      {columnWidths, dragPositions, dragged: true},
      _ => {
      if (this._HeaderGrid && this._DataGrid) {
        this.setColumnStorage(columnWidths);
        this._HeaderGrid.recomputeGridSize();
        this._DataGrid.recomputeGridSize();
      }
    });
  }

  _headerRenderer({columnIndex, key, style}) {
    const content = this.props.fieldsmap[columnIndex].name;
    const sortDirection = this.state.sortPositions[columnIndex];

    let directionIcon = 'fa fa-circle-o';
    if (sortDirection === 1) {
      directionIcon = 'fa fa-caret-up';
    } else if (sortDirection === -1) {
      directionIcon = 'fa fa-caret-down';
    }

    return (
      <div
      className='headercell'
      key={key}
      style={style}>
        <span style={{whiteSpace: 'nowrap'}}>{content}</span>
        {sortDirection !== 2 &&
          <i style={{fontSize: sortDirection === 0 ? '0.5em' : '1em'}}
          className={`${directionIcon} sort-icon`}
          onClick={_ => this.onSort(columnIndex)} aria-hidden='true' />}
        <Draggable
        axis='x'
        bounds={{left: 0 - this.state.columnWidths[columnIndex]}}
        position={this.state.dragPositions[columnIndex]}
        onStop={(e, args) => this.onHeaderDragStop(e, args, columnIndex)}>
          <div className='draggable-handle right'></div>
        </Draggable>
      </div>);
  }

  _cellRenderer({columnIndex, rowIndex, key, style}) {
    const fieldObj = this.props.fieldsmap[columnIndex];
    let contacts = this.state.onSort ? this.state.sortedIds.map(id => this.props.contactReducer[id]) : this.props.contacts;

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
          const isChecked = this.state.selected.some(id => id === rowData.id);
          contentBody = (
            <Checkbox
            iconStyle={{fill: isChecked ? blue200 : grey400}}
            checked={isChecked}
            onCheck={(e, checked) => {
              const lastRowIndexChecked = this.state.lastRowIndexChecked;
              if (e.nativeEvent.shiftKey && lastRowIndexChecked !== rowIndex && lastRowIndexChecked !== null) {
                let selected = this.state.selected.slice();
                let last = null;
                if (rowIndex < lastRowIndexChecked) {
                  for (let i = rowIndex; i < lastRowIndexChecked; i++) {
                    const checked = this.state.selected.some(id => id === contacts[i].id);
                    selected = !checked ? [...selected, contacts[i].id] : selected.filter(id => id !== contacts[i].id);
                  }
                } else {
                  for (let i = rowIndex; i > lastRowIndexChecked; i--) {
                    const checked = this.state.selected.some(id => id === contacts[i].id);
                    selected = !checked ? [...selected, contacts[i].id] : selected.filter(id => id !== contacts[i].id);
                  }
                }
                this.setState({lastRowIndexChecked: rowIndex, selected});
              } else {
                this.onCheck(rowData.id);
                this.setState({lastRowIndexChecked: rowIndex});
              }
            }}/>);
          break;
        case 'profile':
          const state = this.state;
          contentBody = (
            <Link
            onMouseEnter={e => {
              this.setState({
                showProfileTooltip: true,
                profileX: e.pageX,
                profileY: e.pageY,
                profileContactId: rowData.id
              });
            }}
            onMouseLeave={e => {
              setTimeout(_ => !state.onPanel ? this.setState({showProfileTooltip: true}) : null, 500);
            }}
            to={`/tables/${this.props.listId}/${rowData.id}`}>
              <i className='fa fa-arrow-right' aria-hidden='true'/>
            </Link>);
          break;
        default:
          contentBody = <span>{content}</span>;
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

  _fetchOperations(props) {
    if (!props.listData) {
      return props.fetchList(props.listId)
      .then(_ => props.loadAllContacts(props.listId));
    } else {
      if (
        props.listData.contacts !== null &&
        props.received < props.listData.contacts.length
        ) {
        return props.loadAllContacts(props.listId);
      }
    }
  }

  _onSort(columnIndex) {
    const sortDirection = this.state.sortPositions[columnIndex];
    const fieldObj = this.props.fieldsmap[columnIndex];
    let newDirection;
    if (sortDirection === 0) {
      newDirection = 1;
    } else if (sortDirection === 1) {
      newDirection = -1;
    } else {
      newDirection = 0;
    }
    const sortPositions = this.state.sortPositions
      .map((position, i) => i === columnIndex ? newDirection : position);
    const onSort = sortPositions.some(position => position === -1 || position === 1);


    const contactIds = this.props.received.slice();
    let filteredIds, emptyIds, sortedIds;
    if (onSort) {
      if (fieldObj.customfield) {
        filteredIds = contactIds.filter(id => _getter(this.props.contactReducer[id], fieldObj));
        emptyIds = contactIds.filter(id => !_getter(this.props.contactReducer[id], fieldObj));
      } else {
        filteredIds = contactIds.filter(id => this.props.contactReducer[id][fieldObj.value]);
        emptyIds = contactIds.filter(id => !this.props.contactReducer[id][fieldObj.value]);
      }
      filteredIds.sort((a, b) => {
        let valA = _getter(this.props.contactReducer[a], fieldObj);
        let valB = _getter(this.props.contactReducer[b], fieldObj);
        if (typeof valA === 'string') {
          valA = valA.toUpperCase();
          valB = valB.toUpperCase();
        }
        if (valA < valB) return 0 - newDirection;
        else if (valA > valB) return newDirection;
        else return 0;
      });
      sortedIds = filteredIds.concat(emptyIds);
    }
    this.setState({sortPositions, onSort, sortedIds});
  }

  _onCheck(contactId) {
    const checked = this.state.selected.some(id => id === contactId);
    const selected = !checked ?
    [...this.state.selected, contactId] :
    this.state.selected.filter(id => id !== contactId);
    this.setState({selected});
  }

  _onSearchClick(searchValue) {
    const props = this.props;
    if (searchValue !== this.state.searchValue) this.setState({searchValue});
    props.searchListContacts(props.listId, searchValue)
    .then(obj => {
      // const searchContacts = obj.ids.map(id => obj.searchContactMap[id]);
      // let errorText = null;
      // if (searchContacts.length === 0) errorText = 'No such term.'
      this.setState({isSearchOn: true});
    });
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

  _onRemoveContacts() {
    const selected = this.state.selected;
    const props = this.props;
    if (selected.length === 0) return;
    const newListContacts = _.difference(props.listData.contacts, selected);
    props.deleteContacts(selected);
    props.patchList({
      listId: props.listId,
      contacts: newListContacts,
      name: props.listData.name,
    });
  }

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div style={{marginTop: 30}}>
        <div className='vertical-center'>
          <FlatButton
          labelStyle={{textTransform: 'none', color: grey400}}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}
          label='List Feed'
          onClick={_ => props.router.push(`/listfeeds/${props.listId}`)} />
          <FlatButton
          label='Go to Bulk Edit'
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}
          labelStyle={{color: grey400, textTransform: 'none'}}
          onClick={_ => props.router.push(`/lists/${props.listId}`)}
          />
        </div>
        {state.showProfileTooltip &&
          <div
          onMouseEnter={_ => this.setState({showProfileTooltip: true, onTooltipPanel: true})}
          onMouseLeave={_ => this.setState({showProfileTooltip: false, onTooltipPanel: false})}
          style={{
            zIndex: 200,
            width: 500,
            height: 300,
            backgroundColor: 'red',
            position: 'fixed',
            top: state.profileY,
            left: state.profileX + 8,
          }}>

          </div>}
        <div className='row vertical-center' style={{margin: 15}}>
          <div className='large-3 medium-4 columns vertical-center'>
            <ControlledInput async name={props.listData ? props.listData.name : ''} onBlur={value => props.patchList({listId: props.listId, name: value})} />
          </div>
           <div className='large-4 medium-4 columns vertical-center'>
              <IconButton
              tooltip='Email'
              tooltipPosition='top-left'
              iconClassName='fa fa-envelope'
              iconStyle={{color: grey500}}
              onClick={_ => this.setState({isEmailPanelOpen: true})}
              disabled={state.isEmailPanelOpen}
              />
              <IconButton
              tooltip='Export'
              tooltipPosition='top-left'
              iconClassName='fa fa-download'
              iconStyle={{color: grey500}}
              onClick={this.onExportClick}
              />
              <CopyOrMoveTo
              selected={state.selected}>
              {({onRequestOpen}) => (
                <IconButton
                tooltip='Copy/Move to Another'
                tooltipPosition='top-left'
                iconClassName='fa fa-copy'
                iconStyle={{color: grey500}}
                onClick={onRequestOpen}
                />)}
              </CopyOrMoveTo>
              <AddOrHideColumns listId={props.listId} fieldsmap={props.rawFieldsmap}>
              {({onRequestOpen}) => (
                <IconButton
                tooltip='Show/Hide columns'
                tooltipPosition='top-left'
                iconClassName='fa fa-edit'
                iconStyle={{color: grey500}}
                onClick={onRequestOpen}
                />)}
              </AddOrHideColumns>
              <AddContact listId={props.listId}>
              {({onRequestOpen}) => (
                <IconButton
                tooltip='Add Contact'
                tooltipPosition='top-left'
                iconClassName='fa fa-plus'
                iconStyle={{color: grey500}}
                onClick={onRequestOpen}
                />)}
              </AddContact>
              <IconButton
              tooltip='Delete Contact'
              tooltipPosition='top-left'
              iconClassName='fa fa-trash'
              iconStyle={{color: grey500}}
              onClick={this.onRemoveContacts}
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
        <div>
        {props.listData && props.listData.contacts === null &&
          <div className='row horizontal-center vertical-center' style={{height: 400}}>
            <div>
              <p>You haven't added any contacts. You will see a master sheet of them here after you added some.</p>
              <ul>
                <li>"Add Contact" icon on top to add ONE contact</li>
                <li>"Go to Bulk Edit" to add MULTIPLE contacts</li>
                <li>Go back to Home and "Upload from Existing" Excel sheet</li>
              </ul>
            </div>
          </div>}
          {props.listData && props.received.length > 0 && state.columnWidths !== null &&
            <ScrollSync>
            {({clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) => <div>
              <div style={{marginBottom: 10}}>
                <Grid
                ref={ref => this.setHeaderGridRef(ref)}
                className='BodyGrid'
                cellRenderer={this.headerRenderer}
                columnCount={props.fieldsmap.length}
                columnWidth={({index}) => state.columnWidths[index] + 10}
                height={40}
                autoContainerWidth
                width={state.screenWidth}
                rowCount={1}
                rowHeight={30}
                scrollLeft={scrollLeft}
                overscanColumnCount={3}
                />
              </div>
              <div>
                <WindowScroller>
                {args => (
                  <Grid
                  autoHeight
                  ref={ref => this.setDataGridRef(ref)}
                  className='BodyGrid'
                  cellRenderer={this.cellRenderer}
                  columnCount={props.fieldsmap.length}
                  columnWidth={({index}) => state.columnWidths[index] + 10}
                  overscanRowCount={30}
                  overscanColumnCount={3}
                  height={args.height}
                  scrollTop={args.scrollTop}
                  width={state.screenWidth}
                  rowCount={props.received.length}
                  rowHeight={30}
                  onScroll={args => {
                    if (((args.scrollHeight - args.scrollTop) / args.clientHeight) < 2) props.fetchContacts(props.listId);
                    onScroll(args);
                  }}/>)}
                </WindowScroller>
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
  const searchQuery = props.location.query.search;

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  let received = [];
  let contacts = [];
  if (listData) {
    if (searchQuery && listData.searchResults && listData.searchResults.every(id => state.contactReducer[id])) {
      received = listData.searchResults;
      contacts = received.map(id => state.contactReducer[id]);
    } else if (!_.isEmpty(listData.contacts)) {
      listData.contacts.map((contactId, i) => {
        if (state.contactReducer[contactId]) {
          let contact = state.contactReducer[contactId];
          contacts.push(contact);
          received.push(contactId);
        }
      });
    }
  }

  const rawFieldsmap = listData ? generateTableFieldsmap(listData) : null;

  return {
    received,
    searchQuery,
    listId,
    listIsReceiving: state.listReducer.isReceiving,
    listData,
    fieldsmap: listData ? rawFieldsmap.filter(fieldObj => !fieldObj.hidden) : null,
    rawFieldsmap,
    contacts: contacts,
    contactIsReceiving: state.contactReducer.isReceiving,
    publicationReducer,
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
    contactReducer: state.contactReducer,
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
    fetchAllContacts: listId => dispatch(actionCreators.loadAllContacts(listId)),
    clearSearchCache: listId => dispatch({type: 'CLEAR_LIST_SEARCH', listId}),
    deleteContacts: ids => dispatch(actionCreators.deleteContacts(ids)),
    loadAllContacts: listId => dispatch(actionCreators.loadAllContacts(listId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Radium(ListTable)));
