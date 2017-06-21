import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
import classNames from 'classnames';

import find from 'lodash/find';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as contactActions} from 'components/Contacts';
import {actions as loginActions} from 'components/Login';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import {grey50, teal400, teal900, blue100, blue200, blue300, grey500, grey400, grey700} from 'material-ui/styles/colors';
import {Grid, ScrollSync} from 'react-virtualized';
import Draggable from 'react-draggable';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';
import Paper from 'material-ui/Paper';

import EmailPanel from 'components/Email/EmailPanel/EmailPanel.react';
import Drawer from 'material-ui/Drawer';
import {ControlledInput} from '../ToggleableEditInput';
import Waiting from '../Waiting';
import CopyToHOC from './CopyToHOC';
import ColumnEditPanelHOC from 'components/ListTable/ColumnEditPanelHOC/ColumnEditPanelHOC.react';
import AddContactHOC from './AddContactHOC.react';
import AddTagDialogHOC from './AddTagDialogHOC.react';
import EditMultipleContactsHOC from './EditMultipleContactsHOC.react';
import PanelOverlayHOC from './PanelOverlayHOC.react';
import EmptyListStatement from './EmptyListStatement.react';
import AnalyzeSelectedTwitterHOC from './AnalyzeSelectedTwitterHOC.react';
import AnalyzeSelectedInstagramHOC from './AnalyzeSelectedInstagramHOC.react';
import ScatterPlotHOC from './ScatterPlotHOC.react';
import Tags from 'components/Tags/TagsContainer.react';
import Tag from 'components/Tags/Tag.react';
import EditContactDialog from './EditContactDialog.react';

import {
  generateTableFieldsmap,
  measureSpanSize,
  exportOperations,
  isNumber,
  _getter
} from './helpers';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
import 'react-virtualized/styles.css';
import './Table.css';


const localStorage = window.localStorage;
let DEFAULT_WINDOW_TITLE = window.document.title;

