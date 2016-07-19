import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import ReactDataGrid from 'react-data-grid';
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';

import 'ag-grid-root/dist/styles/ag-grid.css';
import 'ag-grid-root/dist/styles/theme-fresh.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
    this._addColumn = this._addColumn.bind(this);
    this._deleteColumn = this._deleteColumn.bind(this);
    this._renderHeaderCell = this._renderHeaderCell.bind(this);
    this._onAddColumnNameChange = this._onAddColumnNameChange.bind(this);
    this._addRow = this._addRow.bind(this);
    this._exportToCsv = this._exportToCsv.bind(this);
    this._printSelected = this._printSelected.bind(this);
    this._deleteSelected = this._deleteSelected.bind(this);
    this.state = {
      newColumnName: '',
      columnDefs: [
        {headerName: 'First Name', field: 'firstname', editable: true, checkboxSelection: true},
        {headerName: 'Last Name', field: 'lastname', editable: true},
        {headerName: 'Email', field: 'email', editable: true},
        {headerName: 'Position', field: 'Position', editable: true}
      ],
      rowData: [
        {firstname: 'Toyota', lastname: 'Celica', email: 35000},
        {firstname: 'Ford', lastname: 'Mondeo', email: 32000},
        {firstname: 'Porsche', lastname: 'Boxter', email: 72000}
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
  
  // in onGridReady, store the api for later use
  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  _renderHeaderCell(params) {
    console.log(params);
    const header = document.createElement('span');
    const title = document.createTextNode(params.column.colDef.headerName);
    const deleteBtn = document.createElement('div');
    deleteBtn.style.width = '5px';
    deleteBtn.style.height = '5px';
    deleteBtn.style.backgroundColor = 'red';
    header.appendChild(title);
    deleteBtn.addEventListener('click', () => this._deleteColumn(params.column.colDef.headerName));
    header.appendChild(deleteBtn);
    
    return header
  }

  _deleteColumn(delColName) {
    let columns = this.state.columnDefs.filter( col => col.headerName !== delColName)
    this.setState({ columnDefs: columns });
  }


  _addColumn() {
    // column name already exists
    const newColumnName = this.state.newColumnName;
    if (this.state.columnDefs.some( col => col.headerName === newColumnName || newColumnName.length === 0)) {
      console.log('dupe');
      return;
    }
    let columns = this.state.columnDefs.concat({
      headerName: newColumnName,
      field: newColumnName,
      editable: true,
      headerCellTemplate: this._renderHeaderCell
    });
    this.setState({
      columnDefs: columns,
      newColumnName: ''
    });
  }

  _onAddColumnNameChange(e) { this.setState({ newColumnName: e.target.value }); }

  _addRow() {
      rowData: [
        {firstname: 'Toyota', lastname: 'Celica', email: 35000},
        {firstname: 'Ford', lastname: 'Mondeo', email: 32000},
        {firstname: 'Porsche', lastname: 'Boxter', email: 72000}
      ]
    let rows = this.state.rowData.concat({});
    this.setState({rowData: rows});
  }

  _exportToCsv() {
    this.api.exportDataAsCsv();
  }

  _printSelected() {
    console.log(this.api.getSelectedRows());
  }

  _deleteSelected() {
    const selected = this.api.getSelectedRows();
    const rows = this.state.rowData.filter( row => !selected.some( srow => _.isEqual(srow, row)));
    console.log(rows);
    this.setState({ rowData: rows });
  }

  render() {
    return (
      <div>
        <input type='text' onChange={this._onAddColumnNameChange} value={this.state.newColumnName}></input>
        <button onClick={this._addColumn}>Add Column</button>
        <button onClick={ _ => this.api.deselectAll()}>Deselect All</button>
        <button onClick={this._addRow}>Add Row</button>
        <button onClick={this._exportToCsv}>Export</button>
        <button onClick={this._printSelected}>Print Selected</button>
        <button onClick={this._deleteSelected}>Delete</button>
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
