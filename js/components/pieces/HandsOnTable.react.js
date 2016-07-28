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
        columns: COLUMNS
      }
    };
  }


  componentDidMount() {
    this.table = new Handsontable(ReactDOM.findDOMNode(this.refs['data-grid']), this.state.options);
    this.table.updateSettings({
      afterChange: (changes, source) => {
        if (source === 'edit') this._printCurrentData();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { contacts, listData } = nextProps;
    // let listCustomfields = listData.customfields;
    console.log(contacts);
    const options = this.state.options;
    if (listData.customfields) {
      listData.customfields.map( colName => {
        if (!options.columns.some( existingColName => existingColName.data === colName)) {
          options.columns.push({ data: colName, title: colName });
        }
        contacts.map( (contact, i) => contacts[i][colName] = (contact.customfields !== null && contact.customfields.length > 0) ? contact.customfields.find( field => field.name === colName ).value : null);
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

  render() {
    console.log(this.state.customfields);
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
