import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import _ from 'lodash';
import 'isomorphic-fetch';

class NewTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'untitled'
    };
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onNameChange = e => this.setState({ name: e.target.value });
  }

  componentDidMount() {
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
    dispatch(actionCreators.createNewSheet(this.state.name, contactList));
  }

  render() {
    return (
      <div>
        <span>List Name: </span><input type='text' onChange={this._onNameChange} value={this.state.name}></input>
        <HandsOnTable
        _onSaveClick={this._onSaveClick}
        />
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
  mapDispatchToProps,
)(NewTable);