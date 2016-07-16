import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import SpreadsheetComponent from 'react-spreadsheet-component';

class HomePage extends Component {
  constructor(props) {
    super();
    this.state = {
      data : {
        rows: [
          ['Customer', 'Job', 'Contact', 'City', 'Revenue'],
          ['iDiscovery', 'Build', 'John Doe', 'Boston, MA', '500,000'],
          ['SxSW', 'Build', 'Tom Fuller', 'San Francisco, CA', '600,000'],
          ['CapitalTwo', 'Failed', 'Eric Pixel', 'Seattle, WA', '450,000']
        ]
      },
      cellClasses: {
        rows: [
          ['', '', '', '', '', '', '', ''],
          ['green', '', '', '', '', '', '', 'dollar'],
          ['purple', '', '', '', '', '', '', 'dollar'],
          ['yellow', 'failed', '', '', '', '', '', 'dollar'],
        ]
      },
      config: {
        rows: 5,
        columns: 5,
        headColumn: true,
        headColumnIsString: true,
        headRow: true,
        headRowIsString: true,
        canAddRow: false,
        canAddColumn: false,
        emptyValueSymbol: '-',
        letterNumberHeads: false
      }
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
        <div>
        HELLO HOMEPAGE
        <SpreadsheetComponent initialData={this.state.data} config={this.state.config} cellClasses={this.state.cellClasses} spreadsheetId="1" />
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
