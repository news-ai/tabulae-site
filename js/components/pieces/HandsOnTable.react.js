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
            ["2008", 10, 11, 12, 13],
            ["2009", 20, 11, 14, 13],
            ["2010", 30, 15, 12, 13],
         ],
        colHeaders: ['Year', 'Maserati', 'Mazda', 'Mercedes', 'Mini'],
      }
    };
  }

  componentDidMount() {
    const elm = ReactDOM.findDOMNode(this);
    this.table = new Handsontable(elm, this.state.options);
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
