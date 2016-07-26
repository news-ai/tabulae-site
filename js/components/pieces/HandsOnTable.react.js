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
    const colHeaders = [
      'firstname',
      'lastname',
      'email',
      'linkedin',
      'twitter',
      'instagram',
      'id'
      ];
    // instantiate localData with same data representation as handsontable
    // let localData = _.range(MIN_SPARE_ROWS).map(function() {
    //   return _.range(MIN_SPARE_COLS).map(function() {
    //     return null;
    //   });
    // });

    // const contactIdTable = _.range(MIN_SPARE_ROWS).map( _ => null);

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onInvalid = this._onInvalid.bind(this);

    this.state = {
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        colHeaders: colHeaders,
        rowHeaders: true,
        minCols: colHeaders.length,
        minRows: 20,
        manualColumnMove: true,
        manualRowMove: true,
        minSpareRows: 10,
        fixedColumnsLeft: 2,
        columns: [
        {data: 'firstname'},
        {data: 'lastname'},
        {
          data: 'email',
          validator: (value, callback) => this._onInvalid(value, callback, validator.isEmail),
          allowInvalid: true,
          invalidCellClass: 'invalid-cell'
        },
        {data: 'linkedin'},
        {data: 'twitter'},
        {data: 'instagram'},
        {data: 'id'},
        ]
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

  render() {
    const { _onSaveClick } = this.props;
    return (
      <div>
        <button onClick={ _ => _onSaveClick(this.state.options.data, this.state.options.colHeaders)}>Save</button>
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
