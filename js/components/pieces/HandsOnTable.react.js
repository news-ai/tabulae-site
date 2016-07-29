import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import * as actionCreators from '../../actions/AppActions';
import validator from 'validator';

import 'handsontable/dist/handsontable.full.css';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    const COLUMNS = [
      {
        data: 'selected',
        title: 'Selected',
        type: 'checkbox'
      },
      {
        data: 'firstname',
        title: 'First Name'
      },
      {
        data: 'lastname',
        title: 'Last Name'
      },
      {
        data: 'email',
        title: 'Email',
        validator: (value, callback) => this._onInvalid(value, callback, validator.isEmail),
        allowInvalid: true,
        invalidCellClass: 'invalid-cell'
      },
      {
        data: 'linkedin',
        title: 'LinkedIn',
        validator: (value, callback) => this._onInvalid(value, callback, validator.isURL),
        allowInvalid: true,
        invalidCellClass: 'invalid-cell'
      },
      {
        data: 'twitter',
        title: 'Twitter'
      },
      {
        data: 'instagram',
        title: 'Instagram'
      },
      {
        data: 'id',
        title: 'ID'
      },
    ];

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onInvalid = this._onInvalid.bind(this);
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
        minSpareRows: 10,
        fixedColumnsLeft: 2,
        columns: COLUMNS,
        contextMenu: {
          callback: (key, options) => {
            if (key === 'remove_column') {
              console.log(key);
              console.log(options);
              for (let i = options.start.col; i <= options.end.col ; i++) {
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
        // if (source === 'edit') this._printCurrentData();
        for (let i = changes.length - 1; i >= 0; i--) {
          if (changes[i][1] === 'linkedin' && validator.isURL(changes[i][3])) changes[i][3] = this._cleanUpURL(changes[i][3]);
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { contacts, listData } = nextProps;
    // let listCustomfields = listData.customfields;
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

  _onInvalid(value, callback, validate) {
    if (value.length === 0 || validate(value)) callback(true);
    else callback(false);
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

      const newCustomFields = this.state.customfields;
      newCustomFields.push(colName);
      dispatch(actionCreators.patchList(listData.id, undefined, undefined, newCustomFields));
    }
    this.setState({ newColumnName: ''});
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
        <button onClick={ _ => _onSaveClick(
          this.state.options.data,
          this.state.options.columns.map( column => column.data ),
          this.table,
          this.state.customfields
          )}>Save</button>
        <input type='text' placeholder='Column name...' value={this.state.newColumnName} onChange={this._onNewColumnNameChange}></input>
        <button onClick={this._addColumn}>Add Column</button>
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
