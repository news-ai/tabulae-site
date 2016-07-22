import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import Grid from '../pieces/Grid.react';
import EmailPanel from '../pieces/EmailPanel.react';
import HandsOnTable from '../pieces/HandsOnTable.react';


class HomePage extends Component {
  constructor(props) {
    super(props);
    this._onEmailClick = this._onEmailClick.bind(this);
    this.state = {
      rowData: [
        {firstname: 'Toyota', lastname: 'Celica', email: 35000},
        {firstname: 'Ford', lastname: 'Mondeo', email: 32000},
        {firstname: 'Porsche', lastname: 'Boxter', email: 72000}
      ]
    }
  }

  _onEmailClick(rowData) {

  }

  render() {
        /*<Grid
        onEmailClick={this._onEmailClick}
        rowData={this.state.rowData}
        />*/
    return (
      <div>
        <EmailPanel />
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
