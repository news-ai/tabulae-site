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
import {blue100, blue200, blue300, grey500, grey400, grey300, grey700, blue400} from 'material-ui/styles/colors';
import {AutoSizer, Grid, ScrollSync, WindowScroller} from 'react-virtualized'
import Draggable from 'react-draggable';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';

import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';
import {EmailPanel} from '../Email';
import HandsOnTable from '../pieces/HandsOnTable.react';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';
import CopyToHOC from './CopyToHOC.react';
import AddOrRemoveColumnHOC from './AddOrRemoveColumnHOC.react';
import AddContactHOC from './AddContactHOC.react';
import AddTagDialogHOC from './AddTagDialogHOC.react';
import EditContactHOC from './EditContactHOC.react';
import PanelOverlayHOC from './PanelOverlayHOC.react';
import EmptyListStatement from './EmptyListStatement.react';
import AnalyzeSelectedTwitterHOC from './AnalyzeSelectedTwitterHOC.react';
import AnalyzeSelectedInstagramHOC from './AnalyzeSelectedInstagramHOC.react';
import ScatterPlotHOC from './ScatterPlotHOC.react';
import Tags from '../Tags/Tags.react';

import {
  generateTableFieldsmap,
  measureSpanSize,
  escapeHtml,
  convertToCsvString,
  exportOperations,
  isNumber,
  _getter
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
      profileContactId: null,
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      screenHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      firsttime: this.props.firstTimeUser,
      leftoverHeight: undefined,
    };

    // store outside of state to update synchronously for PanelOverlay
    this.showProfileTooltip = false;
    this.onTooltipPanel = false;

    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      this.setGridHeight();
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
    this.onCheckSelected = this._onCheckSelected.bind(this);
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
    this.setGridHeight = this._setGridHeight.bind(this);
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
    setTimeout(this.setGridHeight, 1500);
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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.contactIsReceiving) return false;
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listDidInvalidate) this.props.router.push('/notfound');
    if (nextProps.listId !== this.props.listId) {
      // underlying list changed
      this.fetchOperations(nextProps);
    }

    this.setGridHeight();
  
    if (this.state.sortPositions === null) {
      const sortPositions = nextProps.fieldsmap.map(fieldObj => fieldObj.sortEnabled ?  0 : 2);
      this.setState({sortPositions});
    }

    let columnWidths = this.state.columnWidths;
    if (this.props.fieldsmap.length !== nextProps.fieldsmap.length || columnWidths === null || nextProps.fieldsmap.length !== columnWidths.length) {
      columnWidths = nextProps.fieldsmap.map((fieldObj, i) => {
        const name = fieldObj.name;
        const size = measureSpanSize(name, '16px Source Sans Pro')
        return size.width > 70 ? size.width : 70;
      });
    }

    if (nextProps.contacts.length > 0 && !this.state.dragged) {
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

    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) this.onSearchClick(nextProps.searchQuery);
    }
  }

  componentWillUnmount() {
    window.onresize = undefined;
  }

  _setGridHeight() {
    const headerContainer = document.getElementById('HeaderGridContainerId');
    if (headerContainer) {
      const leftoverHeight = document.body.clientHeight - (headerContainer.getBoundingClientRect().top + 45);
      if (leftoverHeight !== this.state.leftoverHeight) {
        this.setState({leftoverHeight});
      }
    }
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

  _onCheck(e, contactId, contacts, {columnIndex, rowIndex, key, style}) {
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
      this.onCheckSelected(contactId);
      this.setState({lastRowIndexChecked: rowIndex});
    }
  }

  
  _onCheckSelected(contactId) {
    const checked = this.state.selected.some(id => id === contactId);
    const selected = !checked ?
    [...this.state.selected, contactId] :
    this.state.selected.filter(id => id !== contactId);
    this.setState({selected});
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
      customSpan = <span className='pointer' onClick={_ =>
        this.setState({
          selected: this.state.selected.length === this.props.listData.contacts.length ?
          [] : this.props.listData.contacts.slice()
        })} style={{whiteSpace: 'nowrap'}}>{content}</span>;
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

  _cellRenderer(cellProps) {
    const {columnIndex, rowIndex, key, style} = cellProps;
    const fieldObj = this.props.fieldsmap[columnIndex];
    let contacts = this.state.onSort ? this.state.sortedIds.map(id => this.props.contactReducer[id]) : this.props.contacts;
    let content = _getter(contacts[rowIndex], fieldObj) || '';

    let contentBody;
    let contentBody2 = null;
    if (fieldObj.tableOnly) {
      const rowData = contacts[rowIndex];
      switch (fieldObj.value) {
        case 'index':
          contentBody = <span>{rowIndex + 1}</span>;
          break;
        case 'selected':
          const isChecked = this.state.selected.some(id => id === rowData.id);
          contentBody = (
            <FontIcon
            onClick={(e) => this.onCheck(e, rowData.id, contacts, cellProps)}
            color={blue200}
            style={{fontSize: '0.9em'}}
            className={isChecked ? 'fa fa-square pointer' : 'fa fa-square-o pointer'}
            />);
          break;
        case 'profile':
          const state = this.state;
          contentBody = (
              <div
              className='pointer'
              style={{padding: '0 1px', marginRight: 15}}
              onMouseEnter={e => {
                this.showProfileTooltip = true;
                this.setState({
                  profileX: e.clientX,
                  profileY: e.clientY,
                  profileContactId: rowData.id
                });
              }}
              onMouseLeave={e => {
                setTimeout(_ => {
                  this.showProfileTooltip = this.onTooltipPanel;
                  this.forceUpdate();
                }, 80);
              }}
              onClick={e => {
                e.preventDefault();
                this.props.router.push(`/tables/${this.props.listId}/${rowData.id}`);
              }}
              >
                <FontIcon
                id='profile_hop'
                className='fa fa-arrow-right'
                style={{fontSize: '0.9em'}}
                color={blue300}
                />
              </div>);
          contentBody2 = !this.props.listData.readonly &&
            <EditContactHOC listId={this.props.listId} contactId={rowData.id}>
              {({onRequestOpen}) => (
              <FontIcon
              onClick={onRequestOpen}
              className='fa fa-edit pointer'
              style={{fontSize: '0.9em'}}
              color={blue300}
              />)}
            </EditContactHOC>;
          break;
        default:
          contentBody = <span>{content}</span>;
      }
    } else {
      contentBody = <span>{content}</span>;
    }

    return (
      <div
      className={rowIndex % 2 === 0 ? 'vertical-center cell evenRow' : 'vertical-center cell oddRow'}
      key={key}
      style={style}>
      {contentBody}{contentBody2}
      </div>);
    }

  _fetchOperations(props) {
    if (
      props.listData.contacts !== null &&
      props.received.length < props.listData.contacts.length
      ) {
      return props.loadAllContacts(props.listId);
    }
    return undefined;
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
    exportOperations(this.props.contacts, this.props.fieldsmap, this.props.listData.name);
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
      <div style={{marginTop: 10}}>
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
        {this.showProfileTooltip &&
          <PanelOverlayHOC
          onMouseEnter={_ => {
            this.showProfileTooltip = true;
            this.onTooltipPanel = true;
          }}
          onMouseLeave={_ => {
            this.showProfileTooltip = false;
            this.onTooltipPanel =  false;
            this.forceUpdate();
          }}
          profileX={state.profileX}
          profileY={state.profileY}
          contactId={state.profileContactId}
          listId={props.listId}
          />}
        <div className='row vertical-center' style={{margin: 5}}>
            <div className='large-3 medium-4 columns vertical-center'>
              <div>
                <span style={{fontSize: '0.8em', color: grey700}}>{props.listData.client}</span>
                <ControlledInput async disabled={props.listData.readonly} name={props.listData.name} onBlur={value => props.patchList({listId: props.listId, name: value})}/>
              </div>
            </div>
            <div className='large-4 medium-4 columns vertical-center'>
              <IconButton
              tooltip='Email'
              tooltipPosition='top-left'
              iconClassName='fa fa-envelope'
              iconStyle={{color: grey500}}
              onClick={_ => props.person.emailconfirmed ?
                this.setState({isEmailPanelOpen: true}) :
                alertify.alert('You can start using the Email feature after you confirmed your email. Look out for the confirmation email in your inbox.')}
              disabled={state.isEmailPanelOpen || props.listData.readonly}
              />
              <IconButton
              tooltip='Export'
              tooltipPosition='top-left'
              iconClassName='fa fa-download'
              iconStyle={{color: grey500}}
              onClick={this.onExportClick}
              />
              <CopyToHOC
              listId={props.listId}
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
              </CopyToHOC>
              <AddOrRemoveColumnHOC listId={props.listId} fieldsmap={props.rawFieldsmap}>
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
              </AddOrRemoveColumnHOC>
              <AddContactHOC listId={props.listId}>
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
              </AddContactHOC>
              <IconButton
              tooltip='Delete Contact'
              tooltipPosition='top-left'
              iconClassName='fa fa-trash'
              disabled={props.listData.readonly}
              iconStyle={{color: grey500}}
              onClick={this.onRemoveContacts}
              />
              <AddTagDialogHOC listId={props.listId}>
                {({onRequestOpen}) =>
                <IconButton iconStyle={{color: grey500}} iconClassName='fa fa-tags' onClick={onRequestOpen} tooltip='Add Tag & Client' tooltipPosition='top-right'/>}
              </AddTagDialogHOC>
            </div>
            <div className='large-4 columns vertical-center'>
              <TextField
              id='search-input'
              hintText='Search...'
              value={state.searchValue}
              onChange={e => {
                const searchValue = e.target.value;
                if (this.state.searchValue.length > 0 && searchValue.length === 0) this.onSearchClearClick();
                this.setState({searchValue});
              }}
              onKeyDown={e => e.keyCode === 13 ? props.router.push(`/tables/${props.listId}?search=${state.searchValue}`) : null}
              errorText={state.errorText}
              />
              <RaisedButton className='noprint' style={{marginLeft: 5}} onClick={_=> props.router.push(`/tables/${props.listId}?search=${state.searchValue}`)} label='Search' labelStyle={{textTransform: 'none'}} />
            </div>
          {
            props.fieldsmap !== null &&
            <div className='large-1 columns vertical-center'>
              <ScatterPlotHOC selected={state.selected} defaultYFieldname='instagramlikes' defaultXFieldname='instagramfollowers' listId={props.listId} fieldsmap={props.fieldsmap}>
              {sc => (
                <AnalyzeSelectedInstagramHOC selected={state.selected} listId={props.listId}>
                {inst => (
                 <AnalyzeSelectedTwitterHOC selected={state.selected} listId={props.listId}>
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
                      primaryText='Trendline'
                      leftIcon={<FontIcon className='fa fa-area-chart'/>}
                      onTouchTap={sc.onRequestOpen}
                      disabled={state.selected.length === 0}
                      />
                    </IconMenu>)}
                  </AnalyzeSelectedTwitterHOC>)}
                </AnalyzeSelectedInstagramHOC>)}
             </ScatterPlotHOC>
            </div>
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
        <div className='row vertical-center' style={{margin: '10px 0'}}>
          <Tags listId={props.listId}/>
        </div>
        <div>
        {props.listData.contacts === null &&
          <EmptyListStatement className='row horizontal-center vertical-center' style={{height: 400}} />}
        <div>
          {props.listData.contacts && props.listData.contacts !== null && props.contacts &&
          <LinearProgress color={blue100} mode='determinate' value={props.contacts.length} min={0} max={props.listData.contacts.length}/>}
        </div>
        {props.received.length > 0 && state.columnWidths !== null &&
          <ScrollSync>
          {({clientHeight, clientWidth, onScroll, scrollHeight, scrollLeft, scrollTop, scrollWidth}) =>
            <div>
              <div id='HeaderGridContainerId' className='HeaderGridContainer'>
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
                <Grid
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
                overscanRowCount={10}
                height={state.leftoverHeight || 500}
                width={state.screenWidth}
                rowCount={props.received.length}
                rowHeight={30}
                onScroll={onScroll}
                />
            </div>}
          </ScrollSync>}
        </div>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  const searchQuery = props.location.query.search;

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  let received = [];
  let contacts = [];
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

  const rawFieldsmap = generateTableFieldsmap(listData);

  return {
    received,
    searchQuery,
    listId,
    listIsReceiving: state.listReducer.isReceiving,
    listData,
    fieldsmap: rawFieldsmap.filter(fieldObj => !fieldObj.hidden && !fieldObj.internal),
    rawFieldsmap,
    contacts,
    contactIsReceiving: state.contactReducer.isReceiving,
    publicationReducer,
    person: state.personReducer.person,
    firstTimeUser: state.personReducer.firstTimeUser,
    contactReducer: state.contactReducer,
    listDidInvalidate: state.listReducer.didInvalidate,
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
