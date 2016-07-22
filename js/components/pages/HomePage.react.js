import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';


class HomePage extends Component {
  constructor(props) {
    super(props);
    this._onEmailClick = this._onEmailClick.bind(this);
    this.state = {
    }
  }

  _onEmailClick(rowData) {

  }

  render() {
    return (
      <div>
        <EmailPanel />
        <button>Save</button>
        <HandsOnTable />
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
  mapDispatchToProps,
)(HomePage);
