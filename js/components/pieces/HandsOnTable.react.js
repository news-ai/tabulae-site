import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import _ from 'lodash';
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
    ]

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onInvalid = this._onInvalid.bind(this);
    this._onNewColumnNameChange = e => this.setState({ newColumnName: e.target.value });
    this._addColumn = this._addColumn.bind(this);

    this.state = {
      newCustomFields: [],
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

  componentDidUpdate() {
    const { contacts, listData } = this.props;
    // let listCustomfields = listData.customfields;
    const options = this.state.options;
    options.data = contacts;
    this.table.updateSettings(options);
  }

  _printCurrentData() {
    console.log(this.state.options.data);
  }

  _onInvalid(value, callback, validator) {
    if (value.length === 0 || validator(value)) callback(true);
    else callback(false);
  }

  _addColumn() {
    const options = this.state.options;
    const colName = this.state.newColumnName;

    if (options.columns.some( col => col.data === colName)) {
      this.setState({ newColumnName: ''});
    } else {
      const newCustomFields = this.state.newCustomFields.push(colName);
      options.columns.push({
        data: colName,
        title: colName
      });

      this.setState({
        options: options,
        newColumnName: '',
        newCustomFields: newCustomFields
      });
      this.table.render();
    }
  }

  render() {
    const { _onSaveClick } = this.props;
    console.log(this.props.listData);
    return (
      <div>
        <button onClick={ _ => _onSaveClick(
          this.state.options.data,
          this.state.options.columns.map( column => column.data ),
          this.table
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