alertify.promisifyConfirm = (title, description) => new Promise((resolve, reject) => {
  alertify.confirm(title, description, resolve, reject);
});

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
  alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
});

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
      scrollToRow: undefined,
      currentSearchIndex: 0,
      isDeleting: false,
      showEditPanel: false,
      currentEditContactId: undefined,
      showEmailPanel: true,
    };

    // store outside of state to update synchronously for PanelOverlay
    this.showProfileTooltip = false;
    this.onTooltipPanel = false;
    this.onShowEmailClick = _ => props.person.emailconfirmed ?
      this.setState({isEmailPanelOpen: true}) :
      alertify.alert('Trial Alert', 'You can start using the Email feature after you confirmed your email. Look out for the confirmation email in your inbox.', function() {});

    if (this.props.listData) {
      window.document.title = `${this.props.listData.name} --- NewsAI Tabulae`;
    }
    this.onSearchClick = e => {
      const searchValue = this.refs.searchValue.input.value;
      if (searchValue.length === 0) {
        this.props.router.push(`/tables/${props.listId}`);
        this.onSearchClearClick();
      } else if (this.state.isSearchOn && searchValue === this.state.searchValue && this.props.listData.searchResults.length > 0) {
        this.getNextSearchResult();
      } else {
        this.props.router.push(`/tables/${this.props.listId}?search=${searchValue}`);
        this.setState({searchValue});
      }
    };

    window.onresize = _ => {
      const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      this.setGridHeight();
      this.setState({screenWidth, screenHeight});
    };
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
    };
    this.clearColumnStorage = columnWidths => localStorage.setItem(this.props.listId, undefined);
    this.fetchOperations = this._fetchOperations.bind(this);
    this.onCheckSelected = this._onCheckSelected.bind(this);
    this.onCheck = this._onCheck.bind(this);
    this.onSearchClearClick = this._onSearchClearClick.bind(this);
    this.onSearch = this._onSearch.bind(this);
    this.getNextSearchResult = this._getNextSearchResult.bind(this);
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
    this.resetSort = () => this.setState({
      sortPositions: this.props.fieldsmap === null ? null : this.props.fieldsmap.map(fieldObj => fieldObj.sortEnabled ? 0 : 2),
      onSort: false,
      sortedIds: [],
    });
    this.checkEmailDupes = this._checkEmailDupes.bind(this);
    this.forceEmailPanelRemount = _ => this.setState({showEmailPanel: false}, _ => this.setState({showEmailPanel: true}));
  }

  componentWillMount() {
    // get locally stored columnWidths
    let columnWidths = this.getColumnStorage();
    if (columnWidths) this.setState({columnWidths});
    if (this.props.searchQuery) {
      this.fetchOperations(this.props).then(_ => this.onSearch(this.props.searchQuery));
    }
    else if (this.props.location.query.justCreated == 'true') {
      this.fetchOperations(this.props).then(_ => this.checkEmailDupes());
    }
    else this.fetchOperations(this.props);

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
        this.props.fieldsmap.map((fieldObj, i) => {
          let max = columnWidths[i];
          this.props.contacts.map(contact => {
            let content;
            if (fieldObj.customfield) {
              if (contact.customfields === null) return;
              if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return;
              content = find(contact.customfields, obj => obj.name === fieldObj.value).value;
            } else {
              content = contact[fieldObj.value];
            }
            const size = measureSpanSize(content, '16px Source Sans Pro');
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

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listDidInvalidate) {
      this.props.router.push('/notfound');
    }

    if (nextProps.listData) {
      window.document.title = `${nextProps.listData.name} --- NewsAI Tabulae`;
    }

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
            content = find(contact.customfields, obj => obj.name === fieldObj.value).value;
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

    this.setState({columnWidths},
      _ => {
      if (this._HeaderGrid && this._DataGrid) {
        this._HeaderGrid.recomputeGridSize();
        this._DataGrid.recomputeGridSize();
      }
    });

    if (nextProps.searchQuery !== this.props.searchQuery) {
      if (nextProps.searchQuery) {
        this.onSearch(nextProps.searchQuery);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.contactIsReceiving && nextProps.contactIsReceiving) return false;
    return true;
  }


  componentWillUnmount() {
    window.onresize = undefined;
    window.document.title = DEFAULT_WINDOW_TITLE;
  }

  _checkEmailDupes() {
    let seen = {};
    let dupMap = {};
    let dupes = [];
    this.props.contacts.map(contact => {
      if (isEmpty(contact.email)) return;
      if (seen[contact.email]) {
        dupes.push(contact.id);
        dupMap[contact.email] = true;
      }
      else seen[contact.email] = true;
    });
    if (Object.keys(dupMap).length > 0) alertify.alert('Duplicate Email Warning', `We found email duplicates for ${Object.keys(dupMap).join(', ')}. Every duplicate email is selected if you wish to delete them. If not, you can deselect them all by clicking on "Selected" label twice.`);
    this.setState({selected: dupes});
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
      const checked = this.state.selected.length === this.props.listData.contacts.length;
      customSpan = (
        <input
        type='checkbox'
        className='pointer'
        checked={checked}
        onClick={_ => this.setState({selected: checked ? [] : this.props.listData.contacts.slice()})}
        />);
    }

    return (
      <div className='headercell' key={key} style={style}>
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
    // switch row to different color classname if it is search result
    let className = classNames(
      'vertical-center',
      'cell',
      {evenRow: !contacts[rowIndex].isSearchResult && rowIndex % 2 === 0},
      {oddRow: !contacts[rowIndex].isSearchResult && rowIndex % 2 === 0},
      {findresult: contacts[rowIndex].isSearchResult}
      );

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
            onClick={e => this.onCheck(e, rowData.id, contacts, cellProps)}
            color={blue200}
            style={styles.profileIcon}
            className={isChecked ? 'fa fa-square pointer' : 'fa fa-square-o pointer'}
            />);
          break;
        case 'profile':
          contentBody = (
              <Link to={`/tables/${this.props.listId}/${rowData.id}`}>
                <FontIcon
                id='profile_hop'
                className='fa fa-arrow-right'
                color={blue300}
                style={styles.profileIcon}
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
                />
              </Link>
              );
          contentBody2 = !this.props.listData.readonly &&
          <FontIcon
          onClick={_ => this.setState({currentEditContactId: rowData.id, showEditPanel: true})}
          className='fa fa-edit pointer'
          style={styles.profileIcon}
          color={blue300}
          />;
          break;
        default:
          contentBody = <span>{content}</span>;
      }
    } else {
      switch (fieldObj.value) {
        case 'tags':
          contentBody = content ? content
          .slice(0, 3)
          .map((tag, i) =>
            <Tag
            key={`${tag}-${i}`}
            hideDelete
            whiteLabel
            text={tag}
            color={teal400}
            borderColor={teal900}
            link={`/contacts?tag=${tag}`}
            />) : '';
          break;
        default:
          contentBody = <span>{content}</span>;
      }
    }

    return (
      <div className={className} key={key} style={style}>
      {contentBody}{contentBody2}
      </div>
      );
  }

  _fetchOperations(props) {
    if (
      props.listData.contacts !== null &&
      props.received.length < props.listData.contacts.length
      ) {
      window.Intercom('trackEvent', 'opened_sheet', {listId: props.listData.id});
      return props.loadAllContacts(props.listId);
    }
    return Promise.resolve(true);
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


  _onExportClick() {
    window.Intercom('trackEvent', 'on_export_click');
    exportOperations(this.props.contacts, this.props.fieldsmap, this.props.listData.name);
  }

  _onRemoveContacts() {
    const selected = this.state.selected;
    if (selected.length === 0) return;
    alertify.promisifyConfirm('Delete Contacts', `This action cannot be reversed. Are you sure you want to delete ${selected.length} contact(s).`)
    .then(
      _ => {
        const newListContacts = difference(this.props.listData.contacts, selected);
        this.props.deleteContacts(selected);
        this.setState({isDeleting: true});
        this.props.patchList({
          listId: this.props.listId,
          contacts: newListContacts,
          name: this.props.listData.name,
        }).then(_ => this.setState({isDeleting: false}));
        if (this.state.onSort) {
          this.setState({
            sortedIds: difference(this.state.sortedIds, selected),
            selected: []
          });
        } else {
          this.setState({selected: []});
        }
      },
      _ => {}
      );
  }

  _onSearch(searchValue) {
    const props = this.props;
    if (searchValue !== this.state.searchValue) {
      this.setState({searchValue});
    }
    window.Intercom('trackEvent', 'listtable_search');
    props.searchListContacts(props.listId, searchValue)
    .then(({searchContactMap, ids}) => {
      // find where first search result is in the list
      let scrollToFirstPosition;
      if (ids.length > 0) {
        for (let i = 0; props.listData.contacts.length; i++) {
          if (props.listData.contacts[i] === ids[0]) {
            scrollToFirstPosition = i;
            break;
          }
        }
      }
      this.setState({
        isSearchOn: true,
        currentSearchIndex: 0,
        scrollToRow: scrollToFirstPosition,
      });
    });
  }

  _onSearchClearClick() {
    this.props.router.push(`/tables/${this.props.listId}`);
    this.setState({
      searchValue: '',
      errorText: null,
      isSearchOn: false,
      currentSearchIndex: 0
    });
  }

  _getNextSearchResult() {
    const currentSearchIndex = (this.state.currentSearchIndex + 1) % this.props.listData.searchResults.length;
    let scrollToRow;
    if (this.props.listData.searchResults.length > 0) {
      for (let i = 0; this.props.listData.contacts.length; i++) {
        if (this.props.listData.contacts[i] === this.props.listData.searchResults[currentSearchIndex]) {
          scrollToRow = i;
          break;
        }
      }
    }
    this.setState({currentSearchIndex, scrollToRow});
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
              <div style={{margin: '0 3px'}}>
                <RaisedButton label='Skip Tour' onClick={_ => {
                  this.setState({firsttime: false});
                  props.removeFirstTimeUser();
                }}/>
              </div>
              <div style={{margin: '0 3px'}}>
                <RaisedButton primary label='Start Tour' onClick={_ => {
                  this.setState({firsttime: false});
                  hopscotch.startTour(tour);
                }}/>
              </div>
            </div>
          </Dialog>
        }
        <div className='vertical-center'>
          <Link to={`/listfeeds/${props.listId}`}>
            <FlatButton
            labelStyle={{textTransform: 'none', color: grey400}}
            icon={<FontIcon className='fa fa-arrow-right' color={grey400} />}
            label='List Feed'
            />
          </Link>
        </div>
        <EditContactDialog
        listId={props.listId}
        contactId={state.currentEditContactId}
        open={state.showEditPanel}
        onClose={_ => this.setState({showEditPanel: false})}
        />
        {this.showProfileTooltip &&
          <PanelOverlayHOC
          onMouseEnter={_ => {
            this.showProfileTooltip = true;
            this.onTooltipPanel = true;
          }}
          onMouseLeave={_ => {
            this.showProfileTooltip = false;
            this.onTooltipPanel = false;
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
              <span className='smalltext' style={{color: grey700}}>{props.listData.client}</span>
              <ControlledInput
              async
              disabled={props.listData.readonly}
              name={props.listData.name}
              onBlur={value => props.patchList({listId: props.listId, name: value})}
              />
            </div>
          </div>
          <div className='large-4 medium-4 columns vertical-center'>
            <IconButton
            tooltip='Show Email'
            tooltipPosition='top-left'
            iconClassName='fa fa-envelope'
            iconStyle={styles.iconBtn}
            onClick={this.onShowEmailClick}
            disabled={state.isEmailPanelOpen || props.listData.readonly}
            />
            <IconButton
            tooltip='Export'
            tooltipPosition='top-left'
            iconClassName='fa fa-download'
            iconStyle={styles.iconBtn}
            onClick={this.onExportClick}
            />
            <CopyToHOC listId={props.listId} selected={state.selected}>
            {({onRequestOpen}) => (
              <IconButton
              iconStyle={styles.iconBtn}
              id='copy_contacts_hop'
              tooltip='Copy to Another Table'
              tooltipPosition='top-left'
              iconClassName='fa fa-copy'
              onClick={onRequestOpen}
              />)}
            </CopyToHOC>
            <ColumnEditPanelHOC listId={props.listId} fieldsmap={props.rawFieldsmap}>
            {({onRequestOpen}) => (
              <IconButton
              iconStyle={styles.iconBtn}
              id='add_remove_columns_hop'
              disabled={props.listData.readonly}
              tooltip='Show/Hide columns'
              tooltipPosition='top-left'
              iconClassName='fa fa-table'
              onClick={onRequestOpen}
              />)}
            </ColumnEditPanelHOC>
            <AddContactHOC contacts={props.contacts} listId={props.listId}>
            {({onRequestOpen}) => (
              <IconButton
              iconStyle={styles.iconBtn}
              tooltip='Add New Contact'
              id='add_contact_hop'
              disabled={props.listData.readonly}
              tooltipPosition='top-left'
              iconClassName='fa fa-plus'
              onClick={onRequestOpen}
              />)}
            </AddContactHOC>
            <IconButton
            iconStyle={styles.iconBtn}
            tooltip='Delete Contact'
            tooltipPosition='top-left'
            iconClassName={state.isDeleting ? 'fa fa-spin fa-spinner' : 'fa fa-trash'}
            disabled={props.listData.readonly}
            onClick={this.onRemoveContacts}
            />
            <AddTagDialogHOC listId={props.listId}>
              {({onRequestOpen}) =>
              <IconButton
              iconStyle={styles.iconBtn}
              iconClassName='fa fa-tags'
              onClick={onRequestOpen}
              tooltip='Add Tag & Client'
              tooltipPosition='top-right'
              disabled={props.listData.readonly}
              />}
            </AddTagDialogHOC>
          {state.selected.length > 1 &&
            <EditMultipleContactsHOC selected={state.selected} listId={props.listId}>
            {({onRequestOpen}) =>
              <IconButton
              iconStyle={styles.iconBtn}
              iconClassName='fa fa-edit'
              tooltip='Edit Multiple'
              tooltipPosition='top-right'
              disabled={props.listData.readonly}
              onClick={onRequestOpen}
              />}
            </EditMultipleContactsHOC>}
          </div>
          <div className='large-4 columns vertical-center'>
            <TextField
            id='search-input'
            ref='searchValue'
            hintText='Search...'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const searchValue = this.refs.searchValue.input.value;
                props.router.push(`/tables/${props.listId}?search=${searchValue}`);
                this.setState({searchValue});
              }
            }}
            floatingLabelText={state.isSearchOn && props.listData.searchResults ? `Found ${props.listData.searchResults.length} matches. ${props.listData.searchResults.length > 0 ? `Currently on ${state.currentSearchIndex+1}.` : ''}` : undefined}
            floatingLabelFixed={state.isSearchOn}
            defaultValue={props.searchQuery || ''}
            errorText={state.errorText}
            />
            <IconButton
            className='noprint'
            iconClassName='fa fa-search'
            tooltip='Search'
            tooltipPosition='top-center'
            style={{marginLeft: 5}}
            onClick={e => {
              const searchValue = this.refs.searchValue.input.value;
              if (searchValue.length === 0) {
                this.props.router.push(`/tables/${props.listId}`);
                this.onSearchClearClick();
              } else if (this.state.isSearchOn && searchValue === this.state.searchValue && this.props.listData.searchResults.length > 0) {
                this.getNextSearchResult();
              } else {
                this.props.router.push(`/tables/${this.props.listId}?search=${searchValue}`);
                this.setState({searchValue});
              }
            }}
            />
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
          </div>}
        </div>
      {!state.isEmailPanelOpen &&
        <Paper
        className='vertical-center pointer'
        zDepth={2}
        style={styles.emailPanelDragHandle}
        onClick={this.onShowEmailClick}
        >
          <FontIcon color={grey400} hoverColor={grey500} className='fa fa-chevron-left' />
        </Paper>}
        <Drawer
        openSecondary
        docked={false}
        containerStyle={{zIndex: 400, backgroundColor: '#ffffff'}}
        overlayStyle={{zIndex: 300}}
        width={800}
        open={state.isEmailPanelOpen}
        onRequestChange={isEmailPanelOpen => this.setState({isEmailPanelOpen})}
        >
        {state.showEmailPanel &&
          <EmailPanel
          width={800}
          selected={state.selected}
          fieldsmap={props.fieldsmap.filter(fieldObj => !fieldObj.hideCheckbox)}
          listId={props.listId}
          onClose={_ => this.setState({isEmailPanelOpen: false})}
          onReset={this.forceEmailPanelRemount}
          />
        }
        </Drawer>
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
            scrollToRow={state.scrollToRow}
            />
          </div>}
        </ScrollSync>}
      </div>
    </div>);
  }
}

