import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import * as actionCreators from '../../actions/AppActions';
import _ from 'lodash';
import 'isomorphic-fetch';

import 'handsontable/dist/handsontable.full.css';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    const MIN_SPARE_COLS = 7;
    const MIN_SPARE_ROWS = 20;
    // instantiate localData with same data representation as handsontable
    // let localData = _.range(MIN_SPARE_ROWS).map(function() {
    //   return _.range(MIN_SPARE_COLS).map(function() {
    //     return null;
    //   });
    // });

    // const contactIdTable = _.range(MIN_SPARE_ROWS).map( _ => null);

    this._printCurrentData = this._printCurrentData.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.state = {
      options: {
        data: [[]], // instantiate handsontable with empty Array of Array
        colHeaders: [
        'firstname',
        'lastname',
        'email',
        'linkedin',
        'twitter',
        'instagram',
        'contactId'
        ],
        minCols: MIN_SPARE_COLS,
        minRows: MIN_SPARE_ROWS,
        manualColumnMove: true,
        manualRowMove: true,
      }
    };
  }

  componentDidMount() {
    const { dispatch, listId } = this.props;
    dispatch(actionCreators.fetchList(listId));

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
    const { dispatch, listId } = this.props;
    const localData = this.state.options.data;
    const headers = this.state.options.colHeaders;
    let contactList = [];
    localData.map( function(row) {
      let field = {};
      headers.map( (name, i) => {
        if (row[i] !== null) field[name] = row[i];
      });
      if (!_.isEmpty(field)) contactList.push(field);
    });
    console.log(contactList);
    dispatch(actionCreators.addContacts(listId, contactList));

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
