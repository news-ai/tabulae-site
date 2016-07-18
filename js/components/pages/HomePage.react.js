import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import ReactDataGrid from 'react-data-grid';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-root/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/theme-bootstrap.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
    this.addColumn = this.addColumn.bind(this);
    this.state = {
      columnDefs: [
        {headerName: 'Make', field: 'make', editable: true},
        {headerName: 'Model', field: 'model'},
        {headerName: 'Price', field: 'price'}
      ],
      rowData: [
        {make: 'Toyota', model: 'Celica', price: 35000},
        {make: 'Ford', model: 'Mondeo', price: 32000},
        {make: 'Porsche', model: 'Boxter', price: 72000}
      ]
    }
    this.gridOptions = {
      // this is how you listen for events using gridOptions
      onModelUpdated: function() {
          console.log('event onModelUpdated received');
      },
      // this is a simple property
      rowBuffer: 10 // no need to set this, the default is fine for almost all scenarios
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }
  // in onGridReady, store the api for later use
  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  addColumn() {
    let columns = this.state.columnDefs.concat({ headerName: 'Wha', field: 'whaaaaa'});
    this.setState({ columnDefs: columns });
  }

  render() {
    return (
      <div>
        <button onClick={this.addColumn}>Add Column</button>
        <div className='ag-bootstrap'>
          <AgGridReact
            // listening for events
            onGridReady={this.onGridReady.bind(this)}
            
            // binding to array properties
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}

            // no binding, just providing harde coded strings for the properties
            rowSelection='multiple'
            enableColResize='true'
            enableSorting='true'
            enableFilter='true'
            groupHeaders='true'
            rowHeight='43'
            debug='true'
          />
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
  mapDispatchToProps,
)(HomePage);
