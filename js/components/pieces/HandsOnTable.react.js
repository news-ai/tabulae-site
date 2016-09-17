import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full.min';
import alertify from 'alertifyjs';
import * as actionCreators from 'actions/AppActions';
import { COLUMNS } from 'constants/ColumnConfigs';
import validator from 'validator';
import { outdatedRenderer, hightlightRenderer } from 'constants/CustomRenderers';
import _ from 'lodash';
import { fromJS, List } from 'immutable';
import RaisedButton from 'material-ui/RaisedButton';

import 'node_modules/handsontable/dist/handsontable.full.min.css';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const MIN_ROWS = 20;
alertify.defaults.glossary.title = '';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    this._addColumn = this._addColumn.bind(this);
    this._removeColumn = this._removeColumn.bind(this);
    this._changeColumnName = this._changeColumnName.bind(this);
    this._cleanUpURL = this._cleanUpURL.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.loadTable = this._loadTable.bind(this);
    if (!COLUMNS.some( col => col.data === 'publication_name_1')) {
      COLUMNS.push({
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
    if (!COLUMNS.some( col => col.data === 'publication_name_2')) {
      COLUMNS.push({
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
      addedRow: false,
      update: false,
      lazyLoadingThreshold: 50,
      lastFetchedIndex: -1,
      fieldsmap: [],
      immutableFieldmap: fromJS([]),
      dirtyRows: [],
      preservedColumns: COLUMNS,
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        rowHeaders: true,
        sortIndicator: true,
        minCols: COLUMNS.length,
        minRows: MIN_ROWS,
        manualColumnMove: true,
        manualRowMove: true,
        manualColumnResize: true,
        manualRowResize: true,
        persistentState: true,
        minSpareRows: 10,
        observeChanges: true,
        columns: _.cloneDeep(COLUMNS),
        cells: (row, col, prop) => {
          const cellProperties = {};
          // default to highlightable renderer when selected
          cellProperties.renderer = hightlightRenderer;
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
          if (!this.props.isNew && source === 'edit') {
            const selectedRows = this.state.options.data.filter(row => row.selected);
            this.props._getSelectedRows(selectedRows);
          }
        },
        afterScrollVertically: e => {
          const { lastFetchedIndex, contactIsReceiving, fetchContacts, listId, listData } = this.props;
          if (_.isEmpty(listData.contacts)) return;
          if (listData.contacts.length < 150) return;
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
                const newListContacts = props.listData.contacts;
                newListContacts.splice(index, 0, contacts[0].id);
                this.setState({addedRow: true});
                props.patchList({
                  listId: props.listData.id,
                  contacts: newListContacts,
                  name: props.name,
                  fieldsmap: this.state.fieldsmap
                });
              });
            }

            if (key === 'insert_row_below') {
              const index = options.start.row;
              props.addContacts([{}])
              .then( contacts => {
                const newListContacts = props.listData.contacts;
                newListContacts.splice(index + 1, 0, contacts[0].id);
                this.setState({addedRow: true});
                props.patchList({
                  listId: props.listId,
                  contacts: newListContacts,
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
              alertify.prompt(
                `Add Column`,
                `What is the new column name?`,
                '',
                (e, value) => this._addColumn(value),
                _ => alertify.error('Cancel')
                );
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
  }

  componentDidMount() {
    const options = this.state.options;
    this.table = new Handsontable(ReactDOM.findDOMNode(this.refs['data-grid']), options);
  }

  componentWillReceiveProps(nextProps) {
    const { contacts, listData, lastFetchedIndex, isSearchOn } = nextProps;
    this.loadTable(contacts, listData, lastFetchedIndex, isSearchOn);
  }

  componentWillUnmount() {
    // console.log(this.state.fieldsmap);
    // console.log(this.props.contacts);
    // this.table.runHooks('persistentStateSave', 'fieldsmap', this.state.fieldsmap);
    // this.table.runHooks('persistentStateSave', 'contacts', this.props.contacts);
    console.log('DESTROY');
    this.table.destroy();
  }

  _loadTable(contacts, listData, lastFetchedIndex, isSearchOn) {
    const options = this.state.options;
    const fieldsmap = listData.fieldsmap;
    const immutableFieldmap = fromJS(listData.fieldsmap);

    if (!_.isEmpty(listData.contacts)) {
      if (!immutableFieldmap.equals(this.state.immutableFieldmap)) {
        let columns = _.cloneDeep(this.state.preservedColumns);
        fieldsmap.map( fieldObj => {
          if (fieldObj.customfield && !fieldObj.hidden) columns.push({data: fieldObj.value, title: fieldObj.name});
        });
        options.columns = columns;
        if (this.table) this.table.updateSettings(options);
      }

      if (this.state.lastFetchedIndex === -1) {
        options.minRows = listData.contacts.length + 5;
        this.setState({options});
        if (this.table) this.table.updateSettings(options);
      }

      // load every 50 contacts to avoid slow UI
      if (
        lastFetchedIndex - this.state.lastFetchedIndex === 150 ||
        listData.contacts.length <= 150 ||
        lastFetchedIndex === listData.contacts.length - 1 ||
        this.state.addedRow ||
        this.props.isSearchOn !== isSearchOn
        ) {
        options.data = contacts;
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
      listId: listId,
      fieldsmap: newFieldsmap
    });
  }

  _removeColumn(listId, columns, colProp) {
    const { fieldsmap } = this.state;
    const columnValue = columns.find(column => column.data === colProp).data;
    if (fieldsmap.some( fieldObj => fieldObj.value === columnValue && fieldObj.customfield )) {
      this.table.runHooks('persistentStateReset');
      // const newColumns = columns.filter( (col, i) => i !== colNum );
      const newFieldsmap = fieldsmap.filter(fieldObj => fieldObj.value !== columnValue );
      this.props.patchList({
        listId: listId,
        fieldsmap: newFieldsmap
      }).then(_ => {
        this.table.destroy();
        this._loadTable();
      });
    } else {
      alertify.alert(`Column '${columnValue}' is a default column and cannot be deleted.`);
    }
  }

  _addColumn(newColumnName) {
    const { isNew, dispatch, listData } = this.props;
    if (isNew) {
      alertify.alert(`Please save list first before adding custom columns.`);
      return;
    }
    const { options } = this.state;
    if (options.columns.some( col => col.data === newColumnName)) {
      alertify.alert(`'${newColumnName}' is a duplicate column name. Please use another one.`);
    } else {
      let fieldsmap = listData.fieldsmap;
      let newFieldsmap = fieldsmap.concat([{
        name: newColumnName,
        value: newColumnName,
        customfield: true,
        hidden: false
      }]);
      dispatch(actionCreators.patchList({
        listId: listData.id,
        fieldsmap: newFieldsmap
      }));
    }
    this.setState({newColumnName: ''});
  }

  _cleanUpURL(url) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser.origin + parser.pathname;
  }

  _onSaveClick(localData, columns) {
    const { onSaveClick } = this.props;
    const { fieldsmap, dirtyRows } = this.state;
    onSaveClick(localData, columns, fieldsmap, dirtyRows);
    this.setState({ dirtyRows: [] });
  }

  render() {
    const { options } = this.state;
    const props = this.props;
    return (
      <div key={props.listData.id}>
        <div className='row'>
          <div className='hide-for-small-only medium-1 medium-offset-8 large-offset-10 large-1 columns'>
            <div style={{position: 'fixed', top: 100, zIndex: 200}}>
              <RaisedButton
              primary
              label='Save'
              labelStyle={{textTransform: 'none'}}
              onClick={ _ => this._onSaveClick(options.data, options.columns)}
              />
            </div>
            <div style={{position: 'fixed', top: 150, zIndex: 180}}>
              <p style={{fontSize: '0.8em', zIndex: 150}}>{props.lastSavedAt}</p>
            </div>
          </div>
        </div>
        <span style={{color: 'gray', marginLeft: '15px'}}>Tip: To add row/column, right click to open context menu</span>
        <div ref='data-grid' className='handsontable' id={props.listData.id}></div>
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
