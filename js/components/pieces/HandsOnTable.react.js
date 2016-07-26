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
          data: 'id'
        },
    ]

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onInvalid = this._onInvalid.bind(this);
    this._onNewColumnNameChange = e => this.setState({ newColumnName: e.target.value });
    this._addColumn = this._addColumn.bind(this);

    this.state = {
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
    const { ...options } = nextProps;
    this.setState({ options: Object.assign(this.state.options, options) });
  }

  componentDidUpdate() {
    let options = this.state.options;
    const newRowData = this.props.contacts;
    options.data = this.props.contacts;
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
    let options = this.state.options;
    options.columns.push({
      data: this.state.newColumnName,
      title: this.state.newColumnName
    });
    this.setState({
      options: options,
      newColumnName: ''
    });
    this.table.render();

  }

  render() {
    const { _onSaveClick } = this.props;
    return (
      <div>
        <button onClick={ _ => _onSaveClick(this.state.options.data, this.state.options.columns.map( column => column.data ))}>Save</button>
        <input type='text' placeholder='Column name...' onChange={this._onNewColumnNameChange}></input>
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
