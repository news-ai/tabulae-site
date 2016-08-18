import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import SkyLight from 'react-skylight';
import { Notification } from 'react-notification';
import * as actionCreators from 'actions/AppActions';
import { COLUMNS } from 'constants/ColumnConfigs';
import validator from 'validator';
import { outdatedRenderer, multiselectRenderer } from 'constants/CustomRenderers';
import _ from 'lodash';

import 'handsontable/dist/handsontable.full.css';

const styles = {
  buttons: {
    group: {
      marginLeft: '20px',
      marginRight: '20px',
      marginBottom: '20px',
      marginTop: '30px'
    },
    save: {
      marginLeft: '30px',
      marginRight: '30px'
    }
  },
  columnInput: {
    width: '400px'
  }
};

const skylightStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  dialog: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    padding: '10px',
    zIndex: 1000,
    overflow: 'scroll',
    transform: 'translate(-50%, -50%)'
  }
};

const MIN_ROWS = 20;

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    this._onNewColumnNameChange = e => this.setState({ newColumnName: e.target.value });
    this._addColumn = this._addColumn.bind(this);
    this._removeColumn = this._removeColumn.bind(this);
    this._cleanUpURL = this._cleanUpURL.bind(this);
    this._onPromptChange = e => this.setState({ promptInput: e.target.value });
    this._changeColumnName = this._changeColumnName.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.state = {
      noticeMessage: 'DEFAULT',
      noticeIsActive: false,
      skylightTitle: '',
      promptInput: '',
      skylightButton: null,
      lazyLoadingThreshold: 20,
      lastFetchedIndex: -1,
      fieldsmap: [],
      dirtyRows: [],
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
        columns: COLUMNS,
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
            if (key === 'remove_column') {
              for (let i = options.start.col; i <= options.end.col; i++) {
                this._removeColumn(this.state.options.columns, i);
              }
            }

            if (key === 'change_col_name') {
              if (options.start.col !== options.end.col) {
                console.log('CAN ONLY CHANGE NAME OF ONE COLUMN AT A TIME');
                this.setState({
                  noticeIsActive: true,
                  noticeMessage: 'To change column name, only select one column at a time.'
                });
              } else {
                this.setState({
                  skylightButton: (
                    <button className='button' onClick={ _ =>
                    this._changeColumnName(
                    this.state.options.columns,
                    options.start.col
                    )}>Change column name</button>)
                });
                this.refs.prompt.show();
              }
            }
          },
          items: {
            // row_above: {},
            // row_below: {},
            // remove_row: {},
            undo: {},
            redo: {},
            remove_column: {
              name: 'Remove column',
            },
            change_col_name: {
              name: 'Change column name'
            }
          }
        }
      }
    };
  }


  componentDidMount() {
    this.table = new Handsontable(ReactDOM.findDOMNode(this.refs['data-grid']), this.state.options);
    this.table.updateSettings({
      beforeChange: (changes, source) => {
        for (let i = changes.length - 1; i >= 0; i--) {
          if (changes[i][1] === 'linkedin' && validator.isURL(changes[i][3])) changes[i][3] = this._cleanUpURL(changes[i][3]);
        }
        console.log(changes);
        console.log(source);

        if (!this.props.isNew) {
            // changes[0] = [rowNum, colData, valBeforeChange, valAfterChange]
          this.props.isDirty();
          const rowNum = changes[0][0];
          const rowId = this.state.options.data[rowNum].id;
          const dirtyRows = this.state.dirtyRows;
          if (!dirtyRows.some( rnum => rnum === rowId)) {
            dirtyRows.push(rowId);
            this.setState({ dirtyRows });
          }
        }
      },
      afterChange: (changes, source) => {
        // save selected rows
        if (!this.props.isNew && source === 'edit') {
          const selectedRows = this.state.options.data.filter( row => row.selected );
          this.props._getSelectedRows(selectedRows);
        }
      },
      // afterRemoveRow: (index, amount) => {
      //   console.log('row removed');
      //   console.log(index);
      //   console.log(amount);
      // },
      // afterCreateRow: (index, amount) => {
      //   console.log('row created');
      //   console.log(index);
      //   console.log(amount);
      // },
      afterScrollVertically: (e) => {
        const { lastFetchedIndex, contactIsReceiving, dispatch, listId, listData } = this.props;
        if (lastFetchedIndex === listData.contacts.length - 1) return;
        const rowCount = this.table.countRows();
        const rowOffset = this.table.rowOffset();
        const visibleRows = this.table.countVisibleRows();
        let lastRow = rowOffset + (visibleRows * 1);
        const lastVisibleRow = rowOffset + visibleRows + (visibleRows / 2);
        const threshold = this.state.lazyLoadingThreshold;

        if (lastVisibleRow > (lastFetchedIndex - threshold)) {
          console.log(lastVisibleRow);
          console.log(lastFetchedIndex);
          console.log('FETCH');
          if (!contactIsReceiving) dispatch(actionCreators.fetchContacts(listId));
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isNew) return;
    const { contacts, listData, lastFetchedIndex } = nextProps;
    const options = this.state.options;
    const fieldsmap = listData.fieldsmap;

    fieldsmap.map( fieldObj => {
      if (fieldObj.customfield && !fieldObj.hidden && !options.columns.some( col => col.data === fieldObj.value )) {
        options.columns.push({ data: fieldObj.value, title: fieldObj.name });
        // match contacts customfield name to list column value
        contacts.map( (contact, i) => {
          if (!_.isEmpty(contact.customfields)) {
            if (contact.customfields.some( field => field.name === fieldObj.value)) {
              contacts[i][fieldObj.value] = contact.customfields.find( field => field.name === fieldObj.value ).value;
            }
          }
        });
      }
    });


    if (!_.isEmpty(listData.contacts)) {
      if (lastFetchedIndex - this.state.lastFetchedIndex === 50 || lastFetchedIndex === listData.contacts.length - 1) {
        options.data = contacts;
        options.persistentState = true;
        this.setState({
          options,
          fieldsmap,
          lastFetchedIndex
        });
        this.table.updateSettings(options);
      }
    }
  }

  _changeColumnName(columns, colNum) {
    const { promptInput, options, fieldsmap } = this.state;
    const columnValue = columns[colNum].data;
    const newFieldsmap = fieldsmap.map( fieldObj => {
      if (fieldObj.value === columnValue && fieldObj.customfield) {
        fieldObj.name = promptInput;
      }
      return fieldObj;
    });
    columns[colNum].title = promptInput;
    this.setState({
      columnInput: '',
      fieldsmap: newFieldsmap
    });
    options.columns = columns;
    this.table.updateSettings(options);
    this.refs.prompt.hide();
  }

  _removeColumn(columns, colNum) {
    const { fieldsmap, options } = this.state;
    const columnValue = columns[colNum].data;
    if (fieldsmap.some( fieldObj => fieldObj.value === columnValue && fieldObj.customfield )) {
      const newColumns = columns.filter( (col, i) => i !== colNum );
      const newFieldsmap = fieldsmap.filter( fieldObj => fieldObj.value !== columnValue );
      options.columns = newColumns;
      this.setState({
        options: options,
        fieldsmap: newFieldsmap
      });
      this.table.updateSettings(options);
    } else {
      console.log(columnValue + ' CANNOT BE DELETED');
      this.setState({
        noticeIsActive: true,
        noticeMessage: `Column '${columnValue}' is a default column and, therefore, cannot be deleted.`
      });
    }
  }

  _addColumn() {
    const { isNew, dispatch, listData } = this.props;
    if (isNew) {
      console.log('PLEASE SAVE LIST FIRST');
      this.setState({
        noticeIsActive: true,
        noticeMessage: 'Please save list first before adding custom columns.'
      });
      return;
    }
    const { options, newColumnName, fieldsmap } = this.state;
    if (options.columns.some( col => col.data === newColumnName)) {
      console.log('DUPLICATE COLUMN NAME');
      this.setState({
        noticeIsActive: true,
        noticeMessage: 'Duplicate column name. Please use another one.'
      });
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
    this.setState({ newColumnName: '' });
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
    const { options, skylightTitle, skylightButton } = this.state;
    return (
      <div>
        <div style={styles.buttons.group}>
        <Notification
        isActive={this.state.noticeIsActive}
        message={this.state.noticeMessage}
        action='Dismiss'
        dismissAfter={15000}
        barStyle={{zIndex: 140}}
        activeBarStyle={{zIndex: 140}}
        actionStyle={{zIndex: 140}}
        onDismiss={ _ => this.setState({ noticeIsActive: false, noticeMessage: 'DEFAULT' })}
        onClick={ _ => this.setState({ noticeIsActive: false, noticeMessage: 'DEFAULT' })}
      />
        <SkyLight
        hideOnOverlayClicked
        overlayStyles={skylightStyles.overlay}
        dialogStyles={skylightStyles.dialog}
        ref='prompt'
        title={skylightTitle}
        >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <input type='text' value={this.state.promptInput} onChange={this._onPromptChange} />
            {skylightButton}
          </div>
        </div>
        </SkyLight> 
          <button
          className='button-primary'
          style={styles.buttons.save}
          onClick={ _ => this._onSaveClick(options.data, options.columns)}>Save</button>
          <input style={styles.columnInput} type='text' placeholder='Column name...' value={this.state.newColumnName} onChange={this._onNewColumnNameChange}></input>
          <button className='button' onClick={this._addColumn}>Add Column</button>
        </div>
        <div ref='data-grid'>
        </div>
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
