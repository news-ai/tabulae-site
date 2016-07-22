import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';

import 'handsontable/dist/handsontable.full.css';

class HandsOnTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        data: [
            ['Julie', 'Pan', 'julie.yc.pan@gmail.com', 'wha', 13],
            ['2009', 20, 11, 14, 13],
            ['2010', 30, 15, 12, 13],
         ],
        colHeaders: [
        'First Name',
        'Last Name',
        'Email',
        'LinkedIn',
        'Twitter',
        'Instagram'
        ],
        minSpareCols: 5,
        minSpareRows: 20,
        manualColumnMove: true,
        manualRowMove: true,
        afterChange: function(changes, source) {
          console.log(this.getSettings().data);
        }
      }
    };
  }

  componentDidMount() {
    this.table = new Handsontable(ReactDOM.findDOMNode(this), this.state.options);
  }

  componentWillReceiveProps(nextProps) {
    const { ...options } = nextProps;
    this.setState({ options: Object.assign(this.state.options, options) });
  }

  componentDidUpdate() {
    this.table.updateSettings(this.state.options);
  }


  render() {
    return (
      <div>
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
  mapDispatchToProps
)(HandsOnTable);
