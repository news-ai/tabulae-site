import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'node_modules/handsontable/dist/handsontable.full.min';
import alertify from 'alertifyjs';
import * as actionCreators from 'actions/AppActions';
import { COLUMNS } from 'constants/ColumnConfigs';
import validator from 'validator';
import { outdatedRenderer, multiselectRenderer } from 'constants/CustomRenderers';
import _ from 'lodash';
import { fromJS, List } from 'immutable';
import RaisedButton from 'material-ui/RaisedButton';

import 'node_modules/handsontable/dist/handsontable.full.min.css';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const styles = {
  buttons: {
    group: {
      marginBottom: '20px',
      marginTop: '30px',
    },
  },
};

const center = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const MIN_ROWS = 20;
alertify.defaults.glossary.title = '';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    const {dispatch} = this.props;
    this._addColumn = this._addColumn.bind(this);
    this._removeColumn = this._removeColumn.bind(this);
    this._changeColumnName = this._changeColumnName.bind(this);
    this._cleanUpURL = this._cleanUpURL.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    if (!COLUMNS.some( col => col.data === 'publication_name_1')) {
      COLUMNS.push({
        data: 'publication_name_1',
        type: 'autocomplete',
        title: 'Publication 1',
        source: (query, callback) => {
          dispatch(actionCreators.searchPublications(query))
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
          dispatch(actionCreators.searchPublications(query))
          .then(publicationNameArray => callback(publicationNameArray));
          // callback([]);
        },
        strict: false
      });
    }
    this.state = {
      addedRow: false,
      update: false,
      lazyLoadingThreshold: 20,
      lastFetchedIndex: -1,
      fieldsmap: [],
      immutableFieldmap: fromJS([]),
      dirtyRows: [],
      preservedColumns: COLUMNS,
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        rowHeaders: true,
        minCols: COLUMNS.length,
        minRows: MIN_ROWS,
        manualColumnMove: true,
        manualRowMove: true,
        manualColumnResize: true,
        manualRowResize: true,
        observeChanges: true,
        persistentState: true,
        // colWidths: 200,
        // wordWrap: false,
        rowHeights: 23,
        minSpareRows: 10,
        // fixedColumnsLeft: 3,
        columns: _.cloneDeep(COLUMNS),
        cells: (row, col, prop) => {
          const cellProperties = {};
          if (this.state.options.data[row]) {
            if (this.state.options.data[row].isoutdated) {
              // apply different colored renderer for outdated contacts
              cellProperties.renderer = outdatedRenderer;
            }
          }
          return cellProperties;
        },
        contextMenu: {
          callback: (key, options) => {
            const {listData} = this.props;
            if (key === 'insert_row_above') {
              const index = options.start.row;
              dispatch(actionCreators.addContacts([{ }]))
              .then( contacts => {
                const newListContacts = listData.contacts;
                newListContacts.splice(index, 0, contacts[0].id);
                this.setState({addedRow: true});
                dispatch(actionCreators.patchList({
                  listId: listData.id,
                  contacts: newListContacts,
                  name: listData.name,
                  fieldsmap: this.state.fieldsmap
                }));
              });
            }

            if (key === 'insert_row_below') {
              const index = options.start.row;
              dispatch(actionCreators.addContacts([{}]))
              .then( contacts => {
                const newListContacts = listData.contacts;
                newListContacts.splice(index + 1, 0, contacts[0].id);
                this.setState({addedRow: true});
                dispatch(actionCreators.patchList({
                  listId: listData.id,
                  contacts: newListContacts,
                  name: listData.name,
                  fieldsmap: this.state.fieldsmap
                }));
              });
            }

            if (key === 'remove_selected_rows') {
              const low = options.start.row <= options.end.row ? options.start.row : options.end.row;
              const hi = low === options.start.row ? options.end.row : options.end.row;
              const removeIdList = this.state.options.data.filter( (row, i) => low <= i && i <= hi ).map(row => row.id);
              const newListContacts = _.difference(listData.contacts, removeIdList);
              dispatch(actionCreators.patchList({
                listId: listData.id,
                contacts: newListContacts,
                name: listData.name,
                fieldsmap: this.state.fieldsmap
              }));
              this.setState({addedRow: true, lastFetchedIndex: this.state.lastFetchedIndex - (hi - low + 1)});
            }

            if (key === 'remove_column') {
              for (let i = options.start.col; i <= options.end.col; i++) {
                this._removeColumn(listData.id, this.state.options.columns, i);
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
                (e, value) => this._changeColumnName(listData.id, this.state.options.columns, options.start.col, value),
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
            undo: {},
            redo: {},
            remove_column: {
              name: 'Remove Column',
            },
            change_col_name: {
              name: 'Change Column Name'
            },
            add_column: {
              name: 'Add Column'
            }
          }
        }
      }
    };
  }

  componentDidMount() {
    this.table = new Handsontable(ReactDOM.findDOMNode(this.refs['data-grid']), this.state.options);
    const options = {
      beforeChange: (changes, source) => {
        for (let i = changes.length - 1; i >= 0; i--) {
          if (changes[i][1] === 'linkedin' && validator.isURL(changes[i][3])) changes[i][3] = this._cleanUpURL(changes[i][3]);
        }

        if (!this.props.isNew) {
          // changes[0] = [rowNum, colData, valBeforeChange, valAfterChange]
          this.props.isDirty();

          if (_.isEmpty(this.props.listData.contacts)) return;
          let rowNum;
          let rowId;
          const dirtyRows = this.state.dirtyRows;
          changes.map( change => {
            rowNum = change[0];
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
        }
      },
      afterChange: (changes, source) => {
        // save selected rows
        if (!this.props.isNew && source === 'edit') {
          const selectedRows = this.state.options.data.filter(row => row.selected);
          this.props._getSelectedRows(selectedRows);
        }
      },
      afterScrollVertically: e => {
        const { lastFetchedIndex, contactIsReceiving, dispatch, listId, listData } = this.props;
        if (_.isEmpty(listData.contacts)) return;
        if (listData.contacts.length < 50) return;
        if (lastFetchedIndex === listData.contacts.length - 1) return;
        const rowCount = this.table.countRows();
        const rowOffset = this.table.rowOffset();
        const visibleRows = this.table.countVisibleRows();
        let lastRow = rowOffset + (visibleRows * 1);
        const lastVisibleRow = rowOffset + visibleRows + (visibleRows / 2);
        const threshold = this.state.lazyLoadingThreshold;

        if (lastVisibleRow > (lastFetchedIndex - threshold)) {
          if (!contactIsReceiving) dispatch(actionCreators.fetchContacts(listId));
        }
      }
    };
    this.table.updateSettings(options);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isNew) return;
    const { contacts, listData, lastFetchedIndex } = nextProps;
    const options = this.state.options;
    const fieldsmap = listData.fieldsmap;
    const immutableFieldmap = fromJS(listData.fieldsmap);

    if (!_.isEmpty(listData.contacts)) {
      if (!immutableFieldmap.equals(this.state.immutableFieldmap)) {
        let columns = _.cloneDeep(this.state.preservedColumns);
        fieldsmap.map( fieldObj => {
          if (fieldObj.customfield && !fieldObj.hidden) columns.push({ data: fieldObj.value, title: fieldObj.name });
        });
        options.columns = columns;
        this.setState({ immutableFieldmap });
        this.table.updateSettings(options);
      }

      if (this.state.lastFetchedIndex === -1) {
        options.minRows = listData.contacts.length + 5;
        this.setState({ options });
        this.table.updateSettings(options);
      }

      if (lastFetchedIndex - this.state.lastFetchedIndex === 50 || listData.contacts.length <= 50 || lastFetchedIndex === listData.contacts.length - 1 || this.state.addedRow) {
        fieldsmap.map( fieldObj => {
          if (fieldObj.customfield && !fieldObj.hidden) {
            contacts.map( (contact, i) => {
              if (!_.isEmpty(contact.customfields)) {
                if (contact.customfields.some( field => field.name === fieldObj.value)) {
                  contacts[i][fieldObj.value] = contact.customfields.find( field => field.name === fieldObj.value ).value;
                }
              }
            });
          }
        });
        options.data = contacts;
        this.setState({
          options,
          fieldsmap,
          lastFetchedIndex,
          addedRow: false
        });
        this.table.updateSettings(options);
      }
    }
  }

  _changeColumnName(listId, columns, colNum, newColumnName) {
    const {fieldsmap} = this.state;
    const {dispatch} = this.props;
    const columnValue = columns[colNum].data;
    const newFieldsmap = fieldsmap.map( fieldObj => {
      if (fieldObj.value === columnValue && fieldObj.customfield) {
        fieldObj.name = newColumnName;
      }
      return fieldObj;
    });
    dispatch(actionCreators.patchList({
      listId: listId,
      fieldsmap: newFieldsmap
    }));
  }

  _removeColumn(listId, columns, colNum) {
    const { fieldsmap, options } = this.state;
    const { dispatch } = this.props;
    const columnValue = columns[colNum].data;
    if (fieldsmap.some( fieldObj => fieldObj.value === columnValue && fieldObj.customfield )) {
      // const newColumns = columns.filter( (col, i) => i !== colNum );
      const newFieldsmap = fieldsmap.filter( fieldObj => fieldObj.value !== columnValue );
      dispatch(actionCreators.patchList({
        listId: listId,
        fieldsmap: newFieldsmap
      }));
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
    const { options, fieldsmap } = this.state;
    if (options.columns.some( col => col.data === newColumnName)) {
      alertify.alert(`'${newColumnName}' is a duplicate column name. Please use another one.`);
    } else {
      let newFieldsmap = fieldsmap;
      newFieldsmap.push({
        name: newColumnName,
        value: newColumnName,
        customfield: true,
        hidden: false
      });
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
    return (
      <div>
        <div className='row' style={styles.buttons.group}>
          <div className='offset-by-ten two columns'>
            <div style={{position: 'fixed', top: 100, zIndex: 200}}>
              <RaisedButton
              primary
              label='Save'
              labelStyle={{textTransform: 'none'}}
              onClick={ _ => this._onSaveClick(options.data, options.columns)}
              />
              <p style={{fontSize: '0.8em'}}>{this.props.lastSavedAt}</p>
            </div>
          </div>
        </div>
        <span style={{color: 'gray', marginLeft: '5px'}}>Tip: To add row/column, right click to open context menu</span>
        <div ref='data-grid'></div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    contactIsReceiving: state.contactReducer.isReceiving
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandsOnTable);
