import React, { Component } from 'react';
import { connect } from 'react-redux';

class EmailPanel extends Component {
  constructor(props) {
  }

  render() {
    return (<div>
      
    </div>);
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
)(EmailPanel);

