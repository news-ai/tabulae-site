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
    this._deleteColumn = this._deleteColumn.bind(this);
    this._renderHeaderCell = this._renderHeaderCell.bind(this);
    this._onAddColumnNameChange = this._onAddColumnNameChange.bind(this);
    this.state = {
      newColumnName: '',
      columnDefs: [
        {headerName: 'Make', field: 'make', editable: true},
        {headerName: 'Model', field: 'model', editable: true},
        {headerName: 'Price', field: 'price', editable: true}
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
    // column name already exists
    if (this.state.columnDefs.some( col => col.headerName === this.state.newColumnName)) {
      console.log('dupe');
      return;
    }
    let columns = this.state.columnDefs.concat({
      headerName: this.state.newColumnName,
      field: this.state.newColumnName,
      editable: true,
      headerCellTemplate: this._renderHeaderCell
    });
    this.setState({
      columnDefs: columns,
      newColumnName: ''
    });
  }

  _onAddColumnNameChange(e) { this.setState({ newColumnName: e.target.value }); }

  render() {
    return (
      <div>
        <input type='text' onChange={this._onAddColumnNameChange} value={this.state.newColumnName}></input>
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
