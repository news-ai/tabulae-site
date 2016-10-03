import React, {Component} from 'react';
import {connect} from 'react-redux';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full';
import alertify from 'alertifyjs';
import * as actionCreators from 'actions/AppActions';
import {COLUMNS} from 'constants/ColumnConfigs';
import validator from 'validator';
import {outdatedRenderer } from 'constants/CustomRenderers';
import _ from 'lodash';
import {fromJS} from 'immutable';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import 'node_modules/handsontable/dist/handsontable.full.min.css';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const MIN_ROWS = 20;
const BATCH_CONTACT_SIZE = 200;
alertify.defaults.glossary.title = '';
let defaultColumns = [{
  data: 'profile',
  title: 'Profile',
  readOnly: true,
  renderer: function(instance, td, row, col, prop, value, cellProperties) {
    // browserHistory.push(instance.getDataAtRowProp(row, 'listid'), instance.getDataAtRowProp(row, 'id'));
    if (instance.getDataAtRowProp(row, 'id')) td.innerHTML = `<a href='${instance.getDataAtRowProp(row, 'listid')}/${instance.getDataAtRowProp(row, 'id')}'>Goto</a>`;
    // Handsontable.renderers.TextRenderer.apply(this, arguments);
  }
}, ...COLUMNS.map(col => col)];

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    this._addColumn = this._addColumn.bind(this);
    this._removeColumn = this._removeColumn.bind(this);
    this._changeColumnName = this._changeColumnName.bind(this);
    this._cleanUpURL = this._cleanUpURL.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.loadTable = this._loadTable.bind(this);
    this.remountTable = this._remountTable.bind(this);
    this.handleClose = _ => this.setState({isAddPanelOpen: false});
    this.handleSelectChange = (event, index, selectvalue) => this.setState({selectvalue});
    if (!defaultColumns.some(col => col.data === 'publication_name_1' && col.type === 'autocomplete')) {
      defaultColumns = defaultColumns.filter(col => !(col.data === 'publication_name_1' && col.type !== 'autocomplete'));
      defaultColumns.push({
        data: 'publication_name_1',
        type: 'autocomplete',
        title: 'Publication 1',
        source: (query, callback) => {
          props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
          // callback([]);
        },
        strict: false
      });
    }
    if (!defaultColumns.some(col => col.data === 'publication_name_2' && col.type === 'autocomplete')) {
      defaultColumns = defaultColumns.filter(col => !(col.data === 'publication_name_2' && col.type !== 'autocomplete'));
      defaultColumns.push({
        data: 'publication_name_2',
        type: 'autocomplete',
        title: 'Publication 2',
        source: (query, callback) => {
          props.searchPublications(query)
          .then(publicationNameArray => callback(publicationNameArray));
          // callback([]);
        },
        strict: false
      });
    }
    this.state = {
      intervalId: null,
      selectvalue: null,
      inputvalue: '',
      isAddPanelOpen: false,
      addedRow: false,
      update: false,
      lazyLoadingThreshold: 100,
      lastFetchedIndex: -1,
      fieldsmap: [],
      immutableFieldmap: fromJS([]),
      dirtyRows: [],
      preservedColumns: defaultColumns,
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        rowHeaders: true,
        sortIndicator: true,
        minCols: defaultColumns.length,
        minRows: MIN_ROWS,
        manualColumnMove: true,
        manualRowMove: true,
        manualColumnResize: true,
        manualRowResize: true,
        persistentState: true,
        minSpareRows: 10,
        observeChanges: true,
        columns: _.cloneDeep(defaultColumns),
        cells: (row, col, prop) => {
          const cellProperties = {};
          // default to highlightable renderer when selected
          // cellProperties.renderer = hightlightRenderer;
          if (this.state.options.data[row]) {
            if (this.state.options.data[row].isoutdated) {
              // apply different colored renderer for outdated contacts
              cellProperties.renderer = outdatedRenderer;
            }
          }
          return cellProperties;
        },
        beforeChange: (changes, source) => {
          for (let i = changes.length - 1; i >= 0; i--) {
            if (changes[i][1] === 'linkedin' && validator.isURL(changes[i][3])) changes[i][3] = this._cleanUpURL(changes[i][3]);
          }

          // changes[0] = [rowNum, colData, valBeforeChange, valAfterChange]
          this.props.isDirty();
          if (_.isEmpty(this.props.listData.contacts)) return;

          let rowNum;
          let rowId;
          const dirtyRows = this.state.dirtyRows;
          changes.map( change => {
            rowNum = change[0];
            if (rowNum > this.props.listData.contacts.length - 1) return;
            rowId = this.state.options.data[rowNum].id;
            if (change[1] === change[2] || _.isEmpty(change[1]) && _.isEmpty(change[2])) {
              // console.log('DO NOTHING');
            } else {
              if (!dirtyRows.some(rnum => rnum === rowId)) {
                dirtyRows.push(rowId);
              }
            }
          });

          this.setState({dirtyRows});
        },
        afterChange: (changes, source) => {
          // save selected rows
          if (source === 'edit') {
            const selectedRows = this.state.options.data.filter(row => row.selected);
            this.props._getSelectedRows(selectedRows);
            this.table.runHooks('persistentStateReset', 'columnSorting');
          }
        },
        afterColumnSort: (column, order) => {
          this.table.runHooks('persistentStateReset', 'columnSorting');
        },
        afterScrollVertically: e => {
          const { lastFetchedIndex, contactIsReceiving, fetchContacts, listId, listData } = this.props;
          if (_.isEmpty(listData.contacts)) return;
          if (listData.contacts.length < BATCH_CONTACT_SIZE) return;
          if (lastFetchedIndex === listData.contacts.length - 1) return;
          const rowCount = this.table.countRows();
          const rowOffset = this.table.rowOffset();
          const visibleRows = this.table.countVisibleRows();
          let lastRow = rowOffset + (visibleRows * 1);
          const lastVisibleRow = rowOffset + visibleRows + (visibleRows / 2);
          const threshold = this.state.lazyLoadingThreshold;

          if (lastVisibleRow > (lastFetchedIndex - threshold)) {
            if (!contactIsReceiving) fetchContacts(listId);
          }
        },
        contextMenu: {
          callback: (key, options) => {
            if (key === 'insert_row_above') {
              const index = options.start.row;
              props.addContacts([{}])
              .then(contacts => {
                const listContacts = props.listData.contacts;
                let newContacts;
                if (index === 0) {
                  newContacts = [contacts[0].id, ...listContacts];
                } else {
                  newContacts = [
                    ...listContacts.slice(0, index),
                    contacts[0].id,
                    ...listContacts.slice(index, listContacts.length)
                  ];
                }
                this.setState({addedRow: true});
                props.patchList({
                  listId: props.listData.id,
                  contacts: newContacts,
                  name: props.name,
                  fieldsmap: this.state.fieldsmap
                });
              });
            }

            if (key === 'insert_row_below') {
              const index = options.start.row;
              props.addContacts([{}])
              .then(contacts => {
                const listContacts = props.listData.contacts;
                let newContacts;
                if (index === 0) {
                  newContacts = [listContacts[0], contacts[0].id, ...listContacts.slice(1, listContacts.length)];
                } else {
                  newContacts = [
                    ...listContacts.slice(0, index + 1),
                    contacts[0].id,
                    ...listContacts.slice(index + 1, listContacts.length)
                  ];
                }
                this.setState({addedRow: true});
                props.patchList({
                  listId: props.listId,
                  contacts: newContacts,
                  name: props.name,
                  fieldsmap: this.state.fieldsmap
                });
              });
            }

            if (key === 'remove_selected_rows') {
              const low = options.start.row <= options.end.row ? options.start.row : options.end.row;
              const hi = low === options.start.row ? options.end.row : options.end.row;
              const removeIdList = this.state.options.data.filter( (row, i) => low <= i && i <= hi ).map(row => row.id);
              const newListContacts = _.difference(props.listData.contacts, removeIdList);
              props.patchList({
                listId: props.listId,
                contacts: newListContacts,
                name: props.name,
                fieldsmap: this.state.fieldsmap
              });
              this.setState({addedRow: true, lastFetchedIndex: this.state.lastFetchedIndex - (hi - low + 1)});
            }

            if (key === 'remove_column') {
              for (let i = options.start.col; i <= options.end.col; i++) {
                this._removeColumn(props.listId, this.state.options.columns, this.table.colToProp(i), i);
              }
            }

            if (key === 'change_col_name') {
              if (options.start.col !== options.end.col) {
                alertify.alert(`To change column name, only select one column at a time.`);
              } else {
                alertify.prompt(
                `Change Column Name`,
                `What is the new column name?`,
                '',
                (e, value) => this._changeColumnName(props.listId, this.state.options.columns, options.start.col, value),
                _ => alertify.error('Cancel')
                );
              }
            }

            if (key === 'add_column') {
              console.log('ADD_COLUMN');
              this.setState({isAddPanelOpen: true});
            }
          },
          items: {
            insert_row_above: {
              name: 'Insert Row Above'
            },
            insert_row_below: {
              name: 'Insert Row Below'
            },
            remove_selected_rows: {
              name: 'Remove Row'
            },
            hsep1: '---------',
            undo: {},
            redo: {},
            hsep2: '---------',
            remove_column: {
              name: 'Remove Column',
            },
            change_col_name: {
              name: 'Change Column Name'
            },
            add_column: {
              name: 'Add Column'
            }
          },
        }
      }
    };
  }

  componentWillMount() {
    const { contacts, listData, lastFetchedIndex, isSearchOn } = this.props;
    this.loadTable(contacts, listData, lastFetchedIndex, isSearchOn);
    const intervalId = setInterval(_ => {
      this._onSaveClick(this.state.options.data, this.state.options.columns);
    }, 30000);
    this.setState({intervalId});
  }

  componentDidMount() {
    const options = this.state.options;
    this.table = new Handsontable(this.refs['data-grid'], options);
    this.table.runHooks('persistentStateReset', 'columnSorting');
  }

  componentWillReceiveProps(nextProps) {
    const {contacts, listData, lastFetchedIndex, isSearchOn} = nextProps;
    if (this.table) {
      this.table.runHooks('persistentStateReset', 'columnSorting');
    }
    this.loadTable(contacts, listData, lastFetchedIndex, isSearchOn);
  }

  componentWillUnmount() {
    // console.log(this.state.fieldsmap);
    // console.log(this.props.contacts);
    // this.table.runHooks('persistentStateSave', 'fieldsmap', this.state.fieldsmap);
    // this.table.runHooks('persistentStateSave', 'contacts', this.props.contacts);
    clearInterval(this.state.intervalId);
    this.table.destroy();
  }

  _remountTable() {
    const options = this.state.options;
    this.table = new Handsontable(this.refs['data-grid'], options);
  }

  _loadTable(contacts, listData, lastFetchedIndex, isSearchOn) {
    const options = this.state.options;
    const fieldsmap = listData.fieldsmap;
    const immutableFieldmap = fromJS(listData.fieldsmap);
    if (this.table) this.table.runHooks('persistentStateReset', 'columnSorting');

      //Handsontable.hooks.run(this.hot, 'persistentStateSave', 'columnSorting', sortingState);

    if (!_.isEmpty(listData.contacts)) {
      if (!immutableFieldmap.equals(this.state.immutableFieldmap)) {
        let columns = _.cloneDeep(this.state.preservedColumns
          .filter(col => !fieldsmap.some(fieldObj => fieldObj.hidden && fieldObj.value === col.data)));
        fieldsmap.map(fieldObj => {
          if (fieldObj.customfield && !fieldObj.hidden) columns.push({data: fieldObj.value, title: fieldObj.name});
        });
        options.columns = columns;
        this.setState({immutableFieldmap});
        this.props.saveHeaders(columns); // to pass up to Table to consume
        if (this.table) this.table.updateSettings(options);
      }

      if (this.state.lastFetchedIndex === -1) {
        options.minRows = listData.contacts.length + 5;
        this.setState({options});
        if (this.table) this.table.updateSettings(options);
      }

      // load every 50 contacts to avoid slow UI
      if (
        lastFetchedIndex - this.state.lastFetchedIndex === BATCH_CONTACT_SIZE ||
        listData.contacts.length <= BATCH_CONTACT_SIZE ||
        lastFetchedIndex === listData.contacts.length - 1 ||
        this.state.addedRow ||
        this.props.isSearchOn !== isSearchOn
        ) {
        options.data = contacts;
        options.columnSorting = true;
        this.setState({
          options,
          fieldsmap,
          lastFetchedIndex,
          addedRow: false
        });
        if (this.table) this.table.updateSettings(options);
      }
    }
  }

  _changeColumnName(listId, columns, colNum, newColumnName) {
    const {fieldsmap} = this.state;
    const columnValue = columns[colNum].data;
    const newFieldsmap = fieldsmap.map( fieldObj => {
      if (fieldObj.value === columnValue && fieldObj.customfield) {
        fieldObj.name = newColumnName;
      }
      return fieldObj;
    });
    this.props.patchList({
      name: this.props.listData.name,
      listId: listId,
      fieldsmap: newFieldsmap
    });
  }

  _removeColumn(listId, columns, colProp) {
    const {fieldsmap} = this.state;
    const props = this.props;
    const columnValue = columns.find(column => column.data === colProp).data;
    if (columnValue === 'publication_name_1' || columnValue === 'publication_name_2') alertify.alert('Publication fields are special. Cannot be deleted.');
    if (fieldsmap.some(fieldObj => fieldObj.value === columnValue && fieldObj.customfield)) {
      alertify.confirm('Are you sure?', 'Deleting a column is not reversible if the column is custom. Are you sure?', _ => {
        this.table.runHooks('persistentStateReset');
        // const newColumns = columns.filter( (col, i) => i !== colNum );
        const newFieldsmap = fieldsmap.filter(fieldObj => fieldObj.value !== columnValue );
        props.patchList({
          name: props.listData.name,
          listId: listId,
          fieldsmap: newFieldsmap
        }).then(_ => {
          this.table.destroy();
          this.remountTable();
        });
      }, _ => {});
    } else {
      const newFieldsmap = fieldsmap.map(fieldObj => {
        if (fieldObj.value === columnValue && !fieldObj.customfield) {
          return Object.assign({}, fieldObj, {hidden: true});
        }
        return fieldObj;
      });
      props.patchList({
        listId,
        fieldsmap: newFieldsmap,
        name: props.listData.name
      }).then(_ => {
        this.table.destroy();
        this.remountTable();
      });
    }
  }

  _addColumn(newColumnName) {
    const {dispatch, listData } = this.props;
    const { options } = this.state;
    let fieldsmap = listData.fieldsmap;
    if (fieldsmap.some(fieldObj => fieldObj.name === newColumnName && fieldObj.customfield)) {
      alertify.alert(`'${newColumnName}' is a duplicate column name. Please use another one.`);
    } else if (fieldsmap.some(fieldObj=> fieldObj.value === newColumnName && !fieldObj.customfield && !fieldObj.hidden)) {
      alertify.alert(`'${newColumnName}' is a reserved column name. Please use another one.`);
    } else if (fieldsmap.some(fieldObj=> fieldObj.value === newColumnName && !fieldObj.customfield && fieldObj.hidden)) {
      const newFieldsmap = fieldsmap.map(fieldObj => {
        if (fieldObj.value === newColumnName && !fieldObj.customfield && fieldObj.hidden) {
          return Object.assign({}, fieldObj, {hidden: false});
        }
        return fieldObj;
      });
      dispatch(actionCreators.patchList({
        listId: listData.id,
        name: listData.name,
        fieldsmap: newFieldsmap
      }));
      this.setState({fieldsmap: newFieldsmap});
    } else {
      let newFieldsmap = fieldsmap.concat([{
        name: newColumnName,
        value: newColumnName,
        customfield: true,
        hidden: false
      }]);
      dispatch(actionCreators.patchList({
        listId: listData.id,
        name: listData.name,
        fieldsmap: newFieldsmap
      }));
      this.setState({fieldsmap: newFieldsmap});
    }
    this.setState({newColumnName: ''});
  }

  _cleanUpURL(url) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser.origin + parser.pathname;
  }

  _onSaveClick(localData, columns) {
    const {onSaveClick} = this.props;
    const {fieldsmap, dirtyRows} = this.state;
    onSaveClick(localData, columns, fieldsmap, dirtyRows);
    this.setState({dirtyRows: []});
  }

  render() {
    const state = this.state;
    const props = this.props;
    const addColActions = [
      <FlatButton
        label='Cancel'
        primary
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={_ => {
          if (state.selectvalue === null && state.inputvalue.length > 0) this._addColumn(state.inputvalue);
          else if (state.selectvalue !== null) this._addColumn(state.selectvalue);
          this.setState({inputvalue: '', selectvalue: null});
          this.handleClose();
        }}
      />,
    ];

    const menulist = [{name: 'none', value: null}, ...props.listData.fieldsmap.filter(fieldObj => fieldObj.hidden)];
    return (
      <div key={props.listData.id}>
        <div className='row noprint'>
          <div className='hide-for-small-only medium-1 medium-offset-8 large-offset-10 large-1 columns'>
            <div style={{position: 'fixed', top: 100, zIndex: 200}}>
              <RaisedButton
              primary
              label='Save'
              labelStyle={{textTransform: 'none'}}
              onClick={_ => this._onSaveClick(state.options.data, state.options.columns)}
              />
            </div>
            <div style={{position: 'fixed', top: 150, zIndex: 180}}>
              <p style={{fontSize: '0.8em', zIndex: 150}}>{props.lastSavedAt}</p>
            </div>
          </div>
        </div>
        <Dialog
        actions={addColActions}
        title='Add Column'
        open={state.isAddPanelOpen}
        modal
        onRequestClose={this.handleClose}>
          <div>
            <p>Select from hidden Default Fields</p>
            <SelectField value={state.selectvalue} onChange={this.handleSelectChange}>
              {menulist.map((fieldObj, i) => <MenuItem key={i} value={fieldObj.value} primaryText={fieldObj.name} />)}
            </SelectField>
            <p>OR Create Your Own</p>
            <TextField hintText='Column Name' id='text-field-ht' onChange={(e, val) => this.setState({inputvalue: val})} />
          </div>
        </Dialog>
        <span style={{color: 'gray', marginLeft: '15px'}}>Tip: To add row/column, right click to open context menu</span>
        <div ref='data-grid' id={props.listData.id}></div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    // contactIsReceiving: state.contactReducer.isReceiving
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // dispatch: action => dispatch(action),
    // fetchContacts: listId => dispatch(actionCreators.fetchContacts(listId)),
    // patchList: listObj => dispatch(actionCreators.patchList(listObj)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandsOnTable);
