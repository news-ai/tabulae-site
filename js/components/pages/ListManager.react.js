import React, { Component } from 'react';
import * as actionCreators from '../../actions/AppActions';
import { connect } from 'react-redux';

class ListManager extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div className='container'>
      LIST
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
  };
};

export default connect(mapStateToProps)(ListManager);