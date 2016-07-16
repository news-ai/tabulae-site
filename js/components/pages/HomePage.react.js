import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/AppActions';
import ReactDataGrid from 'react-data-grid';
import ReactDataGridPlugins from 'react-data-grid/addons';


import 'react-data-grid/themes/react-data-grid.css';

//helper to generate a random date
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
}

//helper to create a fixed number of rows
function createRows(numberOfRows){
  var _rows = [];
  for (var i = 1; i < numberOfRows; i++) {
    _rows.push({
      id: i,
      task: 'Task ' + i,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority : ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
      issueType : ['Bug', 'Improvement', 'Epic', 'Story'][Math.floor((Math.random() * 3) + 1)],
      startDate: randomDate(new Date(2015, 3, 1), new Date()),
      completeDate: randomDate(new Date(), new Date(2016, 0, 1))
    });
  }
  return _rows;
}

//function to retrieve a row for a given index
var rowGetter = function(i){
  return _rows[i];
};

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.rowGetter = this.rowGetter.bind(this);
    this.handleRowUpdated = this.handleRowUpdated.bind(this);
    this.state = {
      rows: createRows(1000),
      columns: [
        {
          key: 'id',
          name: 'ID',
          width: 80
        },
        {
          key: 'task',
          name: 'Title',
          editable : true
        },
        {
          key: 'priority',
          name: 'Priority',
          editable : true
        },
        {
          key: 'issueType',
          name: 'Issue Type',
          editable : true
        },
        {
          key: 'complete',
          name: '% Complete',
          editable : true
        },
        {
          key: 'startDate',
          name: 'Start Date',
          editable : true
        },
        {
          key: 'completeDate',
          name: 'Expected Complete',
          editable : true
        }
      ]
    }
  }

  rowGetter(rowIdx) {
    return this.state.rows[rowIdx]
  }

  handleRowUpdated(e) {
    //merge updated row with current row and rerender by setting state
    var rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({rows:rows});
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
        <div>
        HELLO HOMEPAGE
        <ReactDataGrid
        enableCellSelect={true}
        columns={this.state.columns}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        minHeight={500}
        onRowUpdated={this.handleRowUpdated} />
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
