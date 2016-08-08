import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import * as actionCreators from 'actions/AppActions';
import { COLUMNS } from 'constants/COLUMN_CONFIG';

import 'handsontable/dist/handsontable.full.css';

function outdatedRenderer(instance, td, row, col, prop, value, cellProperties) {
  // different default renderer for each row that is not text-only
  if (col === 0) Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
  else Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.backgroundColor = '#CEC';
  return td;
}


class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    this._printCurrentData = this._printCurrentData.bind(this);
    this._onNewColumnNameChange = e => this.setState({ newColumnName: e.target.value });
    this._addColumn = this._addColumn.bind(this);
    this._removeColumn = this._removeColumn.bind(this);
    this._cleanUpURL = this._cleanUpURL.bind(this);

    this.state = {
      customfields: [],
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        rowHeaders: true,
        minCols: COLUMNS.length,
        minRows: 20,
        manualColumnMove: true,
        manualRowMove: true,
        observeChanges: true,
        minSpareRows: 10,
        fixedColumnsLeft: 3,
        columns: COLUMNS,
        cells: (row, col, prop) => {
          // apply different colored renderer for outdated contacts
          const cellProperties = {};
          if (this.state.options.data[row].isoutdated) {
            cellProperties.renderer = outdatedRenderer;
          }
          return cellProperties;
        },
        contextMenu: {
          callback: (key, options) => {
            if (key === 'remove_column') {
              for (let i = options.start.col; i <= options.end.col; i++) {
                this._removeColumn(this.state.options.columns, this.state.customfields, i);
              }
            }
          },
          items: {
            row_above: {},
            row_below: {},
            remove_row: {},
            undo: {},
            redo: {},
            remove_column: {
              name: 'Remove column',
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
      },
      afterChange: (changes, source) => {
        // save selected rows
        if (!this.props.isNew && source === 'edit') {
          const selectedRows = this.state.options.data.filter( row => row.selected );
          this.props._getSelectedRows(selectedRows);
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { contacts, listData } = nextProps;
    const options = this.state.options;
    if (listData.customfields) {
      listData.customfields.map( colName => {
        if (!options.columns.some( existingColName => existingColName.data === colName)) {
          options.columns.push({ data: colName, title: colName });
        }
        // place customfields in options.data obj for table to pick it up
        contacts.map( (contact, i) => {
          if (contact.customfields !== null && contact.customfields.length > 0) {
            if (contact.customfields.some( field => field.name === colName)) {
              contacts[i][colName] = contact.customfields.find( field => field.name === colName ).value;
            }
          }
        });
      });
    }
    options.data = contacts;
    this.setState({ options: options, customfields: listData.customfields });
    this.table.updateSettings(options);
  }

  _printCurrentData() {
    console.log(this.state.options.data);
  }


  _removeColumn(columns, customfields, colNum) {
    const columnName = columns[colNum].data;
    // make sure column being deleted is custom
    if (customfields.some( field => field === columnName )) {
      const newColumns = columns.filter( (col, i) => i !== colNum );
      const newCustomFields = customfields.filter( field => field !== columnName );
      const options = this.state.options;
      options.columns = newColumns;
      this.setState({
        options: options,
        customfields: newCustomFields
      });
      this.table.updateSettings(options);
    } else {
      console.log(columnName + 'CANNOT BE DELETED');
    }
  }

  _addColumn() {
    const { isNew, dispatch, listData } = this.props;
    if (isNew) {
      console.log('PLEASE SAVE LIST FIRST');
      return;
    }
    const options = this.state.options;
    const colName = this.state.newColumnName;

    if (options.columns.some( col => col.data === colName)) {
      console.log('DUPLICATE COLUMN NAME');
    } else {
      let newCustomFields = this.state.customfields;
      if (newCustomFields === null) newCustomFields = [];
      newCustomFields.push(colName);
      dispatch(actionCreators.patchList(listData.id, undefined, undefined, newCustomFields));
    }
    this.setState({ newColumnName: '' });
  }

  _cleanUpURL(url) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser.origin + parser.pathname;
  }

  render() {
    const { _onSaveClick } = this.props;
    return (
      <div>
        <div style={{
          marginLeft: '20px',
          marginRight: '20px',
          marginBottom: '20px',
          marginTop: '30px'
        }}>
          <button style={{marginLeft: '30px', marginRight: '30px'}} onClick={ _ => _onSaveClick(
            this.state.options.data,
            this.state.options.columns,
            this.table,
            this.state.customfields
            )}>Save</button>
          <input style={{width: '400px'}} type='text' placeholder='Column name...' value={this.state.newColumnName} onChange={this._onNewColumnNameChange}></input>
          <button onClick={this._addColumn}>Add Column</button>
        </div>
        <div ref='data-grid'>
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
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
