import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import _ from 'lodash';

import 'handsontable/dist/handsontable.full.css';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    const MIN_SPARE_COLS = 5;
    const MIN_SPARE_ROWS = 20;
    // instantiate localData with same data representation as handsontable
    let localData = _.range(MIN_SPARE_ROWS).map(function() {
      return _.range(MIN_SPARE_COLS).map(function() {
        return null;
      });
    });

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.state = {
      options: {
        data: localData, // instantiate handsontable with empty Array of Array
        colHeaders: [
        'First Name',
        'Last Name',
        'Email',
        'LinkedIn',
        'Twitter',
        'Instagram'
        ],
        // minSpareCols: MIN_SPARE_COLS,
        // minSpareRows: MIN_SPARE_ROWS,
        manualColumnMove: true,
        manualRowMove: true,
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
    this.table.updateSettings(this.state.options);
  }

  _printCurrentData() {
    console.log(this.state.options.data);
  }

  _onSaveClick() {
    console.log('ey');

  }

  render() {
    return (
      <div>
        <button onClick={this._onSaveClick}>Save</button>
        <div ref='data-grid'>
        </div>
      </div>
      );
  }
}

const mapStateToProps = state => {
    return {};
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
