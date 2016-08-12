import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from 'actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';
import _ from 'lodash';
import 'isomorphic-fetch';

const styles {
  icon: {
    color: 'lightgray',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  }
};

class NewTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    };
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onNameChange = e => this.setState({ name: e.target.value });
  }

  componentDidMount() {
  }

  _onSaveClick(localData, colHeaders) {
    const { dispatch, listId } = this.props;

    let addContactList = [];
    localData.map( function(row) {
      let field = {};
      colHeaders.map( (header) => {
        const name = header.data;
        if (row[name] !== null && row[name]) if (row[name].length !== 0) field[name] = row[name];
      });

      // filter out for empty rows with only id
      if (!_.isEmpty(field) && colHeaders.some(header => header.pass && !_.isEmpty(field[header.data]))) {
        addContactList.push(field);
      }
    });
    let name = this.state.name || 'untitled';
    dispatch(actionCreators.createNewSheet(name, addContactList));
  }

  render() {
    return (
      <div>
        <div className='three columns' style={{marginLeft: '20px'}}>
          <input
          type='text'
          className='u-full-width'
          onChange={this._onNameChange}
          placeholder='list name'
          value={this.state.name}></input>
        </div>
        <HandsOnTable
        _onSaveClick={this._onSaveClick}
        isNew={true}
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