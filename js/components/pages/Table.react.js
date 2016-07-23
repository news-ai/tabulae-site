import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';

class Table extends Component {
  constructor(props) {
    super(props);
    this._onEmailClick = this._onEmailClick.bind(this);
    this.state = {
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch(actionCreators.fetchLists());

  }

  _onEmailClick(rowData) {

  }

  render() {
    return (
      <div>
        <EmailPanel />
        <HandsOnTable />
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.params.listId, 10);
  return {
    listId: listId
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