import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import _ from 'lodash';
import 'isomorphic-fetch';

class Table extends Component {
  constructor(props) {
    super(props);
    this._onEmailClick = this._onEmailClick.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    const { dispatch, listId } = this.props;
    dispatch(actionCreators.fetchList(listId));
    // dispatch(actionCreators.fetchLists());

  }

  _onEmailClick(rowData) {

  }

  _onSaveClick(localData, colHeaders) {
    const { dispatch, listId } = this.props;
    let contactList = [];
    localData.map( function(row) {
      let field = {};
      colHeaders.map( (name, i) => {
        if (row[i] !== null) field[name] = row[i];
      });
      if (!_.isEmpty(field)) contactList.push(field);
    });
    console.log(contactList);
    dispatch(actionCreators.addContacts(listId, contactList));
  }

  render() {
    const { listId, listData } = this.props;
    return (
      <div>
        <EmailPanel />
        <HandsOnTable
        listId={this.props.listId}
        _onSaveClick={this._onSaveClick}
        listData={listData}
        />
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  const isReceiving = state.listReducer.isReceiving;
  return {
    listId: listId,
    isReceiving: isReceiving,
    listData: state.listReducer[listId]
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Table);