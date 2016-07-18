import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import ReactDataGrid from 'react-data-grid';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-root/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/theme-fresh.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
    this._addColumn = this._addColumn.bind(this);
    this._renderHeaderCell = this._renderHeaderCell.bind(this);
    this.state = {
      columnDefs: [
        {
          headerName: 'Make',
          field: 'make',
          editable: true,
          headerCellTemplate: this._renderHeaderCell
        },
        {headerName: 'Model', field: 'model', editable: true},
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

  _renderHeaderCell(params) {
    console.log(params);
    const header = document.createElement('div');

    //
    const agResizeBar = document.createElement('div');
    agResizeBar.classname = 'ag-header-cell-resize';

    //
    const agMenu = document.createElement('span');
    agMenu.classname = 'ag-header-icon ag-header-cell-menu-button';

    //
    const agHeaderCellLabel = document.createElement('div');
    agHeaderCellLabel.classname = 'ag-header-cell-label';
    agHeaderCellLabel.id = 'agHeaderCellLabel';

    const agSortAsc = document.createElement('span');
    agSortAsc.id = 'agSortAsc';
    const agSortDesc = document.createElement('span');
    agSortDesc.id = 'agSortDesc';
    const agNoSort = document.createElement('span');
    agNoSort.id = 'agNoSort';
    const agFilter = document.createElement('span');
    agFilter.id = 'agFilter';
    const agText = document.createElement('span');
    agText.id = 'agText';

    agHeaderCellLabel.appendChild(agSortAsc);
    agHeaderCellLabel.appendChild(agSortDesc);
    agHeaderCellLabel.appendChild(agNoSort);
    agHeaderCellLabel.appendChild(agFilter);
    agHeaderCellLabel.appendChild(agText);

    //
    header.appendChild(agResizeBar);
    header.appendChild(agMenu);
    header.appendChild(agHeaderCellLabel);
    
    return header
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

  _addColumn() {
    let columns = this.state.columnDefs.concat({ headerName: 'Wha', field: 'whaaaaa'});
    this.setState({ columnDefs: columns });
  }

  render() {
    return (
      <div>
        <button onClick={this._addColumn}>Add Column</button>
        <button onClick={(e) => this.api.deselectAll()}>Deselect All</button>
        <div className='ag-fresh'>
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
            rowHeight='25'
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