const styles = {
  emailPanelDragHandle: {
    zIndex: 400,
    position: 'fixed',
    right: 0,
    top: '35%',
    height: '15%',
    padding: '0 5px',
    backgroundColor: grey50
  },
  nameBlock: {
    parent: {
      marginTop: 40,
    },
  },
  loading: {
    zIndex: 200,
    top: 80,
    right: 10,
    position: 'fixed'
  },
  iconBtn: {
    color: grey500
  },
  profileIcon: {fontSize: '0.9em', padding: '0 1px', margin: '0 5px'},
};

const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const listData = state.listReducer[listId];
  const publicationReducer = state.publicationReducer;
  const searchQuery = props.location.query.search;

  // if one contact is loaded before others, but also indexes lastFetchedIndex for lazy-loading
  let received = [];
  let contacts = [];

  if (!isEmpty(listData.contacts)) {
    listData.contacts.map((contactId, i) => {
      if (state.contactReducer[contactId]) {
        let contact = state.contactReducer[contactId];
        if (searchQuery && listData.searchResults && listData.searchResults.some(id => contactId === id)) {
          contact.isSearchResult = true;
        } else {
          contact.isSearchResult = false;
        }
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchListContacts: (listId, query) => dispatch(contactActions.searchListContacts(listId, query)),
    patchList: listObj => dispatch(listActions.patchList(listObj)),
    patchContacts: contacts => dispatch(contactActions.patchContacts(contacts)),
    addContacts: contacts => dispatch(contactActions.addContacts(contacts)),
    createPublication: name => dispatch(publicationActions.createPublication(name)),
    updateOutdatedContacts: contactId => dispatch(contactActions.updateContact(contactId)),
    fetchList: listId => dispatch(listActions.fetchList(listId)),
    fetchContacts: listId => dispatch(contactActions.fetchContacts(listId)),
    searchPublications: query => dispatch(publicationActions.searchPublications(query)),
    clearSearchCache: listId => dispatch({type: 'CLEAR_LIST_SEARCH', listId}),
    deleteContacts: ids => dispatch(contactActions.deleteContacts(ids)),
    loadAllContacts: listId => dispatch(contactActions.loadAllContacts(listId)),
    removeFirstTimeUser: _ => dispatch(loginActions.removeFirstTimeUser()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListTable));
