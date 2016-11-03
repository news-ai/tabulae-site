import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import Radium from 'radium';
import _ from 'lodash';
import * as actionCreators from 'actions/AppActions';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import {blue100, blue200, blue300, grey500, grey400, grey300, grey700} from 'material-ui/styles/colors';
import {AutoSizer, Grid, ScrollSync, WindowScroller} from 'react-virtualized'
import Draggable from 'react-draggable';
import Dialog from 'material-ui/Dialog';

import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';
import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';
import CopyOrMoveTo from './CopyOrMoveTo.react';
import AddOrHideColumns from './AddOrHideColumns.react';
import AddContact from './AddContact.react';
import EditContact from './EditContact.react';
import PanelOverlay from './PanelOverlay.react';
import EmptyListStatement from './EmptyListStatement.react';
import AnalyzeSelectedTwitterContainer from './AnalyzeSelectedTwitterContainer.react';
import AnalyzeSelectedInstagramContainer from './AnalyzeSelectedInstagramContainer.react';
import ScatterPlot from './ScatterPlot.react';

import {generateTableFieldsmap, measureSpanSize, escapeHtml, convertToCsvString, exportOperations, isNumber} from './helpers';
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
    if (fieldObj.readonly) return contact[fieldObj.value];
    if (contact.customfields === null) return undefined;
    else if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return undefined;
    else return contact.customfields.find(obj => obj.name === fieldObj.value).value;
  } else {
    if (fieldObj.strategy) return fieldObj.strategy(contact);
    else return contact[fieldObj.value];
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
      firsttime: this.props.firstTimeUser,
    };
    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      this.setState({screenWidth, screenHeight});
    }
    this.setColumnStorage = columnWidths => localStorage.setItem(this.props.listId, JSON.stringify({columnWidths}));
    this.getColumnStorage = _ => {
      try {
        const item = localStorage.getItem(this.props.listId);
        const store = JSON.parse(localStorage.getItem(this.props.listId));
        if (!store) return undefined;
        else return store.columnWidths;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    }
    this.clearColumnStorage = columnWidths => localStorage.setItem(this.props.listId, undefined);
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
    this.setDataGridRef = ref => (this._DataGrid = ref);
    this.setHeaderGridRef = ref => (this._HeaderGrid = ref);
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
    if (!this.props.listData) return;
    if (this.props.listData.name !== this.state.name) this.setState({name: this.props.listData.name});

    if (this.state.sortPositions === null) {
      const sortPositions = this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }
    
    if (this.state.columnWidths === null || this.state.columnWidths !== this.props.fieldsmap.length) {
      let columnWidths = this.props.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro');
        return size.width > 70 ? size.width : 70;
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
    if (nextProps.listDidInvalidate) this.props.router.push('/notfound');
    if (nextProps.listId !== this.props.listId) {
      // essentially reload
      let columnWidths = this.state.columnWidths;
      if (columnWidths.length === nextProps.fieldsmap.length) {
        this.setState({columnWidths});
      } else {
        this.clearColumnStorage();
      }

      if (nextProps.searchQuery) {
        this.fetchOperations(nextProps).
        then(_ => this.onSearchClick(nextProps.searchQuery));
      } else {
        this.fetchOperations(nextProps);
      }
    }

    if (this.props.listData && this.state.sortPositions === null) {
      const sortPositions = this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }

    // initialize columnWidths
    if (!this.props.listData && nextProps.listData && this.state.columnWidths === null) {
      const columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 70 ? size.width : 70;
      });
      this.setState({columnWidths}, _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      })
    }

    if (this.props.listData && nextProps.listData) {
      let columnWidths = this.state.columnWidths;
      if (this.props.fieldsmap.length !== nextProps.fieldsmap.length || columnWidths === null || nextProps.fieldsmap.length !== columnWidths.length) {
        columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
          const name = fieldObj.name;
          const size = measureSpanSize(name, '16px Source Sans Pro')
          return size.width > 70 ? size.width : 70;
        });
      }

      if (nextProps.contacts.length > 0 && !this.state.dragged && this.props.fieldsmap.length !== nextProps.fieldsmap.length) {
        nextProps.fieldsmap.map((fieldObj, i) => {
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
      }

      this.setState({columnWidths}, _ => {
        if (this._HeaderGrid && this._DataGrid) {
          this._HeaderGrid.recomputeGridSize();
          this._DataGrid.recomputeGridSize();
        }
      })
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
    const value = this.props.fieldsmap[columnIndex].value;
    const sortDirection = this.state.sortPositions[columnIndex];

    let directionIcon = 'fa fa-circle-o';
    if (sortDirection === 1) {
      directionIcon = 'fa fa-caret-up';
    } else if (sortDirection === -1) {
      directionIcon = 'fa fa-caret-down';
    }
    let customSpan;
    if (value === 'selected') {
      customSpan = <span onClick={_ =>
        this.setState({
          selected: this.state.selected.length === this.props.listData.contacts.length ?
          [] : this.props.listData.contacts.slice()
        })} style={{whiteSpace: 'nowrap', cursor: 'pointer'}}>{content}</span>;
    }

    return (
      <div
      className='headercell'
      key={key}
      style={style}>
        {customSpan || <span style={{whiteSpace: 'nowrap'}}>{content}</span>}
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

    let content = _getter(contacts[rowIndex], fieldObj) || '';

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
            <div className='row vertical-center'>
              <i
              id='profile_hop'
              className='fa fa-arrow-right'
              style={{color: blue300, cursor: 'pointer', marginRight: 5}}
              onMouseEnter={e =>
                this.setState({
                  showProfileTooltip: true,
                  profileX: e.clientX,
                  profileY: e.clientY,
                  profileContactId: rowData.id
                })}
              onMouseLeave={e => setTimeout(
                _ => !state.onPanel ? this.setState({showProfileTooltip: true}) :
                null, 500)}
              onClick={e => {
                e.preventDefault();
                this.props.router.push(`/tables/${this.props.listId}/${rowData.id}`);
              }}
              />
              {!this.props.listData.readonly &&
                <EditContact listId={this.props.listId} contactId={rowData.id}>
                {({onRequestOpen}) => (
                  <i
                  onClick={onRequestOpen}
                  className='fa fa-edit'
                  style={{color: blue300, cursor: 'pointer'}}
                  />
                  )}
                </EditContact>}
            </div>
            );
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
        props.received.length < props.listData.contacts.length
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
        filteredIds = contactIds.filter(id => _getter(this.props.contactReducer[id], fieldObj));
        emptyIds = contactIds.filter(id => !_getter(this.props.contactReducer[id], fieldObj));
      }
      filteredIds.sort((a, b) => {
        let valA = _getter(this.props.contactReducer[a], fieldObj);
        let valB = _getter(this.props.contactReducer[b], fieldObj);
        if (isNumber(valA)) {
          valA = parseFloat(valA);
          valB = parseFloat(valB);
        } else if (typeof valA === 'string') {
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
    exportOperations(this.props.contacts, this.props.fieldsmap, this.state.name);
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
        {
          props.firstTimeUser &&
          <Dialog open={state.firsttime} modal onRequestClose={_ => this.setState({firsttime: false})}>
            <p><span style={{fontWeight: 'bold'}}>Table</span> powers <span style={{fontWeight: 'bold'}}>List Feed</span>.</p>
            <p>It comes with default columns that connect social profiles to power different feeds and dynamic graphs.</p>
            <div className='horizontal-center' style={{margin: '10px 0'}}>
              <RaisedButton primary label='OK' onClick={_ => {
                this.setState({firsttime: false});
                hopscotch.startTour(tour);
              }}/>
            </div>
          </Dialog>
        }
        <div className='vertical-center'>
          <FlatButton
          labelStyle={{textTransform: 'none', color: grey400}}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}
          label='List Feed'
          onClick={_ => props.router.push(`/listfeeds/${props.listId}`)} />
          <FlatButton
          label='Go to Bulk Edit'
          disabled={props.listData && props.listData.readonly}
          icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}
          labelStyle={{color: grey400, textTransform: 'none'}}
          onClick={_ => props.router.push(`/lists/${props.listId}`)}
          />
        </div>
        {state.showProfileTooltip &&
          <PanelOverlay
          onMouseEnter={_ => this.setState({showProfileTooltip: true, onTooltipPanel: true})}
          onMouseLeave={_ => this.setState({showProfileTooltip: false, onTooltipPanel: false})}
          profileX={state.profileX}
          profileY={state.profileY}
          contactId={state.profileContactId}
          listId={props.listId}
          />}
        <div className='row vertical-center' style={{margin: 15}}>
          <div className='large-3 medium-4 columns vertical-center'>
            {props.listData && <ControlledInput async disabled={props.listData.readonly} name={props.listData.name} onBlur={value => props.patchList({listId: props.listId, name: value})}/>}
          </div>
          {props.listData &&
            <div className='large-4 medium-4 columns vertical-center'>
              <IconButton
              tooltip='Email'
              tooltipPosition='top-left'
              iconClassName='fa fa-envelope'
              iconStyle={{color: grey500}}
              onClick={_ => this.setState({isEmailPanelOpen: true})}
              disabled={state.isEmailPanelOpen || props.listData.readonly}
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
                id='copy_contacts_hop'
                tooltip='Copy to Another Table'
                tooltipPosition='top-left'
                iconClassName='fa fa-copy'
                iconStyle={{color: grey500}}
                onClick={onRequestOpen}
                />)}
              </CopyOrMoveTo>
              <AddOrHideColumns listId={props.listId} fieldsmap={props.rawFieldsmap}>
              {({onRequestOpen}) => (
                <IconButton
                id='add_remove_columns_hop'
                disabled={props.listData.readonly}
                tooltip='Show/Hide columns'
                tooltipPosition='top-left'
                iconClassName='fa fa-table'
                iconStyle={{color: grey500}}
                onClick={onRequestOpen}
                />)}
              </AddOrHideColumns>
              <AddContact listId={props.listId}>
              {({onRequestOpen}) => (
                <IconButton
                tooltip='Add New Contact'
                id='add_contact_hop'
                disabled={props.listData.readonly}
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
              disabled={props.listData.readonly}
              iconStyle={{color: grey500}}
              onClick={this.onRemoveContacts}
              />
              
            </div>}
          <div className='large-3 columns vertical-center'>
            <TextField
            id='search-input'
            hintText='Search...'
            value={state.searchValue}
            onChange={e => this.setState({searchValue: e.target.value})}
            onKeyDown={e => e.keyCode === 13 ? props.router.push(`/tables/${props.listId}?search=${state.searchValue}`) : null}
            errorText={state.errorText}
            />
            <RaisedButton className='noprint' style={{marginLeft: '5px'}} onClick={_=> props.router.push(`/tables/${props.listId}?search=${state.searchValue}`)} label='Search' labelStyle={{textTransform: 'none'}} />
            {
              /*props.listData && !props.listData.readonly &&
              <RaisedButton className='noprint' style={{margin: '3px'}} onClick={this.onSearchClearClick} label='Clear' labelStyle={{textTransform: 'none'}} />*/
            }
          </div>
          {
            /*props.fieldsmap !== null && <div className='large-2 columns vertical-center'>
            <ScatterPlot fieldsmap={props.fieldsmap} contacts={props.contacts}>
            {sc => (
              <AnalyzeSelectedInstagramContainer selected={state.selected} listId={props.listId}>
              {inst => (
               <AnalyzeSelectedTwitterContainer selected={state.selected} listId={props.listId}>
                {twt => (
                  <IconMenu
                  iconButtonElement={<IconButton tooltip='analyze selected'><FontIcon className='fa fa-line-chart'/></IconButton>}
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  >
                    <MenuItem
                    primaryText='Twitter Contacts'
                    leftIcon={<FontIcon className='fa fa-twitter'/>}
                    onTouchTap={twt.onRequestOpen}
                    />
                    <MenuItem
                    primaryText='Instagram Contacts'
                    leftIcon={<FontIcon className='fa fa-instagram'/>}
                    onTouchTap={inst.onRequestOpen}
                    />
                    <MenuItem
                    primaryText='Which is Best'
                    leftIcon={<FontIcon className='fa fa-area-chart'/>}
                    onTouchTap={sc.onRequestOpen}
                    disabled={
                      !props.fieldsmap.some(fieldObj => fieldObj.value === 'likes_to_posts') ||
                      !props.fieldsmap.some(fieldObj => fieldObj.value === 'instagramfollowers')
                    }
                    />
                  </IconMenu>)}
                </AnalyzeSelectedTwitterContainer>)}
              </AnalyzeSelectedInstagramContainer>
              )}
           </ScatterPlot>
          </div>*/
          }
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
        {props.listData && props.listData.contacts === null && <EmptyListStatement className='row horizontal-center vertical-center' style={{height: 400}} />}
        {props.listData && props.received.length > 0 && state.columnWidths !== null &&
          <ScrollSync>
          {({clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) =>
            <div>
              <div className='HeaderGridContainer'>
                <Grid
                ref={ref => this.setHeaderGridRef(ref)}
                className='HeaderGrid'
                cellRenderer={this.headerRenderer}
                columnCount={props.fieldsmap.length}
                columnWidth={({index}) => {
                  const wid = state.columnWidths[index];
                  if (!wid) {
                    this.clearColumnStorage();
                    return 70;
                  }
                  return wid + 10;
                }}
                height={45}
                autoContainerWidth
                width={state.screenWidth}
                rowCount={1}
                rowHeight={32}
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
                  columnWidth={({index}) => {
                    const wid = state.columnWidths[index];
                    if (!wid) {
                      this.clearColumnStorage();
                      return 70;
                    }
                    return wid + 10;
                  }}
                  overscanRowCount={30}
                  overscanColumnCount={3}
                  height={args.height + 20}
                  scrollTop={args.scrollTop}
                  width={state.screenWidth}
                  rowCount={props.received.length}
                  rowHeight={30}
                  onScroll={onScroll}
                  />)}
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
          received.push(contactId);
          contacts.push(contact);
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
    fieldsmap: listData ? rawFieldsmap.filter(fieldObj => !fieldObj.hidden && !fieldObj.internal) : null,
    rawFieldsmap,
    contacts: contacts,
    contactIsReceiving: state.contactReducer.isReceiving,
    publicationReducer,
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
    contactReducer: state.contactReducer,
    listDidInvalidate: state.listReducer.didInvalidate,
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
